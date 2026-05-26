"""Pydantic models for agent I/O."""
from pydantic import BaseModel


class AnalysisComponent(BaseModel):
    """A component identified by the AI during product analysis."""
    name: str
    explanation: str = ""


class AgentContext(BaseModel):
    """Context passed into the agent engine for a given run."""
    session_id: str
    detected_components: list[str] | None = None
    matched_supplier_ids: list[int] | None = None
    extra: dict | None = None


class AgentResponse(BaseModel):
    """Structured output from the agent engine."""
    content: str
    components: list[AnalysisComponent] | None = None
    analysis: dict | None = None
    structured_data: dict | None = None
    iterations: int = 0


class ToolResult(BaseModel):
    """Result from executing a single tool."""
    success: bool = True
    data: dict | list | None = None
    error: str | None = None
