import uuid
from datetime import datetime
from pydantic import BaseModel


class ActivityOut(BaseModel):
    id: uuid.UUID
    tag: str
    text: str
    time_label: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class ActivityListOut(BaseModel):
    success: bool = True
    data: list[ActivityOut]
    meta: dict | None = None
