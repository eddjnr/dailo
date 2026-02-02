'use client'

import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { SettingRow } from './setting-row'
import type { PomodoroSettings } from '@/lib/types'

interface SettingsOverlayProps {
  settings: PomodoroSettings
  onClose: () => void
  onSettingChange: (key: keyof PomodoroSettings, delta: number) => void
}

export function SettingsOverlay({ settings, onClose, onSettingChange }: SettingsOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
      className="absolute inset-0 z-10 bg-card rounded-2xl flex flex-col border border-border/50 shadow-lg"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium">Settings</span>
        <button
          onClick={onClose}
          className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <SettingRow
          label="Focus"
          value={settings.focusDuration}
          unit="min"
          onDecrease={() => onSettingChange('focusDuration', -5)}
          onIncrease={() => onSettingChange('focusDuration', 5)}
        />
        <SettingRow
          label="Short Break"
          value={settings.shortBreakDuration}
          unit="min"
          onDecrease={() => onSettingChange('shortBreakDuration', -1)}
          onIncrease={() => onSettingChange('shortBreakDuration', 1)}
        />
        <SettingRow
          label="Long Break"
          value={settings.longBreakDuration}
          unit="min"
          onDecrease={() => onSettingChange('longBreakDuration', -5)}
          onIncrease={() => onSettingChange('longBreakDuration', 5)}
        />
        <SettingRow
          label="Sessions"
          value={settings.sessionsUntilLongBreak}
          unit="sess."
          onDecrease={() => onSettingChange('sessionsUntilLongBreak', -1)}
          onIncrease={() => onSettingChange('sessionsUntilLongBreak', 1)}
        />
      </div>
    </motion.div>
  )
}
