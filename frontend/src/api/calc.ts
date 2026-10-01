import type { CalcResponse } from '../types/api'
import { request } from './client'

// Date: October 1, 2026
// Name: Sri
// Desc: Typed calls to the backend's add and subtract endpoints.
// Singleton path names are singular nouns (addition, subtraction); the operation
// field in the response keeps the verb.
const SINGLETON: Record<CalcResponse['operation'], string> = { add: 'addition', subtract: 'subtraction' }

export const calcApi = {
  run: (operation: CalcResponse['operation'], firstNumber: number, secondNumber: number) =>
    request<CalcResponse>(`/api/v1/calculation-management/calculations/${SINGLETON[operation]}`, {
      method: 'POST',
      body: JSON.stringify({ first_number: firstNumber, second_number: secondNumber }),
    }),
}
