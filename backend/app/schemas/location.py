from pydantic import BaseModel


class LocationOut(BaseModel):
    id: int
    country: str
    state: str | None = None
    city: str | None = None
    is_major_hub: bool = False

    model_config = {"from_attributes": True}


class LocationListOut(BaseModel):
    success: bool = True
    data: list[LocationOut]
