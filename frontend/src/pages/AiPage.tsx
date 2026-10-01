import { useState } from 'react'
import { ApiError } from '../api/client'
import { agentApi } from '../api/agent'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { AgentResponse } from '../types/api'

// Date: October 1, 2026
// Name: Sri
// Desc: The AI tab. One free-text box and one button that sends the message
//       to the backend LangChain agent, which picks the add, subtract, or
//       weather tool itself. Shows the agent's answer plus which tool it
//       actually called, so the tool use is visible.
export function AiPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState<AgentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function ask() {
    setError(null)
    setBusy(true)
    agentApi
      .chat(message)
      .then(setResponse)
      .catch((err) => {
        setResponse(null)
        setError(err instanceof ApiError ? err.message : 'The request failed.')
      })
      .finally(() => setBusy(false))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-3 py-10">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-zinc-50">
          <span className="text-indigo-300">AI</span> agent
        </h1>
        <p className="text-sm text-zinc-200">
          Ask in plain English. The agent can only add, subtract, and look up the weather.
        </p>
      </header>

      <Card className="animate-fade-up space-y-4">
        <textarea
          rows={3}
          placeholder="e.g. What is 41 minus 12?   or   What's the weather in Tokyo?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
        />
        <Button disabled={!message.trim() || busy} onClick={ask}>
          {busy ? 'Thinking...' : 'Ask'}
        </Button>
      </Card>

      {response && (
        <Card className="animate-fade-up space-y-3">
          <p className="text-lg text-zinc-100">{response.answer}</p>
          {response.tool_calls.length > 0 && (
            <div className="relative space-y-2 rounded-lg border border-zinc-700 px-4 pb-4 pt-5">
              <span className="absolute -top-2.5 right-3 bg-zinc-900 px-2 font-mono text-xs text-zinc-400">
                intermediate_results
              </span>
              {response.tool_calls.map((call, i) => (
                <div key={i} className="space-y-1.5 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="blue">tool: {call.name}</Badge>
                    <span className="font-mono text-zinc-400">{JSON.stringify(call.arguments)}</span>
                    <span className="text-zinc-500">{'->'}</span>
                  </div>
                  <p className="font-mono text-zinc-300">{call.output}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      {error && <p className="text-center text-sm text-red-300">{error}</p>}
    </div>
  )
}
