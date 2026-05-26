import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id: Mapped[str | None] = mapped_column(String(50))
    origin: Mapped[str] = mapped_column(String(100))
    destination: Mapped[str] = mapped_column(String(100))
    cargo_type: Mapped[str] = mapped_column(String(50))
    weight_kg: Mapped[float] = mapped_column(Float, default=0)
    carrier: Mapped[str] = mapped_column(String(100))
    service: Mapped[str] = mapped_column(String(100))
    transit_min_days: Mapped[int] = mapped_column(Integer)
    transit_max_days: Mapped[int] = mapped_column(Integer)
    price_hkd: Mapped[float] = mapped_column(Float)
    price_usd: Mapped[float] = mapped_column(Float)
    co2_kg: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
