// Date: October 1, 2026
// Name: Sri
// Desc: One request<T> wrapper plus an ApiError, same shape used across
//       this repo's other frontends. No auth here (a local demo app), so
//       this is the small end of that pattern, not the full version with
//       injected config/headers.

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function readableDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => `${d.loc?.join('.')}: ${d.msg}`).join('; ')
  }
  return 'Request failed'
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response.status, readableDetail(body?.detail) || response.statusText)
  }

  return body as T
}
