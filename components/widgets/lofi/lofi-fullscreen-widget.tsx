'use client'

import { useEffect, useCallback, memo, useState, useMemo } from 'react'
import { Radio, X, Link } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { LOFI_STREAMS } from './constants'
import { playerManager } from './player-manager'
import { usePlayerState } from './use-player-state'
import { StreamThumbnail } from './stream-thumbnail'
import { PlayerControls } from './player-controls'
import { StationItem } from './station-item'

const THUMBNAIL_OPTIONS = [
  '/lofi-1.gif',
  '/lofi-2.gif',
  '/lofi-3.gif',
  '/lofi-4.gif',
]

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export const LofiFullscreenWidget = memo(function LofiFullscreenWidget() {
  const state = usePlayerState()
  const { customStreams, addCustomStream, deleteCustomStream } = useAppStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')
  const [newGif, setNewGif] = useState(THUMBNAIL_OPTIONS[0])
  const [error, setError] = useState('')

  // Sync custom streams to player manager
  useEffect(() => {
    playerManager?.setCustomStreams(customStreams.map(s => ({
      id: s.id,
      name: s.name,
      videoId: s.videoId,
    })))
  }, [customStreams])

  // Compute all streams reactively
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

  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const videoId = extractVideoId(newUrl.trim())
    if (!videoId) {
      setError('Invalid YouTube URL')
      return
    }

    const name = newName.trim() || 'Custom Stream'
    addCustomStream(name, videoId, newGif)
    setNewUrl('')
    setNewName('')
    setNewGif(THUMBNAIL_OPTIONS[0])
    setIsAdding(false)
  }

  const handleDeleteCustomStream = (id: string) => {
    deleteCustomStream(id)
  }

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
          {allStreams.map((stream, index) => (
            <div key={stream.id} className="relative group/station flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <StationItem
                  stream={stream}
                  index={index}
                  isActive={index === state.streamIndex}
                  isPlaying={index === state.streamIndex && state.isPlaying}
                  isReady={state.isReady}
                  onSelect={() => handleStationSelect(index)}
                />
              </div>
              {stream.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const customStream = customStreams.find(s => s.videoId === stream.id)
                    if (customStream) handleDeleteCustomStream(customStream.id)
                  }}
                  className="shrink-0 mr-2 p-1.5 rounded-lg opacity-0 group-hover/station:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add Stream Form */}
          {isAdding ? (
            <form onSubmit={handleAddStream} className="p-3 rounded-xl bg-muted/30 space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Stream name (optional)"
                className="w-full px-3 py-2 text-sm bg-background rounded-lg border border-border/50 focus:border-primary outline-none"
                autoFocus
              />
              <input
                type="text"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value)
                  setError('')
                }}
                placeholder="YouTube URL or video ID"
                className="w-full px-3 py-2 text-sm bg-background rounded-lg border border-border/50 focus:border-primary outline-none"
              />
              {/* Thumbnail selector */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Thumbnail</p>
                <div className="flex gap-2">
                  {THUMBNAIL_OPTIONS.map((gif) => (
                    <button
                      key={gif}
                      type="button"
                      onClick={() => setNewGif(gif)}
                      className={cn(
                        "size-12 rounded-lg overflow-hidden border-2 transition-all",
                        newGif === gif ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={gif} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setNewUrl('')
                    setNewName('')
                    setNewGif(THUMBNAIL_OPTIONS[0])
                    setError('')
                  }}
                  className="flex-1 px-3 py-2 text-xs rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newUrl.trim()}
                  className="flex-1 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-lg disabled:opacity-40 transition-opacity"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 w-full px-5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <Link className="size-4" />
              <span>Add YouTube URL</span>
            </button>
          )}
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
