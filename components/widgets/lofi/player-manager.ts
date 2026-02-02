import { LOFI_STREAMS, PlayerState } from './constants'
import type { YouTubePlayer, YouTubeEvent } from './types'

class YouTubePlayerManager {
  private static instance: YouTubePlayerManager | null = null
  private player: YouTubePlayer | null = null
  private container: HTMLDivElement | null = null
  private initialized = false
  private listeners = new Set<() => void>()
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

    const newIndex = direction === 'next'
      ? (this.state.streamIndex + 1) % LOFI_STREAMS.length
      : (this.state.streamIndex - 1 + LOFI_STREAMS.length) % LOFI_STREAMS.length

    this.setState({ streamIndex: newIndex })
    this.player.loadVideoById(LOFI_STREAMS[newIndex].id)
  }

  selectStream(index: number) {
    if (!this.player || !this.state.isReady) return
    if (index < 0 || index >= LOFI_STREAMS.length) return
    if (index === this.state.streamIndex) return

    this.setState({ streamIndex: index })
    this.player.loadVideoById(LOFI_STREAMS[index].id)
  }
}

// Get singleton instance
export const playerManager = typeof window !== 'undefined' ? YouTubePlayerManager.getInstance() : null
