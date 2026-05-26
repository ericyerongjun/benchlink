"""Abstract base class for agent tools."""
from abc import ABC, abstractmethod


class BaseTool(ABC):
    name: str
    description: str

    @abstractmethod
    def openai_tool_schema(self) -> dict:
        """Return the OpenAI/DeepSeek function-calling JSON schema."""
        ...

    @abstractmethod
    async def execute(self, **kwargs) -> dict:
        """Execute the tool and return structured results."""
        ...
