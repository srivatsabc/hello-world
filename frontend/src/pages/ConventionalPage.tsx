import { useState } from 'react'
import { ApiError } from '../api/client'
import { calcApi } from '../api/calc'
import { weatherApi } from '../api/weather'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import type { CalcResponse, WeatherResponse } from '../types/api'

const OPERATION_SYMBOL: Record<CalcResponse['operation'], string> = { add: '+', subtract: '-' }

function messageOf(err: unknown): string {
  return err instanceof ApiError ? err.message : 'The request failed.'
}

// Date: October 1, 2026
// Name: Sri
// Desc: The Conventional tab. Two number boxes with Add and Subtract buttons,
//       and a city box with a weather button. Every button is a direct call
//       to a FastAPI endpoint, with no AI involved.
export function ConventionalPage() {
  const [first, setFirst] = useState('')
  const [second, setSecond] = useState('')
  const [calc, setCalc] = useState<CalcResponse | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)

  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [weatherBusy, setWeatherBusy] = useState(false)

  const numbersReady = first.trim() !== '' && second.trim() !== '' && !isNaN(Number(first)) && !isNaN(Number(second))

  function runCalc(operation: CalcResponse['operation']) {
    setCalcError(null)
    calcApi
      .run(operation, Number(first), Number(second))
      .then(setCalc)
      .catch((err) => {
        setCalc(null)
        setCalcError(messageOf(err))
      })
  }

  function runWeather() {
    setWeatherError(null)
    setWeatherBusy(true)
    weatherApi
      .get(city)
      .then(setWeather)
      .catch((err) => {
        setWeather(null)
        setWeatherError(messageOf(err))
      })
      .finally(() => setWeatherBusy(false))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-3 py-10">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-zinc-50">
          <span className="text-lime-300">Conventional</span>
        </h1>
        <p className="text-sm text-zinc-200">Each button calls a FastAPI endpoint directly.</p>
      </header>

      <Card className="animate-fade-up space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">Calculator</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="number" placeholder="First number" value={first} onChange={(e) => setFirst(e.target.value)} />
          <Input type="number" placeholder="Second number" value={second} onChange={(e) => setSecond(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <Button disabled={!numbersReady} onClick={() => runCalc('add')}>
            Add
          </Button>
          <Button disabled={!numbersReady} onClick={() => runCalc('subtract')}>
            Subtract
          </Button>
        </div>
        {calc && (
          <p className="animate-fade-up font-mono text-lg text-zinc-100">
            {calc.first_number} {OPERATION_SYMBOL[calc.operation]} {calc.second_number} ={' '}
            <Badge tone="lime">{calc.result}</Badge>
          </p>
        )}
        {calcError && <p className="text-sm text-red-300">{calcError}</p>}
      </Card>

      <Card className="animate-fade-up space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">Weather</h2>
        <Input
          placeholder="City, e.g. London"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && city.trim() && runWeather()}
        />
        <Button disabled={!city.trim() || weatherBusy} onClick={runWeather}>
          {weatherBusy ? 'Looking up...' : 'Get weather'}
        </Button>
        {weather && (
          <div className="animate-fade-up space-y-2">
            <p className="text-zinc-100">
              {weather.city}, {weather.country}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="blue">{weather.condition}</Badge>
              <Badge tone="lime">{weather.temperature_c} C</Badge>
              <Badge tone="zinc">wind {weather.wind_speed_kmh} km/h</Badge>
            </div>
          </div>
        )}
        {weatherError && <p className="text-sm text-red-300">{weatherError}</p>}
      </Card>
    </div>
  )
}
