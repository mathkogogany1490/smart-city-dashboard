import random

from app.core.config import settings
from app.core.constants import COMPLAINT_TITLES
from app.core.timeutil import now_kst, window
from app.models import Complaint, Department
from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.dashboard import (
    AreaOut,
    CityStatusOut,
    ComplaintBar,
    ComplaintItem,
    ComplaintSummary,
    DensityItem,
    DistrictOut,
    DistrictPart,
    DistrictSummary,
    JobGoalOut,
    NewsOut,
    PledgeOut,
    PopulationItem,
    PopulationResponse,
    RankedDistrict,
    RealEstateOut,
    SnsPostOut,
)
from app.services.external import fetch_weather, fetch_youtube


def change_pct(current: int, previous: int) -> float:
    if previous == 0:
        return 0.0 if current == 0 else 100.0
    return round((current - previous) / previous * 100, 1)


def complaint_item(row: Complaint) -> ComplaintItem:
    return ComplaintItem(
        id=row.id,
        title=row.title,
        department=row.department.name,
        department_id=row.department_id,
        district=row.district.name,
        district_id=row.district_id,
        created_at=row.created_at,
    )


class DashboardService:
    def __init__(self, repo: DashboardRepository) -> None:
        self.repo = repo

    def ping(self) -> None:
        self.repo.ping()

    def areas(self) -> list[AreaOut]:
        result: list[AreaOut] = []
        for area in self.repo.list_areas():
            districts = list(area.districts)
            primary = max(districts, key=lambda district: (district.is_priority, district.population))
            result.append(
                AreaOut(
                    id=area.id,
                    code=area.code,
                    name=area.name,
                    svg_path=area.svg_path,
                    label_x=area.label_x,
                    label_y=area.label_y,
                    primary_district_id=primary.id,
                    district_ids=[district.id for district in districts],
                    population=sum(district.population for district in districts),
                )
            )
        return result

    def districts(self) -> list[DistrictOut]:
        return [
            DistrictOut(
                id=district.id,
                name=district.name,
                area_id=district.area_id,
                area_code=district.area.code,
                area_name=district.area.name,
                population=district.population,
                population_change_pct=district.population_change_pct,
                density=district.density,
                focus_issues=district.focus_issues,
                is_priority=district.is_priority,
                show_in_chart=district.show_in_chart,
                chart_order=district.chart_order,
            )
            for district in self.repo.list_districts()
        ]

    def top_districts(self, limit: int) -> list[RankedDistrict]:
        return [
            RankedDistrict(
                rank=index,
                id=district.id,
                name=district.name,
                population=district.population,
                area_code=district.area.code,
            )
            for index, district in enumerate(self.repo.list_districts()[:limit], start=1)
        ]

    def district_summary(self, district_id: int, days: int) -> DistrictSummary:
        district = self.repo.get_district(district_id)
        if district is None:
            raise LookupError(district_id)
        start, end = window(days)
        prev_start, prev_end = window(days, end=start)
        current = self.repo.count_complaints(start, end, [district.id])
        previous = self.repo.count_complaints(prev_start, prev_end, [district.id])
        parts = sorted(district.area.districts, key=lambda item: item.population, reverse=True)
        return DistrictSummary(
            id=district.id,
            name=district.name,
            area_name=district.area.name,
            area_code=district.area.code,
            population=district.population,
            population_change_pct=district.population_change_pct,
            density=district.density,
            complaint_count=current,
            complaint_change_pct=change_pct(current, previous),
            focus_issues=district.focus_issues,
            is_priority=district.is_priority,
            parts=[DistrictPart(id=item.id, name=item.name, population=item.population) for item in parts],
        )

    def complaint_summary(self, days: int) -> ComplaintSummary:
        start, end = window(days)
        rows = self.repo.complaint_counts(start, end)
        items = [
            ComplaintBar(department_id=department.id, name=department.name, count=int(count))
            for department, count in rows
        ]
        return ComplaintSummary(days=days, total=sum(item.count for item in items), items=items)

    def recent_complaints(
        self,
        limit: int,
        department: str | None,
        district_id: int | None,
    ) -> list[ComplaintItem]:
        return [complaint_item(row) for row in self.repo.recent_complaints(limit, department, district_id)]

    def population(self, year: int) -> PopulationResponse:
        return PopulationResponse(
            year=year,
            years=self.repo.population_years(),
            items=[
                PopulationItem(
                    district_id=row.district_id,
                    name=row.district.name,
                    age_0_14=row.age_0_14,
                    age_15_64=row.age_15_64,
                    age_65_plus=row.age_65_plus,
                )
                for row in self.repo.population(year)
            ],
        )

    def jobs(self) -> list[JobGoalOut]:
        return [JobGoalOut.model_validate(row) for row in self.repo.jobs()]

    def pledges(self) -> list[PledgeOut]:
        return [PledgeOut.model_validate(row) for row in self.repo.pledges()]

    async def sns(self, channel: str) -> list[SnsPostOut]:
        api_key = settings.youtube_api_key.strip()
        if channel == "youtube" and api_key:
            live = await fetch_youtube(api_key)
            if live:
                return live
        return [SnsPostOut.model_validate(row) for row in self.repo.sns(channel)]

    def news(self, limit: int) -> list[NewsOut]:
        return [NewsOut.model_validate(row) for row in self.repo.news(limit)]

    async def city(self) -> CityStatusOut:
        profile = self.repo.city()
        weather, temperature, source = await fetch_weather()
        return CityStatusOut(
            name=profile.name if profile else "시흥시",
            weather=weather,
            temperature_c=temperature,
            observed_at=now_kst(),
            source=source,
        )

    def realestate(self) -> RealEstateOut:
        items = [
            DensityItem(id=district.id, name=district.name, density=district.density, population=district.population)
            for district in sorted(self.repo.list_districts(), key=lambda item: item.density, reverse=True)
        ]
        if settings.molit_api_key.strip():
            return RealEstateOut(
                connected=True,
                message="국토부 API 키가 설정되어 있습니다. 현재 화면은 동별 인구밀도를 보여 줍니다.",
                items=items,
            )
        return RealEstateOut(
            connected=False,
            message="실거래 시세는 .env의 MOLIT_API_KEY를 넣으면 연결할 수 있습니다. 지금은 인구밀도를 보여 줍니다.",
            items=items,
        )

    def create_random_complaint(self) -> ComplaintItem:
        departments = self.repo.list_departments()
        districts = self.repo.list_districts()
        if not departments or not districts:
            raise RuntimeError("기초 데이터가 없습니다.")
        picker = random.SystemRandom()
        department: Department = picker.choices(departments, weights=[item.weight for item in departments], k=1)[0]
        district = picker.choice(districts)
        row = self.repo.create_complaint(
            department.id,
            district.id,
            picker.choice(COMPLAINT_TITLES),
            now_kst(),
        )
        return complaint_item(row)
