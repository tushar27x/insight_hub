from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.db.postgres import init_db
from app.core.config import FRONTEND_URL
from fastapi_limiter import FastAPILimiter
from app.db.redis import redis_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    await FastAPILimiter.init(redis_client)
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

