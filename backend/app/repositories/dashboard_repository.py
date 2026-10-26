from datetime import datetime

from sqlalchemy import and_, func, select, text
from sqlalchemy.orm import Session, selectinload

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


class DashboardRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def ping(self) -> None:
        self.session.execute(text("SELECT 1"))

    def list_areas(self) -> list[Area]:
        stmt = select(Area).options(selectinload(Area.districts)).order_by(Area.sort_order)
        return list(self.session.scalars(stmt))

    def list_districts(self) -> list[District]:
        stmt = (
            select(District)
            .options(selectinload(District.area))
            .order_by(District.population.desc(), District.id)
        )
        return list(self.session.scalars(stmt))

    def get_district(self, district_id: int) -> District | None:
        stmt = (
            select(District)
            .options(selectinload(District.area).selectinload(Area.districts))
            .where(District.id == district_id)
        )
        return self.session.scalar(stmt)

    def list_departments(self) -> list[Department]:
        return list(self.session.scalars(select(Department).order_by(Department.sort_order)))

    def complaint_counts(self, start: datetime, end: datetime) -> list[tuple[Department, int]]:
        stmt = (
            select(Department, func.count(Complaint.id))
            .outerjoin(
                Complaint,
                and_(
                    Complaint.department_id == Department.id,
                    Complaint.created_at >= start,
                    Complaint.created_at < end,
                ),
            )
            .group_by(Department.id)
            .order_by(func.count(Complaint.id).desc(), Department.sort_order)
        )
        return list(self.session.execute(stmt).all())

    def count_complaints(
        self,
        start: datetime,
        end: datetime,
        district_ids: list[int] | None = None,
    ) -> int:
        stmt = select(func.count(Complaint.id)).where(
            Complaint.created_at >= start,
            Complaint.created_at < end,
        )
        if district_ids is not None:
            stmt = stmt.where(Complaint.district_id.in_(district_ids))
        return int(self.session.scalar(stmt) or 0)

    def recent_complaints(
        self,
        limit: int,
        department: str | None,
        district_id: int | None,
    ) -> list[Complaint]:
        stmt = (
            select(Complaint)
            .options(selectinload(Complaint.department), selectinload(Complaint.district))
            .order_by(Complaint.created_at.desc(), Complaint.id.desc())
            .limit(limit)
        )
        if department:
            stmt = stmt.where(Complaint.department.has(Department.name == department))
        if district_id is not None:
            stmt = stmt.where(Complaint.district_id == district_id)
        return list(self.session.scalars(stmt))

    def population(self, year: int) -> list[PopulationStat]:
        stmt = (
            select(PopulationStat)
            .options(selectinload(PopulationStat.district))
            .join(District)
            .where(PopulationStat.year == year, District.show_in_chart.is_(True))
            .order_by(District.chart_order)
        )
        return list(self.session.scalars(stmt))

    def population_years(self) -> list[int]:
        stmt = select(PopulationStat.year).distinct().order_by(PopulationStat.year)
        return list(self.session.scalars(stmt))

    def jobs(self) -> list[JobGoal]:
        return list(self.session.scalars(select(JobGoal).order_by(JobGoal.sort_order)))

    def pledges(self) -> list[PledgeGoal]:
        return list(self.session.scalars(select(PledgeGoal).order_by(PledgeGoal.sort_order)))

    def sns(self, channel: str) -> list[SnsPost]:
        stmt = select(SnsPost).where(SnsPost.channel == channel).order_by(SnsPost.sort_order)
        return list(self.session.scalars(stmt))

    def news(self, limit: int) -> list[NewsItem]:
        stmt = select(NewsItem).order_by(NewsItem.published_on.desc(), NewsItem.id.desc()).limit(limit)
        return list(self.session.scalars(stmt))

    def city(self) -> CityProfile | None:
        return self.session.scalar(select(CityProfile).limit(1))

    def create_complaint(self, department_id: int, district_id: int, title: str, created_at: datetime) -> Complaint:
        row = Complaint(
            department_id=department_id,
            district_id=district_id,
            title=title,
            created_at=created_at,
        )
        self.session.add(row)
        self.session.commit()
        loaded = self.session.scalar(
            select(Complaint)
            .options(selectinload(Complaint.department), selectinload(Complaint.district))
            .where(Complaint.id == row.id)
        )
        if loaded is None:
            raise RuntimeError("민원 저장에 실패했습니다.")
        return loaded
