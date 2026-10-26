import logging
import random
from datetime import date, timedelta

from sqlalchemy import func, insert, select
from sqlalchemy.orm import Session

from app.core.constants import COMPLAINT_TITLES
from app.core.timeutil import now_kst
from app.models import (
    Area,
    CityProfile,
    Complaint,
    Department,
    District,
    JobGoal,
    NewsItem,
    PledgeGoal,
    PopulationStat,
    SnsPost,
)

logger = logging.getLogger("smartcity.seed")

DEPARTMENTS = [
    ("교통행정과", 1248),
    ("도시개발과", 862),
    ("건축디자인과", 645),
    ("환경보전과", 512),
    ("청소행정과", 431),
    ("복지정책과", 389),
    ("교육청소년과", 312),
    ("민원지적과", 278),
    ("세원관리과", 231),
    ("기획예산과", 187),
]

AREAS = [
    ("baegot", "배곧", 130, 145, 1, "M55,100 C90,40 190,30 230,85 C255,120 240,185 185,215 C115,250 45,210 35,150 C28,118 38,112 55,100 Z"),
    ("jeongwang", "정왕", 330, 130, 2, "M190,70 C260,25 400,20 460,80 C490,115 470,185 400,210 C310,240 210,200 190,140 C180,105 175,85 190,70 Z"),
    ("yeonseong", "연성", 500, 155, 3, "M410,75 C470,35 575,50 595,120 C610,175 565,235 490,250 C420,262 385,210 395,150 C400,110 390,88 410,75 Z"),
    ("mokgam", "목감", 105, 305, 4, "M30,200 C85,165 160,185 185,250 C200,310 165,385 95,405 C30,420 5,345 15,270 C20,230 18,215 30,200 Z"),
    ("wolgot", "월곶", 270, 325, 5, "M155,200 C230,165 340,185 375,255 C400,320 360,410 270,435 C180,455 130,385 140,305 C145,250 140,215 155,200 Z"),
    ("gwarim", "과림", 460, 315, 6, "M350,190 C430,165 545,190 570,265 C590,330 540,405 450,415 C370,422 330,355 340,280 C345,235 340,205 350,190 Z"),
    ("yeongwak", "연곽", 140, 485, 7, "M55,380 C120,350 200,375 220,445 C235,510 170,575 95,560 C30,545 15,470 35,415 C42,395 45,388 55,380 Z"),
    ("neunggok", "능곡", 385, 505, 8, "M250,400 C340,365 460,385 500,450 C525,505 480,585 385,600 C290,612 230,550 235,480 C238,440 240,415 250,400 Z"),
]

# area, name, age parts, change %, density, issues, priority, chart, order
DISTRICTS = [
    ("baegot", "배곧동", (8200, 39800, 4841), 2.7, 6128, "교통혼잡 · 학교시설", True, True, 1),
    ("jeongwang", "정왕1동", (2800, 13200, 2200), 0.6, 8020, "공장 소음 · 배차", False, True, 2),
    ("jeongwang", "정왕2동", (2500, 12100, 2200), 0.8, 7650, "임대주택 · 안전", False, True, 3),
    ("jeongwang", "정왕3동", (5400, 26500, 3719), 1.4, 6890, "주거환경 · 상가", False, True, 4),
    ("jeongwang", "정왕4동", (6100, 31200, 4432), 1.8, 7340, "산업단지 교통 · 주차", False, True, 5),
    ("gwarim", "과림동", (2100, 10800, 2300), 1.1, 3560, "침수 대비 · 도로", False, True, 6),
    ("yeonseong", "연성동", (4100, 21400, 3446), 2.1, 4520, "공원 조성 · 통학로", False, True, 7),
    ("neunggok", "능곡동", (1600, 8600, 1900), 1.3, 3120, "마을버스 · 복지", False, True, 8),
    ("wolgot", "월곶동", (2900, 14500, 2400), 0.9, 3980, "해안 접근 · 주차", False, True, 9),
    ("mokgam", "목감동", (3800, 17800, 2503), 3.2, 5110, "신도시 기반시설", False, False, 0),
    ("yeongwak", "연곽동", (1800, 9600, 2000), 1.5, 2890, "보행환경 · 민원", False, False, 0),
]


