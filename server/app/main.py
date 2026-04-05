from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.routes import router
from app.db.postgres import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(router, prefix="/api")

