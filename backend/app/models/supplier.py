import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, JSON, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    uid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    location: Mapped[str] = mapped_column(String(100))
    country: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(100))
    city: Mapped[str | None] = mapped_column(String(100))
    match_score: Mapped[float] = mapped_column(Float, default=0.0)
    stars: Mapped[int] = mapped_column(Integer, default=3)
    lead_days: Mapped[int] = mapped_column(Integer)
    lead_label: Mapped[str] = mapped_column(String(50))
    price_low: Mapped[float] = mapped_column(Float)
    price_high: Mapped[float] = mapped_column(Float)
    price_label: Mapped[str] = mapped_column(String(100))
    components: Mapped[list] = mapped_column(JSON)
    certifications: Mapped[list | None] = mapped_column(JSON, default=list)
    min_order_qty: Mapped[int | None] = mapped_column(Integer)
    contact_name: Mapped[str | None] = mapped_column(String(100))
    contact_email: Mapped[str | None] = mapped_column(String(200))
    contact_phone: Mapped[str | None] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
