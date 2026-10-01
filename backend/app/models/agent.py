# Date: October 1, 2026
# Name: Sri
# Desc: Request and response shapes for the AI agent endpoint. tool_calls
#       lets the UI show which tool the agent actually used.
from __future__ import annotations

from pydantic import BaseModel, Field


class AgentRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)


class ToolCall(BaseModel):
    name: str
    arguments: dict
    output: str


class AgentResponse(BaseModel):
    answer: str
    tool_calls: list[ToolCall]
