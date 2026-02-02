'use client'

import { useEffect, useCallback, memo } from 'react'
import { Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LOFI_STREAMS } from './constants'
import { playerManager } from './player-manager'
import { usePlayerState } from './use-player-state'
import { StreamThumbnail } from './stream-thumbnail'
import { PlayerControls } from './player-controls'
import { StationItem } from './station-item'

export const LofiFullscreenWidget = memo(function LofiFullscreenWidget() {
  const state = usePlayerState()
  const currentStream = LOFI_STREAMS[state.streamIndex]

  useEffect(() => {
    playerManager?.init()
  }, [])

  const togglePlay = useCallback(() => playerManager?.togglePlay(), [])
  const toggleMute = useCallback(() => playerManager?.toggleMute(), [])
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    playerManager?.setVolume(parseInt(e.target.value))
  }, [])

  const selectStream = useCallback((index: number) => {
    playerManager?.selectStream(index)
    // Auto-play when selecting a new stream
    if (!state.isPlaying) {
      setTimeout(() => playerManager?.togglePlay(), 100)
    }
  }, [state.isPlaying])

  const handleStationSelect = useCallback((index: number) => {
    if (index === state.streamIndex) {
      togglePlay()
    } else {
      selectStream(index)
    }
  }, [state.streamIndex, togglePlay, selectStream])

  return (
    <div className="flex flex-col h-full">
      {/* Now Playing Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-border/50">
        <StreamThumbnail
          stream={currentStream}
          isPlaying={state.isPlaying}
          size="lg"
          showGlow={true}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg truncate">{currentStream.name}</p>
          <p className="text-sm text-muted-foreground">{currentStream.artist}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Radio className={cn(
              "size-3.5",
              state.isPlaying ? "text-primary" : "text-muted-foreground/50"
            )} />
            <p className="text-xs text-muted-foreground">
              {state.isPlaying ? 'Now Playing' : 'Paused'}
            </p>
          </div>
        </div>
      </div>

      {/* Station List */}
      <div className="flex-1 py-4 overflow-y-auto -mx-2">
        <div className="space-y-1">
          {LOFI_STREAMS.map((stream, index) => (
            <StationItem
              key={stream.id}
              stream={stream}
              index={index}
              isActive={index === state.streamIndex}
              isPlaying={index === state.streamIndex && state.isPlaying}
              isReady={state.isReady}
              onSelect={() => handleStationSelect(index)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pt-4 border-t border-border/50">
        <PlayerControls
          isPlaying={state.isPlaying}
          isReady={state.isReady}
          volume={state.volume}
          isMuted={state.isMuted}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onVolumeChange={handleVolumeChange}
          showNavigation={false}
          size="lg"
        />
      </div>
    </div>
  )
})
