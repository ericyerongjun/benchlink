import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RFQ(Base):
    __tablename__ = "rfqs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sourcing_sessions.id"))
    rfq_number: Mapped[str] = mapped_column(String(50))
    product: Mapped[str] = mapped_column(String(300))
    quantity: Mapped[int] = mapped_column(Integer)
    specifications: Mapped[str] = mapped_column(Text)
    deadline: Mapped[str] = mapped_column(String(50))
    terms: Mapped[str] = mapped_column(String(200), default="Net 30 · FOB Shenzhen")
    supplier_ids: Mapped[list] = mapped_column(JSON)
    english_content: Mapped[dict] = mapped_column(JSON)
    chinese_content: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
