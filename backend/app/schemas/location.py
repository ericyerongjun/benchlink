from pydantic import BaseModel


class LocationOut(BaseModel):
    country: str
    state: str | None = None
    city: str | None = None

    model_config = {"from_attributes": True}
