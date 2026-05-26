import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tag: Mapped[str] = mapped_column(String(30))
    text: Mapped[str] = mapped_column(String(500))
    time_label: Mapped[str] = mapped_column(String(50))
    source_type: Mapped[str | None] = mapped_column(String(50))
    source_id: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
