from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class AreaOut(BaseModel):
    id: int
    code: str
    name: str
    svg_path: str
    label_x: float
    label_y: float
    primary_district_id: int
    district_ids: list[int]
    population: int


class DistrictOut(BaseModel):
    id: int
    name: str
    area_id: int
    area_code: str
    area_name: str
    population: int
    population_change_pct: float
    density: int
    focus_issues: str
    is_priority: bool
    show_in_chart: bool
    chart_order: int


class RankedDistrict(BaseModel):
    rank: int
    id: int
    name: str
    population: int
    area_code: str


class DistrictPart(BaseModel):
    id: int
    name: str
    population: int


class DistrictSummary(BaseModel):
    id: int
    name: str
    area_name: str
    area_code: str
    population: int
    population_change_pct: float
    density: int
    complaint_count: int
    complaint_change_pct: float
    focus_issues: str
    is_priority: bool
    parts: list[DistrictPart]


class ComplaintBar(BaseModel):
    department_id: int
    name: str
    count: int


class ComplaintSummary(BaseModel):
    days: int
    total: int
    items: list[ComplaintBar]


class ComplaintItem(BaseModel):
    id: int
    title: str
    department: str
    department_id: int
    district: str
    district_id: int
    created_at: datetime


class PopulationItem(BaseModel):
    district_id: int
    name: str
    age_0_14: int
    age_15_64: int
    age_65_plus: int


class PopulationResponse(BaseModel):
    year: int
    years: list[int]
    items: list[PopulationItem]


class JobGoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    achievement_rate: float
    year: int


class PledgeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    achievement_rate: float
    year: int
    icon: str


class SnsPostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    channel: str
    title: str
    duration: str | None
    views_label: str
    published_label: str
    accent: str
    video_id: str | None = None
    thumbnail_url: str | None = None


class NewsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    published_on: date
    accent: str


class CityStatusOut(BaseModel):
    name: str
    weather: str
    temperature_c: float
    observed_at: datetime
    source: str


class DensityItem(BaseModel):
    id: int
    name: str
    density: int
    population: int


class DongTrade(BaseModel):
    name: str
    count: int
    average_manwon: int


class TradeDeal(BaseModel):
    apartment: str
    district: str
    amount_manwon: int
    area_m2: float
    floor: str
    contract_date: str


class RealEstateOut(BaseModel):
    connected: bool
    message: str
    month: str | None = None
    total: int = 0
    districts: list[DongTrade] = []
    trades: list[TradeDeal] = []
    items: list[DensityItem] = []


class HealthOut(BaseModel):
    status: str
