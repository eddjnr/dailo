import { LOFI_STREAMS, PlayerState, LofiStream } from './constants'
import type { YouTubePlayer, YouTubeEvent } from './types'

export interface CustomStreamData {
  id: string
  name: string
  videoId: string
}

class YouTubePlayerManager {
  private static instance: YouTubePlayerManager | null = null
  private player: YouTubePlayer | null = null
  private container: HTMLDivElement | null = null
  private initialized = false
  private listeners = new Set<() => void>()
  private customStreams: CustomStreamData[] = []
  private state: PlayerState = {
    isPlaying: false,
    isReady: false,
    volume: 50,
    isMuted: false,
    streamIndex: 0,
  }

  private constructor() {}

  static getInstance(): YouTubePlayerManager {
    if (!YouTubePlayerManager.instance) {
      YouTubePlayerManager.instance = new YouTubePlayerManager()
    }
    return YouTubePlayerManager.instance
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getState(): PlayerState {
    return this.state
  }

  private setState(partial: Partial<PlayerState>) {
    this.state = { ...this.state, ...partial }
    this.notify()
  }

  setCustomStreams(streams: CustomStreamData[]) {
    this.customStreams = streams
    this.notify()
  }

  getAllStreams(): Array<{ id: string; name: string; artist: string; gif: string; isCustom?: boolean }> {
    const builtIn = LOFI_STREAMS.map(s => ({ ...s, isCustom: false }))
    const custom = this.customStreams.map(s => ({
      id: s.videoId,
      name: s.name,
      artist: 'Custom',
      gif: '/lofi.gif',
      isCustom: true,
    }))
    return [...builtIn, ...custom]
  }

  getCurrentStream() {
    const allStreams = this.getAllStreams()
    return allStreams[this.state.streamIndex] || allStreams[0]
  }

  getStreamCount() {
    return LOFI_STREAMS.length + this.customStreams.length
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true

    // Create container in document.body
    this.container = document.createElement('div')
    this.container.id = 'youtube-player-container'
    this.container.style.cssText = 'position:fixed;bottom:0;right:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;'
    const playerDiv = document.createElement('div')
    playerDiv.id = 'youtube-player-singleton'
    this.container.appendChild(playerDiv)
    document.body.appendChild(this.container)

    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player && !this.player) {
        this.player = new window.YT.Player('youtube-player-singleton', {
          videoId: LOFI_STREAMS[this.state.streamIndex].id,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              this.setState({ isReady: true })
              this.player?.setVolume(this.state.volume)
            },
            onStateChange: (event: YouTubeEvent) => {
              if (window.YT) {
                this.setState({ isPlaying: event.data === window.YT.PlayerState.PLAYING })
              }
            },
          },
        })
      }
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }
  }

  togglePlay() {
    if (!this.player || !this.state.isReady) return

    if (this.state.isPlaying) {
      this.player.pauseVideo()
    } else {
      this.player.playVideo()
    }
  }

  setVolume(volume: number) {
    this.setState({ volume, isMuted: false })
    if (this.player && this.state.isReady) {
      this.player.unMute()
      this.player.setVolume(volume)
    }
  }

  toggleMute() {
    if (!this.player || !this.state.isReady) return

    if (this.state.isMuted) {
      this.player.unMute()
      this.player.setVolume(this.state.volume)
    } else {
      this.player.mute()
    }
    this.setState({ isMuted: !this.state.isMuted })
  }

  switchStream(direction: 'prev' | 'next') {
    if (!this.player || !this.state.isReady) return

    const allStreams = this.getAllStreams()
    const totalStreams = allStreams.length

    const newIndex = direction === 'next'
      ? (this.state.streamIndex + 1) % totalStreams
      : (this.state.streamIndex - 1 + totalStreams) % totalStreams

    this.setState({ streamIndex: newIndex })
    this.player.loadVideoById(allStreams[newIndex].id)
  }

  selectStream(index: number) {
    if (!this.player || !this.state.isReady) return
    const allStreams = this.getAllStreams()
    if (index < 0 || index >= allStreams.length) return
    if (index === this.state.streamIndex) return

    this.setState({ streamIndex: index })
    this.player.loadVideoById(allStreams[index].id)
  }

  playVideoById(videoId: string) {
    if (!this.player || !this.state.isReady) return

    // Find the stream index for this video ID
    const allStreams = this.getAllStreams()
    const index = allStreams.findIndex(s => s.id === videoId)

    if (index !== -1) {
      this.setState({ streamIndex: index })
    }

    this.player.loadVideoById(videoId)
  }
}

// Get singleton instance
export const playerManager = typeof window !== 'undefined' ? YouTubePlayerManager.getInstance() : null
