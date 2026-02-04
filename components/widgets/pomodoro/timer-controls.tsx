'use client'

import { RotateCcw, Settings, PictureInPicture2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerControlsProps {
  isRunning: boolean
  onToggle: () => void
  onReset: () => void
  onOpenSettings: () => void
  onPip?: () => void
  isPipSupported?: boolean
}

export function TimerControls({ isRunning, onToggle, onReset, onOpenSettings, onPip, isPipSupported }: TimerControlsProps) {
  return (
    <div className="flex items-center shrink-0 pt-2 mt-auto">
      <div className="flex items-center gap-0.5 flex-1">
        <button
          onClick={onReset}
          className="size-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

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

      <div className="flex items-center gap-0.5 flex-1 justify-end">
        {isPipSupported && onPip && (
          <button
            onClick={onPip}
            className="size-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            title="Picture in Picture"
          >
            <PictureInPicture2 className="size-4" />
          </button>
        )}
        <button
          onClick={onOpenSettings}
          className="size-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </div>
  )
}
