# Date: October 1, 2026
# Name: Sri
# Desc: Builds the single LangChain agent (cached, so it is created once per
#       process) and runs one user message through it. The model is Azure AI
#       Foundry's OpenAI-compatible endpoint via ChatOpenAI, not
#       AzureChatOpenAI, matching the other projects in this repo. A
#       recursion limit bounds the tool loop, and hitting it returns a plain
#       message rather than a raw 500.
from __future__ import annotations

import logging
from functools import lru_cache

from fastapi import HTTPException
from langchain.agents import create_agent
from langchain_core.messages import AIMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langgraph.errors import GraphRecursionError

from app.config import get_settings
from app.models.agent import AgentResponse, ToolCall
from app.services.ai.instructions import AGENT_INSTRUCTIONS
from app.services.ai.tools import AGENT_TOOLS

log = logging.getLogger("hello_world.agent_service")

RECURSION_LIMIT = 8


@lru_cache
def get_agent():
    settings = get_settings()
    if not settings.azure_ai_foundry_endpoint or not settings.azure_ai_foundry_api_key:
        raise HTTPException(
            status_code=503,
            detail="Azure OpenAI is not configured. Set AZURE_AI_FOUNDRY_ENDPOINT and AZURE_AI_FOUNDRY_API_KEY in .env.",
        )
    model = ChatOpenAI(
        model=settings.azure_ai_foundry_chat_deployment,
        base_url=settings.azure_ai_foundry_endpoint,
        api_key=settings.azure_ai_foundry_api_key,
    )
    return create_agent(model=model, tools=AGENT_TOOLS, system_prompt=AGENT_INSTRUCTIONS)


def _text_of(message: AIMessage) -> str:
    content = message.content
    if isinstance(content, str):
        return content
    return "".join(p.get("text", "") for p in content if isinstance(p, dict))


def run_agent(user_message: str) -> AgentResponse:
    agent = get_agent()
    try:
        result = agent.invoke(
            {"messages": [{"role": "user", "content": user_message}]},
            config={"recursion_limit": RECURSION_LIMIT},
        )
    except GraphRecursionError:
        log.warning("agent hit recursion limit for: %s", user_message)
        return AgentResponse(answer="Sorry, I could not finish that request.", tool_calls=[])

    messages = result["messages"]
    outputs = {m.tool_call_id: str(m.content) for m in messages if isinstance(m, ToolMessage)}
    tool_calls = [
        ToolCall(name=c["name"], arguments=c["args"], output=outputs.get(c["id"], ""))
        for m in messages
        if isinstance(m, AIMessage)
        for c in m.tool_calls
    ]
    final = next((m for m in reversed(messages) if isinstance(m, AIMessage)), None)
    answer = _text_of(final) if final else ""
    log.info("agent -> %d tool call(s): %s", len(tool_calls), [t.name for t in tool_calls])
    return AgentResponse(answer=answer, tool_calls=tool_calls)
