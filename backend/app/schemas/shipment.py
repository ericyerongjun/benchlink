from datetime import datetime
from pydantic import BaseModel


class StageOut(BaseModel):
    label: str
    loc: str
    date: str
    done: bool
    current: bool | None = None


class ShipmentOut(BaseModel):
    id: str
    origin: str
    destination: str
    buyer_country: str
    carrier: str
    buyer_name: str
    status: str
    stages: list[StageOut]
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class ShipmentListOut(BaseModel):
    success: bool = True
    data: list[ShipmentOut]
    meta: dict | None = None
