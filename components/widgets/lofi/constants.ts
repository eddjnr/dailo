export interface LofiStream {
  id: string
  name: string
  artist: string
  gif: string
}

export const LOFI_STREAMS: LofiStream[] = [
  { id: 'qH3fETPsqXU', name: 'Lofi Hip Hop', artist: 'Chillhop Music', gif: '/lofi.gif' },
  { id: 'jfKfPfyJRdk', name: 'Lofi Girl', artist: 'Lofi Girl', gif: '/lofi-girl.gif' },
]

export interface PlayerState {
  isPlaying: boolean
  isReady: boolean
  volume: number
  isMuted: boolean
  streamIndex: number
}

export const DEFAULT_PLAYER_STATE: PlayerState = {
  isPlaying: false,
  isReady: false,
  volume: 50,
  isMuted: false,
  streamIndex: 0,
}
