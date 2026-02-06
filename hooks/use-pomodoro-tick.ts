'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useFaviconTimer } from './use-favicon-timer'

export function usePomodoroTick() {
  const pomodoroSettings = useAppStore((state) => state.pomodoroSettings)
  const pomodoroTimer = useAppStore((state) => state.pomodoroTimer)
  const updatePomodoroTimer = useAppStore((state) => state.updatePomodoroTimer)
  const tickPomodoroTimer = useAppStore((state) => state.tickPomodoroTimer)

  const { phase, timeLeft, isRunning, sessionsCompleted } = pomodoroTimer
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const totalTime = phase === 'focus'
    ? pomodoroSettings.focusDuration * 60
    : phase === 'shortBreak'
    ? pomodoroSettings.shortBreakDuration * 60
    : pomodoroSettings.longBreakDuration * 60

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  // Favicon timer - runs at layout level
  useFaviconTimer(isRunning, progress, phase, timeLeft)

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

  // Main timer interval - runs at layout level, persists across navigation
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
}
