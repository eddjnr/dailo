'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, CloudSnow, Sun, CloudSun, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeatherData {
  temperature: number
  weatherCode: number
  isDay: boolean
}

const WEATHER_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  0: Sun,       // Clear sky
  1: Sun,       // Mainly clear
  2: CloudSun,  // Partly cloudy
  3: Cloud,     // Overcast
  45: Cloud,    // Fog
  48: Cloud,    // Depositing rime fog
  51: CloudRain, // Drizzle
  53: CloudRain,
  55: CloudRain,
  61: CloudRain, // Rain
  63: CloudRain,
  65: CloudRain,
  71: CloudSnow, // Snow
  73: CloudSnow,
  75: CloudSnow,
  80: CloudRain, // Rain showers
  81: CloudRain,
  82: CloudRain,
  95: CloudRain, // Thunderstorm
}

const DEFAULT_COORDS = { lat: -23.5505, lon: -46.6333 } // São Paulo

async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`
  )
  const data = await response.json()
  return {
    temperature: Math.round(data.current.temperature_2m),
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
  }
}

function getCoordinates(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_COORDS)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }),
      () => resolve(DEFAULT_COORDS),
      { timeout: 5000 }
    )
  })
}

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const coords = await getCoordinates()
        const data = await fetchWeatherData(coords.lat, coords.lon)
        setWeather(data)
      } catch {
        // Silent fail - weather is non-critical
      } finally {
        setLoading(false)
      }
    }

    loadWeather()

    // Refresh every 10 minutes
    const interval = setInterval(loadWeather, 600000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <Loader2 className="size-4 animate-spin text-muted-foreground" />
  }

  if (!weather) return null

  const Icon = WEATHER_ICONS[weather.weatherCode] || Cloud

  return (
    <div className="flex items-center gap-2">
      <Icon className={cn(
        "size-5",
        weather.isDay ? "text-amber-500" : "text-blue-400"
      )} />
      <span className="text-sm font-medium tabular-nums">
        {weather.temperature}°C
      </span>
    </div>
  )
}
