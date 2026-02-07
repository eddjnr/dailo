'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sun, Moon, Timer, ListTodo, FileText, CalendarDays, Pencil, Settings, Github, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { useAppStore } from '@/lib/store'
import { SettingsModal } from './settings-modal'

interface SidebarProps {
  theme: 'light' | 'dark'
  isCustomizing: boolean
  onToggleTheme: () => void
  onToggleCustomizing: () => void
}

const navItems = [
  { id: 'pomodoro', icon: Timer, path: '/', title: 'Pomodoro' },
  { id: 'tasks', icon: ListTodo, path: '/tasks', title: 'Tasks' },
  { id: 'timeblock', icon: CalendarDays, path: '/timeblock', title: 'Calendar' },
  { id: 'notes', icon: FileText, path: '/notes', title: 'Notes' },
  { id: 'draw', icon: Pencil, path: '/draw', title: 'Draw' },
]

function PomodoroProgressRing({ progress, isRunning }: { progress: number; isRunning: boolean }) {
  if (!isRunning) return null

  const size = 40
  const strokeWidth = 2.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg
      className="absolute inset-0 -rotate-90"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-primary/20"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="text-primary transition-all duration-1000"
      />
    </svg>
  )
}

export function Sidebar({ theme, isCustomizing, onToggleTheme, onToggleCustomizing }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const pomodoroTimer = useAppStore((state) => state.pomodoroTimer)
  const pomodoroSettings = useAppStore((state) => state.pomodoroSettings)

  // Calculate progress
  const totalTime =
    pomodoroTimer.phase === 'focus'
      ? pomodoroSettings.focusDuration * 60
      : pomodoroTimer.phase === 'shortBreak'
        ? pomodoroSettings.shortBreakDuration * 60
        : pomodoroSettings.longBreakDuration * 60

  const progress = ((totalTime - pomodoroTimer.timeLeft) / totalTime) * 100

  return (
    <aside className="w-16 shrink-0 border-r border-border flex flex-col items-center py-6 gap-2 sticky top-0 h-screen">
      {/* Logo */}
      <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Logo className="size-5 text-primary" />
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          const isPomodoro = item.id === 'pomodoro'

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={cn(
                "size-10 rounded-xl flex items-center justify-center transition-all duration-200 relative",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                isPomodoro && pomodoroTimer.isRunning && "text-primary"
              )}
              title={item.title}
            >
              {isPomodoro && (
                <PomodoroProgressRing
                  progress={progress}
                  isRunning={pomodoroTimer.isRunning}
                />
              )}
              <Icon className="size-5 relative z-10" />
            </button>
          )
        })}
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-1 mt-auto">
        <button
          onClick={onToggleTheme}
          className="size-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
        </button>
        <button
          onClick={onToggleCustomizing}
          className={cn(
            "size-10 rounded-xl flex items-center justify-center transition-all",
            isCustomizing
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          aria-label={isCustomizing ? 'Done customizing' : 'Customize'}
        >
          <Settings className={cn("size-5", isCustomizing && "animate-spin")} />
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="size-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center transition-all"
          aria-label="Settings"
        >
          <SlidersHorizontal className="size-5" />
        </button>
        <a
          href="https://github.com/eddjnr/dailo"
          target="_blank"
          rel="noopener noreferrer"
          className="size-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center transition-all"
          aria-label="GitHub repository"
        >
          <Github className="size-5" />
        </a>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </aside>
  )
}
