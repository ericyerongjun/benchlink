import uuid
from datetime import datetime
from pydantic import BaseModel


class SourcingSessionCreate(BaseModel):
    title: str | None = None


class SourcingSessionOut(BaseModel):
    id: uuid.UUID
    title: str | None = None
    status: str
    detected_components: list | None = None
    matched_supplier_ids: list | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class SourcingMessageCreate(BaseModel):
    content: str


class SourcingMessageOut(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    tool_calls: dict | None = None
    tool_results: dict | None = None
    msg_metadata: dict | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class RFQCreate(BaseModel):
    product: str
    quantity: int
    specifications: str
    deadline: str
    terms: str = "Net 30 · FOB Shenzhen"
    supplier_ids: list[int]


class RFQOut(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    rfq_number: str
    product: str
    quantity: int
    specifications: str
    deadline: str
    terms: str
    supplier_ids: list
    english_content: dict
    chinese_content: dict
    status: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class AgentResponse(BaseModel):
    content: str
    tool_calls: list[dict] | None = None
    analysis: dict | None = None
    structured_data: dict | None = None


class SessionDetailOut(BaseModel):
    session: SourcingSessionOut
    messages: list[SourcingMessageOut] = []
    analysis: dict | None = None
    matched_suppliers: list[dict] | None = None
