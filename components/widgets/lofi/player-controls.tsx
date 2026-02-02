'use client'

import { Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerControlsProps {
  isPlaying: boolean
  isReady: boolean
  volume: number
  isMuted: boolean
  onTogglePlay: () => void
  onToggleMute: () => void
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPrev?: () => void
  onNext?: () => void
  showNavigation?: boolean
  size?: 'sm' | 'lg'
}

export function PlayerControls({
  isPlaying,
  isReady,
  volume,
  isMuted,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onPrev,
  onNext,
  showNavigation = true,
  size = 'sm',
}: PlayerControlsProps) {
  const buttonSize = size === 'lg' ? 'size-12' : 'size-10'
  const iconSize = size === 'lg' ? 'size-5' : 'size-4'
  const volumeWidth = size === 'lg' ? 'w-32' : 'w-20'

  return (
    <div className="flex items-center justify-between">
      {/* Playback controls */}
      <div className="flex items-center gap-1">
        {showNavigation && onPrev && (
          <button
            onClick={onPrev}
            disabled={!isReady}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-30 rounded-lg hover:bg-muted/30"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}

        <button
          onClick={onTogglePlay}
          disabled={!isReady}
          className={cn(
            buttonSize,
            "rounded-xl flex items-center justify-center transition-all duration-300",
            isPlaying
              ? "bg-primary text-primary-foreground shadow-lg animate-gentle-pulse"
              : "bg-muted/50 text-foreground hover:bg-muted",
            !isReady && "opacity-50 cursor-wait"
          )}
        >
          {isPlaying ? (
            <Pause className={iconSize} />
          ) : (
            <Play className={cn(iconSize, "ml-0.5")} />
          )}
        </button>

        {showNavigation && onNext && (
          <button
            onClick={onNext}
            disabled={!isReady}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-30 rounded-lg hover:bg-muted/30"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>

      {/* Volume controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-muted/30"
        >
          {isMuted ? (
            <VolumeX className={iconSize} />
          ) : (
            <Volume2 className={iconSize} />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={onVolumeChange}
          className={cn(volumeWidth, "h-1.5 rounded-full cursor-pointer")}
        />
      </div>
    </div>
  )
}
