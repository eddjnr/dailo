'use client'

import { cn } from '@/lib/utils'
import { formatTime, getPhaseLabel, Phase } from './constants'

interface TimerDisplayProps {
  phase: Phase
  timeLeft: number
  progress: number
  sessionsCompleted: number
  totalSessions: number
}

export function TimerDisplay({
  phase,
  timeLeft,
  progress,
  sessionsCompleted,
  totalSessions,
}: TimerDisplayProps) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
      <div className="relative aspect-square h-full max-h-44 min-h-25">
        {/* Background ring */}
        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/20"
          />
          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 46}`}
            strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
            className={cn(
              "transition-all duration-1000",
              phase === 'focus' ? "text-primary" : "text-green-500"
            )}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extralight tracking-tight tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className={cn(
            "text-[10px] uppercase tracking-[0.2em] mt-1",
            phase === 'focus' ? "text-muted-foreground" : "text-green-500"
          )}>
            {getPhaseLabel(phase)}
          </span>

          {/* Session dots */}
          <div className="flex gap-1.5 mt-3">
            {Array.from({ length: totalSessions }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  i < sessionsCompleted ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
