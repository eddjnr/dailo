'use client'

import { memo, useState, useCallback, useRef, useLayoutEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { AnimatePresence } from 'motion/react'
import { useAppStore } from '@/lib/store'
import { usePictureInPicture } from '@/hooks/use-picture-in-picture'
import type { PomodoroSettings } from '@/lib/types'
import { Phase } from './constants'
import { PhaseTabs } from './phase-tabs'
import { TimerDisplay } from './timer-display'
import { TimerControls } from './timer-controls'
import { SettingsOverlay } from './settings-overlay'
import { PipTimer } from './pip-timer'

export const PomodoroWidget = memo(function PomodoroWidget() {
  const pomodoroSettings = useAppStore((state) => state.pomodoroSettings)
  const pomodoroTimer = useAppStore((state) => state.pomodoroTimer)
  const updatePomodoroSettings = useAppStore((state) => state.updatePomodoroSettings)
  const updatePomodoroTimer = useAppStore((state) => state.updatePomodoroTimer)
  const resetPomodoroTimer = useAppStore((state) => state.resetPomodoroTimer)

  const pip = usePictureInPicture()

  const { phase, timeLeft, isRunning, sessionsCompleted } = pomodoroTimer
  const [showSettings, setShowSettings] = useState(false)

  const totalTime = phase === 'focus'
    ? pomodoroSettings.focusDuration * 60
    : phase === 'shortBreak'
    ? pomodoroSettings.shortBreakDuration * 60
    : pomodoroSettings.longBreakDuration * 60

  const progress = ((totalTime - timeLeft) / totalTime) * 100

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

  const handlePip = useCallback(async () => {
    if (pip.isOpen) {
      pip.close()
    } else {
      await pip.open({ width: 320, height: 180 })
    }
  }, [pip])

  // Manage PiP portal with createRoot for safe unmounting
  const pipRootRef = useRef<Root | null>(null)

  useLayoutEffect(() => {
    if (pip.pipWindow?.document?.body) {
      const container = pip.pipWindow.document.body
      pipRootRef.current = createRoot(container)
      pipRootRef.current.render(<PipTimer />)
    }

    return () => {
      if (pipRootRef.current) {
        pipRootRef.current.unmount()
        pipRootRef.current = null
      }
    }
  }, [pip.pipWindow])

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
        onToggle={() => {
          if (!isRunning && Notification.permission === 'default') {
            Notification.requestPermission()
          }
          updatePomodoroTimer({ isRunning: !isRunning })
        }}
        onReset={resetPomodoroTimer}
        onOpenSettings={() => setShowSettings(true)}
        onPip={handlePip}
        isPipSupported={pip.isSupported}
      />
    </div>
  )
})
