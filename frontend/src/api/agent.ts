import type { AgentResponse } from '../types/api'
import { request } from './client'

// Date: October 1, 2026
// Name: Sri
// Desc: Typed call to the backend's LangChain agent endpoint.
export const agentApi = {
  chat: (message: string) =>
    request<AgentResponse>('/api/v1/agent-management/agents/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
}
