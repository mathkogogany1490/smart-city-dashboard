import asyncio
import logging

from fastapi import WebSocket

from app.core.config import settings
from app.core.database import SessionLocal
from app.repositories.dashboard_repository import DashboardRepository
from app.services.dashboard_service import DashboardService

logger = logging.getLogger("smartcity.realtime")


class ConnectionManager:
    def __init__(self) -> None:
        self.connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, payload: dict) -> None:
        stale: list[WebSocket] = []
        for websocket in self.connections:
            try:
                await websocket.send_json(payload)
            except Exception:
                stale.append(websocket)
        for websocket in stale:
            self.disconnect(websocket)


manager = ConnectionManager()


def publish_complaint() -> dict:
    with SessionLocal() as session:
        service = DashboardService(DashboardRepository(session))
        return service.create_random_complaint().model_dump(mode="json")


async def realtime_loop(stop: asyncio.Event) -> None:
    while not stop.is_set():
        try:
            await asyncio.wait_for(stop.wait(), timeout=settings.realtime_interval_seconds)
            return
        except TimeoutError:
            pass
        try:
            complaint = await asyncio.to_thread(publish_complaint)
            await manager.broadcast({"type": "complaint.created", "complaint": complaint})
        except Exception:
            logger.exception("실시간 민원 반영에 실패했습니다.")
