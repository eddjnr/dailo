'use client'

import { useEffect, useCallback, memo } from 'react'
import { Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LOFI_STREAMS } from './constants'
import { playerManager } from './player-manager'
import { usePlayerState } from './use-player-state'
import { StreamThumbnail } from './stream-thumbnail'
import { PlayerControls } from './player-controls'

export const LofiWidget = memo(function LofiWidget() {
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
  const switchPrev = useCallback(() => playerManager?.switchStream('prev'), [])
  const switchNext = useCallback(() => playerManager?.switchStream('next'), [])

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top: Thumbnail + Info */}
      <div className="flex items-center gap-3">
        <StreamThumbnail
          stream={currentStream}
          isPlaying={state.isPlaying}
          size="md"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{currentStream.name}</p>
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
      </div>

      {/* Bottom: Controls + Volume */}
      <div className="mt-auto pt-3">
        <PlayerControls
          isPlaying={state.isPlaying}
          isReady={state.isReady}
          volume={state.volume}
          isMuted={state.isMuted}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onVolumeChange={handleVolumeChange}
          onPrev={switchPrev}
          onNext={switchNext}
          showNavigation={true}
          size="sm"
        />
      </div>
    </div>
  )
})
