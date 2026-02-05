'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { formatTime, getPhaseLabel } from './constants'
import { playerManager } from '../lofi/player-manager'
import { usePlayerState } from '../lofi/use-player-state'

export function PipTimer() {
  const pomodoroSettings = useAppStore((state) => state.pomodoroSettings)
  const pomodoroTimer = useAppStore((state) => state.pomodoroTimer)
  const updatePomodoroTimer = useAppStore((state) => state.updatePomodoroTimer)
  const tickPomodoroTimer = useAppStore((state) => state.tickPomodoroTimer)
  const lofiState = usePlayerState()

  const { phase, timeLeft, isRunning, sessionsCompleted } = pomodoroTimer
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const toggleLofi = useCallback(() => playerManager?.togglePlay(), [])
  const switchPrev = useCallback(() => playerManager?.switchStream('prev'), [])
  const switchNext = useCallback(() => playerManager?.switchStream('next'), [])

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
      {/* Timer ring with play/pause inside */}
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
          <span className="text-xl font-extralight tracking-tight tabular-nums text-foreground">
            {formatTime(timeLeft)}
          </span>
          <span className={cn(
            "text-[8px] uppercase tracking-[0.15em] mb-1.5",
            isBreak ? "text-green-500" : "text-muted-foreground"
          )}>
            {getPhaseLabel(phase)}
          </span>

          {/* Timer Play/Pause */}
          <button
            onClick={() => updatePomodoroTimer({ isRunning: !isRunning })}
            className={cn(
              "size-7 rounded-full flex items-center justify-center transition-all",
              isRunning
                ? "bg-muted/50 text-foreground hover:bg-muted"
                : "bg-foreground text-background hover:bg-foreground/90"
            )}
          >
            {isRunning ? (
              <Pause className="size-3" />
            ) : (
              <Play className="size-3 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Lofi Controls Card */}
      <div className="flex flex-col items-center gap-1.5 bg-muted/50 border border-border/50 rounded-xl px-3 py-2">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Lofi</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={switchPrev}
            disabled={!lofiState.isReady}
            className="p-1 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 rounded-lg hover:bg-muted/30"
          >
            <ChevronLeft className="size-3.5" />
          </button>

          <button
            onClick={toggleLofi}
            disabled={!lofiState.isReady}
            className={cn(
              "size-7 rounded-lg flex items-center justify-center transition-all",
              lofiState.isPlaying
                ? "bg-primary/80 text-primary-foreground"
                : "bg-muted/50 text-foreground hover:bg-muted",
              !lofiState.isReady && "opacity-50 cursor-wait"
            )}
          >
            {lofiState.isPlaying ? (
              <Pause className="size-3" />
            ) : (
              <Play className="size-3 ml-0.5" />
            )}
          </button>

          <button
            onClick={switchNext}
            disabled={!lofiState.isReady}
            className="p-1 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 rounded-lg hover:bg-muted/30"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
