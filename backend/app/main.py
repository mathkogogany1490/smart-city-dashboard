import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.seed import seed_if_empty
from app.services.realtime import realtime_loop
from app.web.router import api
from app.web.ws import router as ws_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        seed_if_empty(session)
    stop = asyncio.Event()
    task = asyncio.create_task(realtime_loop(stop))
    try:
        yield
    finally:
        stop.set()
        await task


app = FastAPI(title="스마트시정 API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api, prefix="/api")
app.include_router(ws_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "스마트시정 API", "docs": "/docs", "health": "/api/health"}
