'use client'

import { memo, useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { useAppStore } from '@/lib/store'
import type { PomodoroSettings } from '@/lib/types'
import { Phase } from './constants'
import { PhaseTabs } from './phase-tabs'
import { TimerDisplay } from './timer-display'
import { TimerControls } from './timer-controls'
import { SettingsOverlay } from './settings-overlay'

export const PomodoroWidget = memo(function PomodoroWidget() {
  const pomodoroSettings = useAppStore((state) => state.pomodoroSettings)
  const pomodoroTimer = useAppStore((state) => state.pomodoroTimer)
  const updatePomodoroSettings = useAppStore((state) => state.updatePomodoroSettings)
  const updatePomodoroTimer = useAppStore((state) => state.updatePomodoroTimer)
  const tickPomodoroTimer = useAppStore((state) => state.tickPomodoroTimer)
  const resetPomodoroTimer = useAppStore((state) => state.resetPomodoroTimer)

  const { phase, timeLeft, isRunning, sessionsCompleted } = pomodoroTimer
  const [showSettings, setShowSettings] = useState(false)
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

  const handleSelectPhase = (newPhase: Phase) => {
    if (isRunning || phase === newPhase) return
    const duration = newPhase === 'focus'
      ? pomodoroSettings.focusDuration
      : newPhase === 'shortBreak'
      ? pomodoroSettings.shortBreakDuration
      : pomodoroSettings.longBreakDuration
    updatePomodoroTimer({
      phase: newPhase,
      timeLeft: duration * 60,
    })
  }

  const handleSettingChange = (key: keyof PomodoroSettings, delta: number) => {
    const newValue = Math.max(1, pomodoroSettings[key] + delta)
    updatePomodoroSettings({ [key]: newValue })
    if (key === 'focusDuration' && phase === 'focus' && !isRunning) {
      updatePomodoroTimer({ timeLeft: newValue * 60 })
    } else if (key === 'shortBreakDuration' && phase === 'shortBreak' && !isRunning) {
      updatePomodoroTimer({ timeLeft: newValue * 60 })
    } else if (key === 'longBreakDuration' && phase === 'longBreak' && !isRunning) {
      updatePomodoroTimer({ timeLeft: newValue * 60 })
    }
  }

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-hidden">
      <AnimatePresence>
        {showSettings && (
          <SettingsOverlay
            settings={pomodoroSettings}
            onClose={() => setShowSettings(false)}
            onSettingChange={handleSettingChange}
          />
        )}
      </AnimatePresence>

      <PhaseTabs
        currentPhase={phase}
        isRunning={isRunning}
        onSelectPhase={handleSelectPhase}
      />

      <TimerDisplay
        phase={phase}
        timeLeft={timeLeft}
        progress={progress}
        sessionsCompleted={sessionsCompleted}
        totalSessions={pomodoroSettings.sessionsUntilLongBreak}
      />

      <TimerControls
        isRunning={isRunning}
        onToggle={() => updatePomodoroTimer({ isRunning: !isRunning })}
        onReset={resetPomodoroTimer}
        onOpenSettings={() => setShowSettings(true)}
      />
    </div>
  )
})
