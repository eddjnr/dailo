'use client'

import { HeaderInfo } from './header-info'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDateString(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function GreetingHeader() {
  return (
    <div className="flex items-start justify-between mb-6 animate-fade-in-up">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {getGreeting()}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {getDateString()}
        </p>
      </div>
      <HeaderInfo />
    </div>
  )
}
