"""Logistics carrier model — parcel, air freight, ocean shipping companies."""
from sqlalchemy import Boolean, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Carrier(Base):
    __tablename__ = "carriers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(300), unique=True)
    category: Mapped[str] = mapped_column(String(50))  # parcel, air_freight, ocean, forwarder
    country: Mapped[str | None] = mapped_column(String(100))
    service_area: Mapped[str | None] = mapped_column(String(300))  # Global, Asia-Pacific, etc.
    base_rate_per_kg: Mapped[float] = mapped_column(Float, default=0.0)
    min_transit_days: Mapped[int] = mapped_column(default=1)
    max_transit_days: Mapped[int] = mapped_column(default=7)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
