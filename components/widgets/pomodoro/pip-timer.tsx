'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { formatTime, getPhaseLabel } from './constants'

export function PipTimer() {
  const pomodoroSettings = useAppStore((state) => state.pomodoroSettings)
  const pomodoroTimer = useAppStore((state) => state.pomodoroTimer)
  const updatePomodoroTimer = useAppStore((state) => state.updatePomodoroTimer)
  const tickPomodoroTimer = useAppStore((state) => state.tickPomodoroTimer)

  const { phase, timeLeft, isRunning, sessionsCompleted } = pomodoroTimer
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalTime = phase === 'focus'
    ? pomodoroSettings.focusDuration * 60
    : phase === 'shortBreak'
    ? pomodoroSettings.shortBreakDuration * 60
    : pomodoroSettings.longBreakDuration * 60

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const handleComplete = useCallback(() => {
    if (phase === 'focus') {
      const newSessions = sessionsCompleted + 1
      if (newSessions % pomodoroSettings.sessionsUntilLongBreak === 0) {
        updatePomodoroTimer({
          isRunning: false,
          phase: 'longBreak',
          timeLeft: pomodoroSettings.longBreakDuration * 60,
          sessionsCompleted: newSessions,
        })
      } else {
        updatePomodoroTimer({
          isRunning: false,
          phase: 'shortBreak',
          timeLeft: pomodoroSettings.shortBreakDuration * 60,
          sessionsCompleted: newSessions,
        })
      }
    } else {
      updatePomodoroTimer({
        isRunning: false,
        phase: 'focus',
        timeLeft: pomodoroSettings.focusDuration * 60,
      })
    }
  }, [phase, sessionsCompleted, pomodoroSettings, updatePomodoroTimer])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        tickPomodoroTimer()
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      handleComplete()
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft, handleComplete, tickPomodoroTimer])

  const isBreak = phase !== 'focus'
  const ringColor = isBreak ? 'text-green-500' : 'text-primary'

  return (
    <div className="flex items-center justify-center gap-5 h-full w-full bg-background p-4 select-none">
      {/* Timer ring */}
      <div className="relative size-28 shrink-0">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="46"
            fill="none" stroke="currentColor" strokeWidth="6"
            className="text-muted/20"
          />
          <circle
            cx="50" cy="50" r="46"
            fill="none" stroke="currentColor" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 46}`}
            strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
            className={cn("transition-all duration-1000", ringColor)}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extralight tracking-tight tabular-nums text-foreground">
            {formatTime(timeLeft)}
          </span>
          <span className={cn(
            "text-[9px] uppercase tracking-[0.2em]",
            isBreak ? "text-green-500" : "text-muted-foreground"
          )}>
            {getPhaseLabel(phase)}
          </span>
        </div>
      </div>

      {/* Play/Pause button */}
      <button
        onClick={() => updatePomodoroTimer({ isRunning: !isRunning })}
        className={cn(
          "px-5 py-2 rounded-full text-[11px] font-medium uppercase tracking-wider transition-all",
          isRunning
            ? "bg-muted/50 text-foreground hover:bg-muted"
            : "bg-foreground text-background hover:bg-foreground/90"
        )}
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>
    </div>
  )
}
