"""ReAct agent engine — Reasoning + Acting loop."""
import json
import logging
import re
from pathlib import Path

from app.agent.llm_client import LLMClient
from app.agent.schemas import AnalysisComponent, AgentContext, AgentResponse
from app.agent.tools.base import BaseTool
from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_PATH = Path(__file__).parent / "prompts" / "system.txt"

# Match bullet format: "- **Component Name**: explanation"
_BULLET_RE = re.compile(r"-\s*\*\*(.+?)\*\*\s*:\s*(.+)", re.IGNORECASE)


def _load_system_prompt() -> str:
    with open(SYSTEM_PROMPT_PATH) as f:
        return f.read()


class AgentEngine:
    """Runs the ReAct loop: call LLM → execute tools → repeat → return final answer."""

    def __init__(self, llm_client: LLMClient, tools: list[BaseTool]) -> None:
        self.llm = llm_client
        self.tools: dict[str, BaseTool] = {t.name: t for t in tools}
        self.system_prompt = _load_system_prompt()
        self.max_iterations = settings.agent_max_iterations

    async def run(
        self,
        session_id: str,
        user_input: str,
        history: list[dict] | None = None,
        context: AgentContext | None = None,
    ) -> AgentResponse:
        """Execute the ReAct loop for a single user message."""

        messages = self._build_messages(user_input, history)
        tool_defs = [t.openai_tool_schema() for t in self.tools.values()]

        for iteration in range(self.max_iterations):
            response = await self.llm.chat(
                messages=messages,
                tools=tool_defs,
                tool_choice="auto",
            )

            if response.has_tool_calls:
                for tc in response.tool_calls:
                    tool = self.tools.get(tc.function_name)
                    if not tool:
                        logger.warning("Unknown tool requested: %s", tc.function_name)
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": json.dumps({"error": f"Tool {tc.function_name} not found"}),
                        })
                        continue

                    try:
                        result = await tool.execute(**tc.arguments)
                    except Exception as e:
                        logger.error("Tool %s failed: %s", tc.function_name, e)
                        result = {"success": False, "error": str(e)}

                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": json.dumps(result),
                    })
            else:
                # Final answer — no more tool calls
                content = response.content or ""
                return AgentResponse(
                    content=content,
                    components=self._extract_components(content),
                    iterations=iteration + 1,
                )

        # Max iterations reached — ask LLM to summarize
        messages.append({
            "role": "user",
            "content": "Please provide your final analysis now based on the tool results above. Be concise.",
        })
        final = await self.llm.chat(messages=messages)
        content = final.content or "Analysis complete. Please review the tool results above."
        return AgentResponse(
            content=content,
            components=self._extract_components(content),
            iterations=self.max_iterations + 1,
        )

    def _extract_components(self, content: str) -> list[AnalysisComponent] | None:
        """Parse bullet points of format `- **Name**: explanation` from the LLM response."""
        components = []
        for line in content.split("\n"):
            match = _BULLET_RE.match(line.strip())
            if match:
                components.append(AnalysisComponent(
                    name=match.group(1).strip(),
                    explanation=match.group(2).strip(),
                ))
        return components or None

    def _build_messages(self, user_input: str, history: list[dict] | None) -> list[dict]:
        """Assemble the full message list: system prompt + history + new user input."""
        messages = [{"role": "system", "content": self.system_prompt}]

        if history:
            context_window = settings.agent_context_window
            recent = history[-context_window * 2:] if len(history) > context_window * 2 else history
            messages.extend(recent)

        messages.append({"role": "user", "content": user_input})
        return messages
