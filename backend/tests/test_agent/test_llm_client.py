"""LLM client tests (mocked DeepSeek API)."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.agent.llm_client import LLMClient, LLMResponse


@pytest.mark.asyncio
async def test_llm_client_chat_without_tools():
    client = LLMClient()

    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Hello, I am an AI assistant."
    mock_response.choices[0].message.tool_calls = None

    with patch.object(
        client.client.chat.completions, "create",
        new_callable=AsyncMock,
        return_value=mock_response,
    ):
        result = await client.chat(messages=[{"role": "user", "content": "Hi"}])

    assert isinstance(result, LLMResponse)
    assert result.content == "Hello, I am an AI assistant."
    assert result.has_tool_calls is False


@pytest.mark.asyncio
async def test_llm_client_health_check():
    client = LLMClient()

    mock_response = MagicMock()
    with patch.object(
        client.client.chat.completions, "create",
        new_callable=AsyncMock,
        return_value=mock_response,
    ):
        ok = await client.health_check()
    assert ok is True
