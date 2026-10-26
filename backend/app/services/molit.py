import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

import httpx

from app.core.timeutil import now_kst

logger = logging.getLogger("smartcity.molit")

_TRADE_URL = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade"
_SIHEUNG_CODE = "41390"
_cache: tuple[float, dict] | None = None


def _month_start(value: datetime) -> datetime:
    return value.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _previous_month(value: datetime) -> datetime:
    return _month_start(value) - timedelta(days=1)


def _amount(text: str | None) -> int:
    if not text:
        return 0
    digits = text.replace(",", "").strip()
    return int(digits) if digits.isdigit() else 0


def _item(node: ET.Element) -> dict[str, str]:
    return {child.tag: (child.text or "").strip() for child in list(node)}


async def _fetch_page(client: httpx.AsyncClient, service_key: str, deal_ymd: str, page: int) -> ET.Element:
    response = await client.get(
        _TRADE_URL,
        params={
            "serviceKey": service_key,
            "LAWD_CD": _SIHEUNG_CODE,
            "DEAL_YMD": deal_ymd,
            "numOfRows": 1000,
            "pageNo": page,
        },
    )
    response.raise_for_status()
    return ET.fromstring(response.text)


async def fetch_siheung_trades(service_key: str) -> dict | None:
    global _cache
    now = now_kst().timestamp()
    if _cache and now < _cache[0]:
        return _cache[1]

    cursor = now_kst()
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            for _ in range(6):
                deal_ymd = f"{cursor.year}{cursor.month:02d}"
                first = await _fetch_page(client, service_key, deal_ymd, 1)
                code = first.findtext(".//resultCode")
                if code not in {"00", "000"}:
                    logger.warning("국토부 실거래 응답 코드 %s", code)
                    return None
                total = int(first.findtext(".//totalCount") or "0")
                if total == 0:
                    cursor = _previous_month(cursor)
                    continue
                nodes = first.findall(".//item")
                page = 2
                while len(nodes) < total and page <= 5:
                    extra = await _fetch_page(client, service_key, deal_ymd, page)
                    nodes.extend(extra.findall(".//item"))
                    page += 1
                payload = _summarize(nodes, cursor.year, cursor.month, total)
                _cache = (now + 1800, payload)
                return payload
    except Exception:
        logger.warning("국토부 실거래 조회에 실패했습니다.", exc_info=True)
        return None
    return None


def _summarize(nodes: list[ET.Element], year: int, month: int, total: int) -> dict:
    trades: list[dict] = []
    grouped: dict[str, list[int]] = {}
    for node in nodes:
        raw = _item(node)
        amount = _amount(raw.get("dealAmount"))
        district = raw.get("umdNm") or "기타"
        if amount:
            grouped.setdefault(district, []).append(amount)
        deal_month = raw.get("dealMonth") or str(month)
        deal_day = raw.get("dealDay") or "1"
        trades.append(
            {
                "apartment": raw.get("aptNm") or "아파트",
                "district": district,
                "amount_manwon": amount,
                "area_m2": float(raw.get("excluUseAr") or 0),
                "floor": raw.get("floor") or "",
                "contract_on": (int(raw.get("dealYear") or year), int(deal_month), int(deal_day)),
            }
        )
    trades.sort(key=lambda row: row["contract_on"], reverse=True)
    districts = [
        {
            "name": name,
            "count": len(amounts),
            "average_manwon": round(sum(amounts) / len(amounts)),
        }
        for name, amounts in grouped.items()
    ]
    districts.sort(key=lambda row: row["count"], reverse=True)
    recent = []
    for row in trades[:12]:
        contract_year, contract_month, contract_day = row["contract_on"]
        recent.append(
            {
                "apartment": row["apartment"],
                "district": row["district"],
                "amount_manwon": row["amount_manwon"],
                "area_m2": row["area_m2"],
                "floor": row["floor"],
                "contract_date": f"{contract_year}.{contract_month:02d}.{contract_day:02d}",
            }
        )
    return {
        "month": f"{year}년 {month}월",
        "total": total,
        "districts": districts[:8],
        "trades": recent,
    }
