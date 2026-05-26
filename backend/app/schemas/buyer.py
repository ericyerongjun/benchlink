from datetime import datetime
from pydantic import BaseModel


class BuyerBase(BaseModel):
    name: str
    country_flag: str
    country: str
    fit_score: float
    interest: str
    stage: str = "Identified"
    contact_name: str
    contact_email: str
    contact_phone: str
    last_contact: str
    fit_product: float | None = None
    fit_market: float | None = None
    fit_budget: float | None = None
    fit_timeline: float | None = None
    notes: str | None = None


class BuyerUpdate(BaseModel):
    stage: str | None = None
    notes: str | None = None
    fit_score: float | None = None


class BuyerOut(BuyerBase):
    id: int
    uid: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BuyerListOut(BaseModel):
    success: bool = True
    data: list[BuyerOut]
    meta: dict | None = None
