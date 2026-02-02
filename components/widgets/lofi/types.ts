export interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  setVolume: (volume: number) => void
  mute: () => void
  unMute: () => void
  destroy: () => void
  loadVideoById: (videoId: string) => void
}

export interface YouTubePlayerState {
  PLAYING: number
  PAUSED: number
  ENDED: number
}

export interface YouTubeEvent {
  data: number
}

export interface YouTubePlayerOptions {
  videoId: string
  playerVars?: Record<string, number | string>
  events?: {
    onReady?: () => void
    onStateChange?: (event: YouTubeEvent) => void
  }
}

export interface YouTubeAPI {
  Player: new (elementId: string, options: YouTubePlayerOptions) => YouTubePlayer
  PlayerState: YouTubePlayerState
}

declare global {
  interface Window {
    YT?: YouTubeAPI
    onYouTubeIframeAPIReady?: () => void
  }
}
