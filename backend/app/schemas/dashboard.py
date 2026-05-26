from pydantic import BaseModel


class KPIOut(BaseModel):
    active_sourcing: int
    open_buyer_leads: int
    pending_shipments: int


class TrendPoint(BaseModel):
    week: str
    requests: int


class PartnerOut(BaseModel):
    name: str
    location: str
    match_score: float | None = None
    interest: str | None = None
    stage: str | None = None


class DashboardOut(BaseModel):
    success: bool = True
    data: dict


class ActivityItem(BaseModel):
    tag: str
    text: str
    time_label: str
