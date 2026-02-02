'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { PlayingIndicator } from './playing-indicator'
import type { LofiStream } from './constants'

interface StreamThumbnailProps {
  stream: LofiStream
  isPlaying: boolean
  size?: 'sm' | 'md' | 'lg'
  showGlow?: boolean
}

const sizeClasses = {
  sm: 'size-10',
  md: 'size-12',
  lg: 'size-16',
}

export function StreamThumbnail({ stream, isPlaying, size = 'md', showGlow = true }: StreamThumbnailProps) {
  return (
    <div className="relative shrink-0 group p-0.5">
      <div className={cn(
        sizeClasses[size],
        "rounded-xl overflow-hidden relative",
        "ring-1 ring-border/50",
        isPlaying && "ring-2 ring-primary/50"
      )}>
        <Image
          src={stream.gif}
          alt={stream.name}
          fill
          className="object-cover"
          unoptimized
        />
        {isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-1">
            <PlayingIndicator size={size === 'lg' ? 'md' : 'sm'} />
          </div>
        )}
      </div>
      {showGlow && isPlaying && (
        <div className="absolute inset-0 -z-10 bg-primary/20 blur-xl rounded-full scale-110" />
      )}
    </div>
  )
}
