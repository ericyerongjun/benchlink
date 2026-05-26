import uuid
from datetime import datetime
from pydantic import BaseModel


class QuoteRequest(BaseModel):
    origin: str
    destination: str
    cargo_type: str
    weight_kg: float = 0
    length_cm: float = 0
    width_cm: float = 0
    height_cm: float = 0
    quantity: int = 1
    urgency: str = "standard"


class QuoteOut(BaseModel):
    id: uuid.UUID
    carrier: str
    service: str
    transit_min_days: int
    transit_max_days: int
    price_hkd: float
    price_usd: float
    co2_kg: str
    origin: str
    destination: str
    cargo_type: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class QuoteListOut(BaseModel):
    success: bool = True
    data: list[QuoteOut]
