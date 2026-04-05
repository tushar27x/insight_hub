from datetime import datetime, UTC
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.db.redis import get_redis
from app.core.config import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
from urllib.parse import urlencode
from app.models.user import UserInsights
from app.core.security import create_access_token
import secrets
import httpx

router = APIRouter()

@router.get("/")
async def test(db: AsyncSession = Depends(get_db),
               redis = Depends(get_redis)):
    
    await redis.set("ping", "pong")
    val = await redis.get("ping")
    
    result = await db.execute(text("SELECT 1"))
    
    return {
        "redis": val,
        "postgres": result.scalar()
    }
    
@router.get("/auth/login")
async def login():
    state = secrets.token_urlsafe(32)

    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": "http://localhost:8000/api/auth/callback",
        "scope": "read:user repo",
        "state": state
    }
    
    github_auth_url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    
    response = RedirectResponse(github_auth_url)
    response.set_cookie(
        key = "oauth_state",
        value = state, 
        httponly = True,
        max_age = 600,
        samesite = "lax",
        secure = False  # set True in production (HTTPS)  
    )
    return response

@router.get("/auth/callback")
async def callback(request: Request, code: str, state: str, 
                   db: AsyncSession = Depends(get_db)):
    # 1. Verify State from Cookie
    cookie_state = request.cookies.get("oauth_state")
    print(f"Cookie state: {cookie_state}, Query state: {state}")  # Add this    
    if not cookie_state or cookie_state != state:
        raise HTTPException(status_code=400, detail="Invalid state")
    
    async with httpx.AsyncClient() as client:
        # 2. Exchange Code for GITHUB Token
        token_url = "https://github.com/login/oauth/access_token"
        payload = {
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": "http://localhost:8000/api/auth/callback"
        }
        headers = {"Accept": "application/json"}
        
        token_response = await client.post(token_url, data=payload, headers=headers)
        token_data = token_response.json()
        print("GitHub token response:", token_data)
        github_token = token_data.get("access_token")
        
        if not github_token:
            raise HTTPException(
                status_code=400, 
                detail=f"GitHub token error: {token_data}"  # show actual error
            )        
        # 3. Fetch User Data from GitHub using github_token
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {github_token}"}
        )
        user_data = user_response.json()
        github_id = user_data.get("id")
        github_login = user_data.get("login")

        if not github_id or not github_login:
            raise HTTPException(status_code=400, detail="Failed to fetch user data from GitHub")

        # 4. Database Sync (Upsert)
        stmt = select(UserInsights).where(UserInsights.user_id == github_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            user.user_name = github_login
            user.updated_at = datetime.now(UTC)
        else:
            user = UserInsights(user_id=github_id, user_name=github_login)
            db.add(user)
        
        await db.commit()
        
        # 5. Generate our OWN App Token for the session
        app_token = create_access_token(
            data={"sub": str(github_id), "name": github_login}
        )
        
        # 6. Build Response and Set Session Cookie
        response = RedirectResponse(url="http://localhost:3000/dashboard")
        response.set_cookie(
            key="session_token",
            value=app_token,
            httponly=True,
            max_age=3600 * 24, # 24 hours
            samesite="lax",
            secure=False # Set to True in production (HTTPS)
        )
        response.delete_cookie("oauth_state")
        
        return response
