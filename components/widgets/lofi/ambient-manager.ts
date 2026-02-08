export interface AmbientSound {
  id: string
  name: string
  icon: string
  src: string
}

export interface AmbientState {
  volumes: Record<string, number>
  enabled: Record<string, boolean>
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', name: 'Rain', icon: 'CloudRain', src: '/rain.mp3' },
  { id: 'forest', name: 'Forest', icon: 'TreePine', src: '/forest.mp3' },
]

export const DEFAULT_AMBIENT_STATE: AmbientState = {
  volumes: Object.fromEntries(AMBIENT_SOUNDS.map(s => [s.id, 30])),
  enabled: Object.fromEntries(AMBIENT_SOUNDS.map(s => [s.id, false])),
}

class AmbientManager {
  private static instance: AmbientManager | null = null
  private audioElements: Map<string, HTMLAudioElement> = new Map()
  private listeners = new Set<() => void>()
  private state: AmbientState = DEFAULT_AMBIENT_STATE
  private initialized = false

  private constructor() {}

  static getInstance(): AmbientManager {
    if (!AmbientManager.instance) {
      AmbientManager.instance = new AmbientManager()
    }
    return AmbientManager.instance
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getState(): AmbientState {
    return this.state
  }

  private setState(partial: Partial<AmbientState>) {
    this.state = { ...this.state, ...partial }
    this.notify()
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true

    AMBIENT_SOUNDS.forEach((sound) => {
      const audio = new Audio(sound.src)
      audio.loop = true
      audio.volume = this.state.volumes[sound.id] / 100
      audio.preload = 'auto'
      this.audioElements.set(sound.id, audio)
    })
  }

  private playSound(id: string) {
    const audio = this.audioElements.get(id)
    if (audio) {
      audio.play().catch(() => {
        // Autoplay blocked, ignore
      })
    }
  }

  private pauseSound(id: string) {
    const audio = this.audioElements.get(id)
    if (audio) {
      audio.pause()
    }
  }

  toggleSound(id: string) {
    const newEnabled = { ...this.state.enabled, [id]: !this.state.enabled[id] }
    this.setState({ enabled: newEnabled })

    if (newEnabled[id]) {
      this.playSound(id)
    } else {
      this.pauseSound(id)
    }
  }

  setVolume(id: string, volume: number) {
    const newVolumes = { ...this.state.volumes, [id]: volume }
    this.setState({ volumes: newVolumes })

    const audio = this.audioElements.get(id)
    if (audio) {
      audio.volume = volume / 100
    }
  }

  // Restore state from persisted storage
  restoreState(state: Partial<AmbientState>) {
    if (state.volumes) {
      this.state.volumes = { ...this.state.volumes, ...state.volumes }
    }
    if (state.enabled) {
      this.state.enabled = { ...this.state.enabled, ...state.enabled }
    }

    // Apply volumes and start enabled sounds
    this.audioElements.forEach((audio, id) => {
      audio.volume = this.state.volumes[id] / 100
      if (this.state.enabled[id]) {
        this.playSound(id)
      }
    })

    this.notify()
  }
}

export const ambientManager = typeof window !== 'undefined' ? AmbientManager.getInstance() : null
