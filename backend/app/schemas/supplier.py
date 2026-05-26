from datetime import datetime
from pydantic import BaseModel


class SupplierBase(BaseModel):
    name: str
    location: str
    country: str | None = None
    state: str | None = None
    city: str | None = None
    match_score: float = 0.0
    stars: int = 3
    lead_days: int
    lead_label: str
    price_low: float
    price_high: float
    price_label: str
    components: list[str]
    certifications: list[str] | None = []
    min_order_qty: int | None = None
    contact_name: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    pass


class SupplierOut(SupplierBase):
    id: int
    uid: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SupplierListOut(BaseModel):
    success: bool = True
    data: list[SupplierOut]
    meta: dict | None = None
