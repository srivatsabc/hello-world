import type { WeatherResponse } from '../types/api'
import { request } from './client'

// Date: October 1, 2026
// Name: Sri
// Desc: Typed call to the backend's weather endpoint.
export const weatherApi = {
  get: (city: string) => request<WeatherResponse>(`/api/v1/weather-management/weather-reports/current-report?city=${encodeURIComponent(city)}`),
}
