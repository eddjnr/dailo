'use client'

import { memo, useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'motion/react'
import { useAppStore } from '@/lib/store'
import { usePictureInPicture } from '@/hooks/use-picture-in-picture'
import { useFaviconTimer } from '@/hooks/use-favicon-timer'
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
  const tickPomodoroTimer = useAppStore((state) => state.tickPomodoroTimer)
  const resetPomodoroTimer = useAppStore((state) => state.resetPomodoroTimer)

  const pip = usePictureInPicture()

  const { phase, timeLeft, isRunning, sessionsCompleted } = pomodoroTimer
  const [showSettings, setShowSettings] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalTime = phase === 'focus'
    ? pomodoroSettings.focusDuration * 60
    : phase === 'shortBreak'
    ? pomodoroSettings.shortBreakDuration * 60
    : pomodoroSettings.longBreakDuration * 60

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  useFaviconTimer(isRunning, progress, phase, timeLeft)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleComplete = useCallback(() => {
    // Play notification sound
    if (!audioRef.current) {
      audioRef.current = new Audio('/timer-sound.mp3')
    }
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})

    // Browser notification
    const nextPhase = phase === 'focus' ? 'Break time!' : 'Focus time!'
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', { body: nextPhase, icon: '/favicon.ico' })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((p) => {
        if (p === 'granted') new Notification('Pomodoro Timer', { body: nextPhase, icon: '/favicon.ico' })
      })
    }

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

  const handlePip = useCallback(async () => {
    if (pip.isOpen) {
      pip.close()
    } else {
      await pip.open({ width: 320, height: 180 })
    }
  }, [pip])

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

      {pip.pipWindow && createPortal(<PipTimer />, pip.pipWindow.document.body)}
    </div>
  )
})
