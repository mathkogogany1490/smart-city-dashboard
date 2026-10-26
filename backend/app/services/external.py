import logging
import re
from datetime import datetime

import httpx

from app.core.config import settings
from app.core.timeutil import KST, now_kst
from app.schemas.dashboard import SnsPostOut

logger = logging.getLogger("smartcity.external")

_weather_cache: tuple[float, tuple[str, float, str]] | None = None
_youtube_cache: tuple[float, list[SnsPostOut]] | None = None


def _weather_label(code: int) -> str:
    if code == 0:
        return "맑음"
    if code in (1, 2):
        return "구름 조금"
    if code == 3:
        return "흐림"
    if code in (45, 48):
        return "안개"
    if code in (51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82):
        return "비"
    if code in (71, 73, 75, 77, 85, 86):
        return "눈"
    if code in (95, 96, 99):
        return "뇌우"
    return "흐림"


def _views_label(count: int) -> str:
    if count >= 10000:
        return f"{count / 10000:.1f}만 views"
    if count >= 1000:
        return f"{count / 1000:.1f}천 views"
    return f"{count} views"


def _relative_korean(iso: str) -> str:
    parsed = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(KST)
    minutes = int((now_kst() - parsed).total_seconds() // 60)
    if minutes < 60:
        return f"{max(minutes, 1)}분 전"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}시간 전"
    days = hours // 24
    if days < 7:
        return f"{days}일 전"
    weeks = days // 7
    if weeks < 5:
        return f"{weeks}주 전"
    return parsed.strftime("%Y.%m.%d")


def _duration(value: str | None) -> str | None:
    if not value:
        return None
    match = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", value)
    if not match:
        return None
    hours, minutes, seconds = (int(part) if part else 0 for part in match.groups())
    if hours:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    return f"{minutes}:{seconds:02d}"


async def fetch_weather() -> tuple[str, float, str]:
    global _weather_cache
    now = now_kst().timestamp()
    if _weather_cache and now < _weather_cache[0]:
        return _weather_cache[1]

    try:
        async with httpx.AsyncClient(timeout=3.0, follow_redirects=True) as client:
            if settings.weather_api_key.strip():
                response = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params={
                        "lat": settings.weather_latitude,
                        "lon": settings.weather_longitude,
                        "appid": settings.weather_api_key.strip(),
                        "units": "metric",
                        "lang": "kr",
                    },
                )
                response.raise_for_status()
                payload = response.json()
                result = (
                    payload["weather"][0]["description"],
                    round(float(payload["main"]["temp"]), 1),
                    "openweather",
                )
            else:
                response = await client.get(
                    "https://api.open-meteo.com/v1/forecast",
                    params={
                        "latitude": settings.weather_latitude,
                        "longitude": settings.weather_longitude,
                        "current": "temperature_2m,weather_code",
                        "timezone": "Asia/Seoul",
                    },
                    headers={"User-Agent": "smart-city-dashboard"},
                )
                response.raise_for_status()
                current = response.json()["current"]
                result = (
                    _weather_label(int(current["weather_code"])),
                    round(float(current["temperature_2m"]), 1),
                    "open-meteo",
                )
    except Exception:
        logger.warning("날씨 API 조회에 실패해 기본값을 사용합니다.", exc_info=True)
        result = ("맑음", 24.0, "기본값")
        _weather_cache = (now + 60, result)
        return result

    _weather_cache = (now + 600, result)
    return result


async def fetch_youtube(api_key: str) -> list[SnsPostOut] | None:
    global _youtube_cache
    now = now_kst().timestamp()
    if _youtube_cache and now < _youtube_cache[0]:
        return _youtube_cache[1]

    accents = ["sky", "park", "night"]
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            search = await client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet",
                    "q": "시흥시",
                    "type": "video",
                    "maxResults": 3,
                    "order": "date",
                    "regionCode": "KR",
                    "key": api_key,
                },
            )
            search.raise_for_status()
            items = search.json().get("items", [])
            video_ids = [item["id"]["videoId"] for item in items if item.get("id", {}).get("videoId")]
            details: dict[str, dict] = {}
            if video_ids:
                videos = await client.get(
                    "https://www.googleapis.com/youtube/v3/videos",
                    params={
                        "part": "contentDetails,statistics",
                        "id": ",".join(video_ids),
                        "key": api_key,
                    },
                )
                videos.raise_for_status()
                details = {item["id"]: item for item in videos.json().get("items", [])}

        posts: list[SnsPostOut] = []
        for index, item in enumerate(items):
            video_id = item.get("id", {}).get("videoId")
            if not video_id:
                continue
            snippet = item["snippet"]
            extra = details.get(video_id, {})
            views = int(extra.get("statistics", {}).get("viewCount", 0))
            thumbs = snippet.get("thumbnails") or {}
            thumbnail = (thumbs.get("high") or thumbs.get("medium") or thumbs.get("default") or {}).get("url")
            posts.append(
                SnsPostOut(
                    id=index + 1,
                    channel="youtube",
                    title=snippet.get("title", "시흥시 영상"),
                    duration=_duration(extra.get("contentDetails", {}).get("duration")),
                    views_label=_views_label(views),
                    published_label=_relative_korean(snippet["publishedAt"]),
                    accent=accents[index % len(accents)],
                    video_id=video_id,
                    thumbnail_url=thumbnail or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
                )
            )
        if not posts:
            return None
        _youtube_cache = (now + 600, posts)
        return posts
    except Exception:
        logger.warning("YouTube API 조회에 실패해 저장된 영상을 사용합니다.", exc_info=True)
        return None
