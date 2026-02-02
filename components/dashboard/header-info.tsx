'use client'

import { Clock } from '@/components/ui/clock'
import { Weather } from '@/components/ui/weather'

export function HeaderInfo() {
  return (
    <div className="flex items-center gap-4">
      <Weather />
      <div className="h-4 w-px bg-border" />
      <Clock />
    </div>
  )
}
