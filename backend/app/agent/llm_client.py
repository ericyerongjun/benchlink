"""DeepSeek API client using the OpenAI-compatible interface."""
import json
import logging
from dataclasses import dataclass, field

from openai import AsyncOpenAI

from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class ToolCall:
    id: str
    function_name: str
    arguments: dict


@dataclass
class LLMResponse:
    content: str | None = None
    tool_calls: list[ToolCall] = field(default_factory=list)
    has_tool_calls: bool = False


class LLMClient:
    """Async client wrapping the DeepSeek API (OpenAI-compatible)."""

    def __init__(self) -> None:
        self.client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
        )
        self.model = settings.deepseek_model

    async def chat(
        self,
        messages: list[dict],
        tools: list[dict] | None = None,
        tool_choice: str = "auto",
    ) -> LLMResponse:
        """Send a chat completion request. Returns either text or tool calls."""

        kwargs: dict = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 4096,
        }

        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = tool_choice

        try:
            response = await self.client.chat.completions.create(**kwargs)
        except Exception as e:
            logger.error("DeepSeek API call failed: %s", e)
            raise

        choice = response.choices[0]
        msg = choice.message

        tool_calls = []
        if msg.tool_calls:
            for tc in msg.tool_calls:
                try:
                    args = json.loads(tc.function.arguments)
                except json.JSONDecodeError:
                    args = {}
                tool_calls.append(ToolCall(
                    id=tc.id,
                    function_name=tc.function.name,
                    arguments=args,
                ))

        return LLMResponse(
            content=msg.content,
            tool_calls=tool_calls,
            has_tool_calls=bool(tool_calls),
        )

    async def health_check(self) -> bool:
        """Check if the DeepSeek API is reachable."""
        try:
            await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5,
            )
            return True
        except Exception:
            return False
