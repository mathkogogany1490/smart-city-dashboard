from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

KST = ZoneInfo("Asia/Seoul")


def now_kst() -> datetime:
    return datetime.now(KST)


def window(days: int, end: datetime | None = None) -> tuple[datetime, datetime]:
    end_at = end or now_kst()
    return end_at - timedelta(days=days), end_at
