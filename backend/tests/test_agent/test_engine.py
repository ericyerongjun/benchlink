"""Agent engine tests with mocked tools."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.agent.engine import AgentEngine
from app.agent.llm_client import LLMResponse
from app.agent.tools.base import BaseTool


class MockSupplierSearch(BaseTool):
    name = "supplier_search"
    description = "Search suppliers"

    def openai_tool_schema(self) -> dict:
        return {
            "type": "function",
            "function": {"name": self.name, "description": self.description, "parameters": {}}
        }

    async def execute(self, **kwargs) -> dict:
        return {"success": True, "count": 1, "suppliers": [{"name": "Test PCB Co.", "match_score": 95}]}


class MockBOMAnalysis(BaseTool):
    name = "bom_analysis"
    description = "Analyze BOM"

    def openai_tool_schema(self) -> dict:
        return {
            "type": "function",
            "function": {"name": self.name, "description": self.description, "parameters": {}}
        }

    async def execute(self, **kwargs) -> dict:
        return {"success": True, "detected_components": ["FR4 PCB", "SMT Assembly"]}


@pytest.mark.asyncio
async def test_engine_runs_tools_then_returns_final():
    """Agent calls tools, then returns a final answer without tools."""
    mock_llm = AsyncMock()

    # First call returns tool calls
    tool_call = MagicMock()
    tool_call.id = "call_1"
    tool_call.function.name = "supplier_search"
    tool_call.function.arguments = '{"component_types": ["FR4 PCB"]}'

    call1 = MagicMock()
    call1.message.content = None
    call1.message.tool_calls = [tool_call]

    # Second call returns final answer (no tool calls)
    call2 = MagicMock()
    call2.message.content = "I found Shenzhen PCB Co. as the best match at 95%."
    call2.message.tool_calls = None

    mock_llm.chat.return_value = LLMResponse(content=None, tool_calls=[
        MagicMock(function_name="supplier_search", arguments={"component_types": ["FR4 PCB"]})
    ], has_tool_calls=True)

    engine = AgentEngine(
        llm_client=mock_llm,
        tools=[MockSupplierSearch(), MockBOMAnalysis()],
    )

    # Simulate tool call -> result -> final answer loop
    import json
    from app.agent.llm_client import ToolCall

    mock_llm.chat.side_effect = [
        LLMResponse(
            content=None,
            tool_calls=[ToolCall(id="call_1", function_name="supplier_search", arguments={"component_types": ["FR4 PCB"]})],
            has_tool_calls=True,
        ),
        LLMResponse(
            content="I found Shenzhen PCB Co. as the best match at 95%.",
            tool_calls=[],
            has_tool_calls=False,
        ),
    ]

    result = await engine.run(
        session_id="test-session",
        user_input="I need FR4 PCBs",
    )

    assert result.content == "I found Shenzhen PCB Co. as the best match at 95%."
    assert result.iterations == 2
    assert mock_llm.chat.call_count == 2


@pytest.mark.asyncio
async def test_engine_direct_answer():
    """Agent returns a direct answer without any tool calls."""
    mock_llm = AsyncMock()
    mock_llm.chat.return_value = LLMResponse(
        content="I don't need any tools for this question. How can I help you?",
        tool_calls=[],
        has_tool_calls=False,
    )

    engine = AgentEngine(llm_client=mock_llm, tools=[MockSupplierSearch()])

    result = await engine.run(
        session_id="test-session",
        user_input="Hello",
    )

    assert result.content == "I don't need any tools for this question. How can I help you?"
    assert result.iterations == 1
    mock_llm.chat.assert_called_once()
