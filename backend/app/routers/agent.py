# Date: October 1, 2026
# Name: Sri
# Desc: The AI tab's endpoint. Takes one natural-language message and hands
#       it to the LangChain agent.
from __future__ import annotations

from fastapi import APIRouter

from app.models.agent import AgentRequest, AgentResponse
from app.services.ai import agent_service

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/chat", response_model=AgentResponse)
def chat(body: AgentRequest) -> AgentResponse:
    return agent_service.run_agent(body.message)
