from datetime import datetime, UTC
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.db.redis import get_redis
from app.core.config import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, FRONTEND_URL, BACKEND_URL, ENV
from urllib.parse import urlencode
from app.models.user import UserInsights, UserTemplates
from app.core.security import create_access_token
from app.services.github_service import fetch_github_stats
from app.services.insights_service import calculate_user_insights 
from app.core.security import decode_access_token
from app.services.ai_service import generate_roast
import secrets
import httpx


router = APIRouter()


def _backend_base_url(request: Request) -> str:
    configured = (BACKEND_URL or "").strip().rstrip("/")
    if configured:
        return configured

    forwarded_proto = request.headers.get("x-forwarded-proto")
    forwarded_host = request.headers.get("x-forwarded-host")
    if forwarded_proto and forwarded_host:
        return f"{forwarded_proto}://{forwarded_host}".rstrip("/")

    return str(request.base_url).rstrip("/")

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
async def login(request: Request):
    state = secrets.token_urlsafe(32)
    callback_url = f"{_backend_base_url(request)}/api/auth/callback"

    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": callback_url,
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
        secure = ENV == "production"  # Only True in production (HTTPS)  
    )
    return response

@router.get("/auth/callback")
async def callback(request: Request, code: str, state: str, 
                   db: AsyncSession = Depends(get_db)):
    # 1. Verify State from Cookie
    cookie_state = request.cookies.get("oauth_state")  
    if not cookie_state or cookie_state != state:
        raise HTTPException(status_code=400, detail="Invalid state")
    
    async with httpx.AsyncClient() as client:
        callback_url = f"{_backend_base_url(request)}/api/auth/callback"
        # 2. Exchange Code for GITHUB Token
        token_url = "https://github.com/login/oauth/access_token"
        payload = {
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": callback_url
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
        
        github_stats = await fetch_github_stats(github_token, github_login)
        processed_insights = calculate_user_insights(github_stats)
        
        stmt = select(UserInsights).where(UserInsights.user_id == github_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            user.user_name = github_login
            user.archetype = processed_insights["archetype"]
            user.updated_at = datetime.now(UTC).replace(tzinfo=None)
        else:
            user = UserInsights(user_id=github_id, user_name=github_login)
            user.archetype = processed_insights["archetype"]
            db.add(user)
        
        template_stmt = select(UserTemplates).where(UserTemplates.user_id == github_id)
        template_res = await db.execute(template_stmt)
        template = template_res.scalar_one_or_none()
        
        # Parallel AI generation
        ai_roast_task = generate_roast(processed_insights["stats"], user.archetype)
        weekly_review_task = generate_weekly_review(processed_insights["stats"])
        ai_roast, weekly_review = await asyncio.gather(ai_roast_task, weekly_review_task)

        if template:
            template.stats_json = processed_insights["stats"]
            template.display_json = ai_roast if ai_roast else {}
            template.weekly_review = weekly_review
        else:
            template = UserTemplates(user_id = github_id,
                                    stats_json = processed_insights["stats"],
                                    display_json = ai_roast if ai_roast else {},
                                    weekly_review = weekly_review)
            db.add(template) 
    
        
        await db.commit()
        
        # 5. Generate our OWN App Token for the session
        app_token = create_access_token(
            data={"sub": str(github_id), "name": github_login}
        )

        # 6. Build Response and Redirect with Token in URL (Cross-Domain Fix)
        response = RedirectResponse(url=f"{FRONTEND_URL}/dashboard?token={app_token}")
        response.delete_cookie("oauth_state")

        return response

@router.get("/auth/logout")
async def logout():
    response = RedirectResponse(url=FRONTEND_URL)
    response.delete_cookie("session_token")
    return response

@router.get("/user/insights")
async def get_user_insights(
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis = Depends(get_redis)
):
    # 1. Try to get token from Authorization header
    auth_header = request.headers.get("Authorization")
    token = None
    
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    else:
        # 2. Fallback to cookie
        token = request.cookies.get("session_token")
        
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Session")
    
    user_id = int(payload.get("sub"))
    cached_key = f"user_insights:{user_id}"
    cached_data = await redis.get(cached_key)

    if cached_data:
        return json.loads(cached_data)
    
    stmt = select(UserInsights).where(UserInsights.user_id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    days_since_update = (datetime.now(UTC) - user.updated_at.replace(tzinfo=UTC)).days
    
    if days_since_update > 7:
        print(f"Data for {user.user_name} is stale {days_since_update} days old")
    
    template_stmt = select(UserTemplates).where(UserTemplates.user_id == user_id)
    template_res = await db.execute(template_stmt)
    template = template_res.scalar_one_or_none()
    
    response_data =  {
        "user_name": user.user_name,
        "archetype": user.archetype,
        "stats": template.stats_json if template else {},
        "display_json": template.display_json if template else {},
        "weekly_review": template.weekly_review if template else None,
        "updated_at": user.updated_at.isoformat()
    }
    await redis.setex(cached_key, 3600*24, json.dumps(response_data, default=str))
    return response_data