def portions(total: int, weights: list[int]) -> list[int]:
    if not weights:
        return []
    if total <= 0:
        return [0] * len(weights)
    weight_sum = sum(weights)
    if weight_sum <= 0:
        return [0] * len(weights)
    raw = [total * weight / weight_sum for weight in weights]
    floors = [int(value) for value in raw]
    remain = total - sum(floors)
    order = sorted(
        range(len(weights)),
        key=lambda index: (raw[index] - floors[index], weights[index]),
        reverse=True,
    )
    for index in range(remain):
        floors[order[index % len(floors)]] += 1
    return floors


def split_to_total(parts: tuple[int, int, int], total: int) -> tuple[int, int, int]:
    current = sum(parts)
    if current <= 0:
        return (0, 0, 0)
    raw = [part * total / current for part in parts]
    floors = [int(value) for value in raw]
    remain = total - sum(floors)
    order = sorted(range(3), key=lambda index: raw[index] - floors[index], reverse=True)
    for index in range(remain):
        floors[order[index]] += 1
    return floors[0], floors[1], floors[2]


def earlier_total(population: int, change: float, steps: int) -> int:
    total = population
    for _ in range(steps):
        total = round(total / (1 + change / 100))
    return total


def seed_if_empty(session: Session) -> None:
    count = session.scalar(select(func.count()).select_from(Area)) or 0
    if count:
        return
    seed(session)


def seed(session: Session) -> None:
    try:
        _seed(session)
        session.commit()
    except Exception:
        session.rollback()
        raise


