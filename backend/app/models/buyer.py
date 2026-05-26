import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Buyer(Base):
    __tablename__ = "buyers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    uid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    country_flag: Mapped[str] = mapped_column(String(10))
    country: Mapped[str] = mapped_column(String(100))
    fit_score: Mapped[float] = mapped_column(Float)
    interest: Mapped[str] = mapped_column(String(200))
    stage: Mapped[str] = mapped_column(String(20), default="Identified")
    contact_name: Mapped[str] = mapped_column(String(100))
    contact_email: Mapped[str] = mapped_column(String(200))
    contact_phone: Mapped[str] = mapped_column(String(50))
    last_contact: Mapped[str] = mapped_column(String(50))
    fit_product: Mapped[float | None] = mapped_column(Float)
    fit_market: Mapped[float | None] = mapped_column(Float)
    fit_budget: Mapped[float | None] = mapped_column(Float)
    fit_timeline: Mapped[float | None] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
