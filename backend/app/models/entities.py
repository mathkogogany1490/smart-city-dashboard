from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Area(Base):
    __tablename__ = "areas"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True)
    name: Mapped[str] = mapped_column(String(32))
    svg_path: Mapped[str] = mapped_column(Text)
    label_x: Mapped[float] = mapped_column(Float)
    label_y: Mapped[float] = mapped_column(Float)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    districts: Mapped[list["District"]] = relationship(back_populates="area")


class District(Base):
    __tablename__ = "districts"

    id: Mapped[int] = mapped_column(primary_key=True)
    area_id: Mapped[int] = mapped_column(ForeignKey("areas.id"))
    name: Mapped[str] = mapped_column(String(40), unique=True)
    population: Mapped[int] = mapped_column(Integer)
    population_change_pct: Mapped[float] = mapped_column(Float)
    density: Mapped[int] = mapped_column(Integer)
    focus_issues: Mapped[str] = mapped_column(String(200), default="")
    is_priority: Mapped[bool] = mapped_column(Boolean, default=False)
    show_in_chart: Mapped[bool] = mapped_column(Boolean, default=True)
    chart_order: Mapped[int] = mapped_column(Integer, default=0)

    area: Mapped[Area] = relationship(back_populates="districts")
    populations: Mapped[list["PopulationStat"]] = relationship(back_populates="district")
    complaints: Mapped[list["Complaint"]] = relationship(back_populates="district")


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(40), unique=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    weight: Mapped[int] = mapped_column(Integer, default=1)

    complaints: Mapped[list["Complaint"]] = relationship(back_populates="department")


class Complaint(Base):
    __tablename__ = "complaints"
    __table_args__ = (
        Index("ix_complaints_dept_created", "department_id", "created_at"),
        Index("ix_complaints_district_created", "district_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id"))
    title: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)

    department: Mapped[Department] = relationship(back_populates="complaints")
    district: Mapped[District] = relationship(back_populates="complaints")


class PopulationStat(Base):
    __tablename__ = "population_stats"
    __table_args__ = (Index("ix_population_district_year", "district_id", "year", unique=True),)

    id: Mapped[int] = mapped_column(primary_key=True)
    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id"))
    year: Mapped[int] = mapped_column(Integer)
    age_0_14: Mapped[int] = mapped_column(Integer)
    age_15_64: Mapped[int] = mapped_column(Integer)
    age_65_plus: Mapped[int] = mapped_column(Integer)

    district: Mapped[District] = relationship(back_populates="populations")


class JobGoal(Base):
    __tablename__ = "job_goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(40))
    achievement_rate: Mapped[float] = mapped_column(Float)
    year: Mapped[int] = mapped_column(Integer)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class PledgeGoal(Base):
    __tablename__ = "pledge_goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(40))
    achievement_rate: Mapped[float] = mapped_column(Float)
    year: Mapped[int] = mapped_column(Integer)
    icon: Mapped[str] = mapped_column(String(32))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class SnsPost(Base):
    __tablename__ = "sns_posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    channel: Mapped[str] = mapped_column(String(16))
    title: Mapped[str] = mapped_column(String(200))
    duration: Mapped[str | None] = mapped_column(String(16), nullable=True)
    views_label: Mapped[str] = mapped_column(String(40))
    published_label: Mapped[str] = mapped_column(String(40))
    accent: Mapped[str] = mapped_column(String(16), default="sky")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class NewsItem(Base):
    __tablename__ = "news_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    published_on: Mapped[date] = mapped_column(Date)
    accent: Mapped[str] = mapped_column(String(16), default="city")


class CityProfile(Base):
    __tablename__ = "city_profile"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(40))