def _seed(session: Session) -> None:
    rng = random.Random(42)
    area_rows: dict[str, Area] = {}
    for code, name, label_x, label_y, sort_order, svg_path in AREAS:
        area = Area(
            code=code,
            name=name,
            label_x=label_x,
            label_y=label_y,
            sort_order=sort_order,
            svg_path=svg_path,
        )
        session.add(area)
        area_rows[code] = area
    session.flush()

    district_rows: dict[str, District] = {}
    for area_code, name, parts, change, density, issues, priority, chart, chart_order in DISTRICTS:
        district = District(
            area_id=area_rows[area_code].id,
            name=name,
            population=sum(parts),
            population_change_pct=change,
            density=density,
            focus_issues=issues,
            is_priority=priority,
            show_in_chart=chart,
            chart_order=chart_order,
        )
        session.add(district)
        district_rows[name] = district
        for steps, year in ((0, 2024), (1, 2023), (2, 2022)):
            age_0_14, age_15_64, age_65_plus = split_to_total(parts, earlier_total(sum(parts), change, steps))
            session.add(
                PopulationStat(
                    district=district,
                    year=year,
                    age_0_14=age_0_14,
                    age_15_64=age_15_64,
                    age_65_plus=age_65_plus,
                )
            )
    session.flush()

    departments: list[Department] = []
    for index, (name, weight) in enumerate(DEPARTMENTS, start=1):
        department = Department(name=name, sort_order=index, weight=weight)
        session.add(department)
        departments.append(department)
    session.flush()

    for index, (name, rate) in enumerate(
        (("일반일자리", 68.4), ("노인일자리", 77.1), ("장애인일자리", 64.8), ("청년일자리", 71.3)),
        start=1,
    ):
        session.add(JobGoal(name=name, achievement_rate=rate, year=2024, sort_order=index))

    for index, (category, rate, icon) in enumerate(
        (
            ("교육", 72, "education"),
            ("경제", 65, "economy"),
            ("복지", 78, "welfare"),
            ("도시", 68, "city"),
            ("환경", 71, "environment"),
            ("안전", 83, "safety"),
        ),
        start=1,
    ):
        session.add(PledgeGoal(category=category, achievement_rate=rate, year=2024, icon=icon, sort_order=index))

    youtube = [
        ("시흥 스마트시티 추진 현황과 미래 비전", "2:35", "1.2천 views", "2일 전", "sky"),
        ("배곧동 스마트 복지센터 둘러보기", "3:18", "856 views", "5일 전", "park"),
        ("시흥시 청년일자리 지원 사업 안내", "1:52", "643 views", "1주 전", "night"),
    ]
    blog = [
        ("봄철 미세먼지 대응과 생활 수칙", None, "412 views", "3일 전", "sky"),
        ("배곧 스마트시티 리빙랩 참여 후기", None, "268 views", "6일 전", "park"),
        ("청년 월세 지원, 이렇게 신청하세요", None, "531 views", "1주 전", "night"),
    ]
    for channel, posts in (("youtube", youtube), ("blog", blog)):
        for index, (title, duration, views, published, accent) in enumerate(posts, start=1):
            session.add(
                SnsPost(
                    channel=channel,
                    title=title,
                    duration=duration,
                    views_label=views,
                    published_label=published,
                    accent=accent,
                    sort_order=index,
                )
            )

    news = [
        ("시흥시, 스마트 교통체계 구축으로 교통혼잡 개선", date(2024, 5, 20), "city"),
        ("2024 시흥시 청렴정책 아이디어 공모전 개최", date(2024, 5, 17), "night"),
        ("시흥시, 환경교육 도시 도약을 위한 업무협약 체결", date(2024, 5, 14), "park"),
        ("시흥시, 배곧동 학교복합시설 건립 협의", date(2024, 5, 10), "city"),
        ("시흥시 공유모빌리티 스테이션 12곳 추가", date(2024, 5, 8), "sky"),
        ("월곶 해안 보행교 야간 경관 개선", date(2024, 5, 2), "night"),
    ]
    for title, published_on, accent in news:
        session.add(NewsItem(title=title, published_on=published_on, accent=accent))

    session.add(CityProfile(name="시흥시"))
    session.flush()

    now = now_kst()
    current_start = now - timedelta(days=30) + timedelta(hours=1)
    current_end = now - timedelta(minutes=1)
    prev_start = now - timedelta(days=60) + timedelta(hours=1)
    prev_end = now - timedelta(days=30) - timedelta(minutes=1)
    weights = [weight for _, weight in DEPARTMENTS]
    other_names = [name for name in district_rows if name != "배곧동"]
    other_weights = [district_rows[name].population for name in other_names]
    baegot_parts = portions(312, weights)

    rows: list[dict] = []
    dept_current = [0] * len(departments)
    baegot_current = 0
    current_by_district: dict[int, int] = {}

    def add(department_id: int, district_id: int, count: int, start, end, track: bool) -> None:
        span = max(int((end - start).total_seconds()), 1)
        for _ in range(count):
            rows.append(
                {
                    "department_id": department_id,
                    "district_id": district_id,
                    "title": rng.choice(COMPLAINT_TITLES),
                    "created_at": start + timedelta(seconds=rng.randrange(span)),
                }
            )
        if track:
            current_by_district[district_id] = current_by_district.get(district_id, 0) + count

    for index, department in enumerate(departments):
        baegot_count = baegot_parts[index]
        rest = DEPARTMENTS[index][1] - baegot_count
        allocation = portions(rest, other_weights)
        baegot_id = district_rows["배곧동"].id
        add(department.id, baegot_id, baegot_count, current_start, current_end, True)
        baegot_current += baegot_count
        dept_current[index] += baegot_count
        for name, count in zip(other_names, allocation, strict=True):
            add(department.id, district_rows[name].id, count, current_start, current_end, True)
            dept_current[index] += count

    if baegot_current != 312:
        raise RuntimeError(f"배곧 민원 수가 {baegot_current}건입니다.")
    for index, (_, expected) in enumerate(DEPARTMENTS):
        if dept_current[index] != expected:
            raise RuntimeError(f"{DEPARTMENTS[index][0]} 민원 수가 {dept_current[index]}건입니다.")

    for name in other_names:
        district = district_rows[name]
        previous = round(current_by_district.get(district.id, 0) * 0.94)
        for department, count in zip(departments, portions(previous, [1] * len(departments)), strict=True):
            add(department.id, district.id, count, prev_start, prev_end, False)
    for department, count in zip(departments, portions(288, weights), strict=True):
        add(department.id, district_rows["배곧동"].id, count, prev_start, prev_end, False)

    for offset in range(0, len(rows), 2000):
        session.execute(insert(Complaint), rows[offset : offset + 2000])
    logger.info("시드 완료: 민원 %s건", len(rows))


def main() -> None:
    from app.core.database import Base, SessionLocal, engine

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        seed(session)


if __name__ == "__main__":
    main()
