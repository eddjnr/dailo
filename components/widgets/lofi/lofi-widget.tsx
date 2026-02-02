'use client'

import { useEffect, useCallback, memo, useMemo } from 'react'
import Image from 'next/image'
import { Radio, Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { LOFI_STREAMS } from './constants'
import { playerManager } from './player-manager'
import { usePlayerState } from './use-player-state'
import { PlayingIndicator } from './playing-indicator'

export const LofiWidget = memo(function LofiWidget() {
  const state = usePlayerState()
  const customStreams = useAppStore((s) => s.customStreams)

  useEffect(() => {
    playerManager?.setCustomStreams(customStreams.map(s => ({
      id: s.id,
      name: s.name,
      videoId: s.videoId,
    })))
  }, [customStreams])

  const allStreams = useMemo(() => {
    const builtIn = LOFI_STREAMS.map(s => ({ ...s, isCustom: false }))
    const custom = customStreams.map(s => ({
      id: s.videoId,
      name: s.name,
      artist: 'Custom',
      gif: s.gif,
      isCustom: true,
    }))
    return [...builtIn, ...custom]
  }, [customStreams])

  const currentStream = allStreams[state.streamIndex] || allStreams[0]

  useEffect(() => {
    playerManager?.init()
  }, [])

  const togglePlay = useCallback(() => playerManager?.togglePlay(), [])
  const toggleMute = useCallback(() => playerManager?.toggleMute(), [])
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    playerManager?.setVolume(parseInt(e.target.value))
  }, [])
  const switchPrev = useCallback(() => playerManager?.switchStream('prev'), [])
  const switchNext = useCallback(() => playerManager?.switchStream('next'), [])

  return (
    <div className="flex gap-4 h-full overflow-hidden">
      {/* Large Thumbnail */}
      <div className="relative shrink-0 h-full aspect-square max-h-32 p-0.5">
        <div className={cn(
          "size-full rounded-2xl overflow-hidden relative",
          state.isPlaying && "ring-2 ring-primary"
        )}>
          <Image
            src={currentStream.gif}
            alt={currentStream.name}
            fill
            className="object-cover"
            unoptimized
          />
          {state.isPlaying && (
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent flex items-end justify-center pb-2">
              <PlayingIndicator size="md" />
            </div>
          )}
        </div>
        {state.isPlaying && (
          <div className="absolute inset-0 -z-10 bg-primary/20 blur-xl rounded-full scale-110" />
        )}
      </div>

      {/* Right: Info & Controls */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
        {/* Title & Status */}
        <div>
          <p className="font-semibold text-base truncate">{currentStream.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Radio className={cn(
              "size-3",
              state.isPlaying ? "text-primary" : "text-muted-foreground/50"
            )} />
            <p className="text-xs text-muted-foreground">
              {state.isPlaying ? 'Now Playing' : 'Lofi Beats'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={switchPrev}
              disabled={!state.isReady}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 rounded-lg hover:bg-muted/30"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!state.isReady}
              className={cn(
                "size-9 rounded-xl flex items-center justify-center transition-all duration-300",
                state.isPlaying
                  ? "bg-primary text-primary-foreground shadow-lg animate-gentle-pulse"
                  : "bg-muted/50 text-foreground hover:bg-muted",
                !state.isReady && "opacity-50 cursor-wait"
              )}
            >
              {state.isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4 ml-0.5" />
              )}
            </button>

            <button
              onClick={switchNext}
              disabled={!state.isReady}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 rounded-lg hover:bg-muted/30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-1 text-muted-foreground hover:text-foreground transition-all rounded-lg hover:bg-muted/30"
            >
              {state.isMuted ? (
                <VolumeX className="size-3.5" />
              ) : (
                <Volume2 className="size-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={state.isMuted ? 0 : state.volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
})
