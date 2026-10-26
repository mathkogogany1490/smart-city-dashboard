from fastapi import APIRouter, HTTPException, Query

from app.schemas.dashboard import (
    AreaOut,
    CityStatusOut,
    ComplaintItem,
    ComplaintSummary,
    DistrictOut,
    DistrictSummary,
    HealthOut,
    JobGoalOut,
    NewsOut,
    PledgeOut,
    PopulationResponse,
    RankedDistrict,
    RealEstateOut,
    SnsPostOut,
)
from app.web.deps import Service

api = APIRouter()


@api.get("/health", response_model=HealthOut)
def health(service: Service) -> HealthOut:
    service.ping()
    return HealthOut(status="ok")


@api.get("/areas", response_model=list[AreaOut])
def areas(service: Service) -> list[AreaOut]:
    return service.areas()


@api.get("/districts", response_model=list[DistrictOut])
def districts(service: Service) -> list[DistrictOut]:
    return service.districts()


@api.get("/districts/top", response_model=list[RankedDistrict])
def top_districts(service: Service, limit: int = Query(5, ge=1, le=20)) -> list[RankedDistrict]:
    return service.top_districts(limit)


@api.get("/districts/{district_id}/summary", response_model=DistrictSummary)
def district_summary(district_id: int, service: Service, days: int = Query(30, ge=1, le=365)) -> DistrictSummary:
    try:
        return service.district_summary(district_id, days)
    except LookupError:
        raise HTTPException(status_code=404, detail="district not found") from None


@api.get("/complaints/summary", response_model=ComplaintSummary)
def complaint_summary(service: Service, days: int = Query(30, ge=1, le=365)) -> ComplaintSummary:
    return service.complaint_summary(days)


@api.get("/complaints/recent", response_model=list[ComplaintItem])
def recent_complaints(
    service: Service,
    limit: int = Query(12, ge=1, le=50),
    department: str | None = None,
    district_id: int | None = None,
) -> list[ComplaintItem]:
    return service.recent_complaints(limit, department, district_id)


@api.get("/population", response_model=PopulationResponse)
def population(service: Service, year: int = Query(2024, ge=2000, le=2100)) -> PopulationResponse:
    return service.population(year)


@api.get("/jobs", response_model=list[JobGoalOut])
def jobs(service: Service) -> list[JobGoalOut]:
    return service.jobs()


@api.get("/pledges", response_model=list[PledgeOut])
def pledges(service: Service) -> list[PledgeOut]:
    return service.pledges()


@api.get("/sns", response_model=list[SnsPostOut])
async def sns(service: Service, channel: str = "youtube") -> list[SnsPostOut]:
    if channel not in {"youtube", "blog"}:
        raise HTTPException(status_code=400, detail="channel must be youtube or blog")
    return await service.sns(channel)


@api.get("/news", response_model=list[NewsOut])
def news(service: Service, limit: int = Query(6, ge=1, le=20)) -> list[NewsOut]:
    return service.news(limit)


@api.get("/city", response_model=CityStatusOut)
async def city(service: Service) -> CityStatusOut:
    return await service.city()


@api.get("/realestate", response_model=RealEstateOut)
async def realestate(service: Service) -> RealEstateOut:
    return await service.realestate()
