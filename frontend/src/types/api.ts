// Date: October 1, 2026
// Name: Sri
// Desc: Mirrors the backend Pydantic models field for field. Fields stay
//       snake_case because the backend emits snake_case JSON.

export interface CalcResponse {
  operation: 'add' | 'subtract'
  first_number: number
  second_number: number
  result: number
}

export interface WeatherResponse {
  city: string
  country: string
  temperature_c: number
  wind_speed_kmh: number
  condition: string
}

export interface ToolCall {
  name: string
  arguments: Record<string, unknown>
  output: string
}

export interface AgentResponse {
  answer: string
  tool_calls: ToolCall[]
}
