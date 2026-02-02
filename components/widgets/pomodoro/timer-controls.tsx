'use client'

import { RotateCcw, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerControlsProps {
  isRunning: boolean
  onToggle: () => void
  onReset: () => void
  onOpenSettings: () => void
}

export function TimerControls({ isRunning, onToggle, onReset, onOpenSettings }: TimerControlsProps) {
  return (
    <div className="flex items-center justify-between shrink-0 pt-2 mt-auto">
      <button
        onClick={onReset}
        className="size-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
      >
        <RotateCcw className="size-4" />
      </button>

      <button
        onClick={onToggle}
        className={cn(
          "px-8 py-2.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all",
          isRunning
            ? "bg-muted/50 text-foreground hover:bg-muted"
            : "bg-foreground text-background hover:bg-foreground/90"
        )}
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>

      <button
        onClick={onOpenSettings}
        className="size-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
      >
        <Settings className="size-4" />
      </button>
    </div>
  )
}
