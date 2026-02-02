'use client'

import Image from 'next/image'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlayingIndicator } from './playing-indicator'
import type { LofiStream } from './constants'

interface StationItemProps {
  stream: LofiStream
  index: number
  isActive: boolean
  isPlaying: boolean
  isReady: boolean
  onSelect: () => void
}

export function StationItem({
  stream,
  index,
  isActive,
  isPlaying,
  isReady,
  onSelect,
}: StationItemProps) {
  return (
    <button
      onClick={onSelect}
      disabled={!isReady}
      className={cn(
        "w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all group",
        isActive ? "bg-primary/10" : "hover:bg-muted/50",
        !isReady && "opacity-50"
      )}
    >
      {/* Index / Play indicator */}
      <div className="w-6 flex items-center justify-center shrink-0">
        {isPlaying ? (
          <PlayingIndicator size="sm" />
        ) : (
          <>
            <span className={cn(
              "text-sm tabular-nums group-hover:hidden",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {index + 1}
            </span>
            <Play className={cn(
              "size-4 hidden group-hover:block",
              isActive ? "text-primary" : "text-foreground"
            )} />
          </>
        )}
      </div>

      {/* Thumbnail */}
      <div className="size-10 rounded-lg overflow-hidden relative shrink-0 ring-1 ring-border/30">
        <Image
          src={stream.gif}
          alt={stream.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <p className={cn(
          "font-medium text-sm truncate",
          isActive && "text-primary"
        )}>
          {stream.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {stream.artist}
        </p>
      </div>

      {/* Status */}
      {isActive && (
        <div className="shrink-0">
          <div className={cn(
            "size-5 rounded-full flex items-center justify-center",
            isPlaying ? "text-primary" : "text-muted-foreground"
          )}>
            {isPlaying ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
          </div>
        </div>
      )}
    </button>
  )
}
