'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { playerManager } from './player-manager'
import { DEFAULT_PLAYER_STATE, PlayerState } from './constants'

export function usePlayerState(): PlayerState {
  return useSyncExternalStore(
    useCallback((callback) => {
      if (!playerManager) return () => {}
      return playerManager.subscribe(callback)
    }, []),
    () => playerManager?.getState() ?? DEFAULT_PLAYER_STATE,
    () => DEFAULT_PLAYER_STATE
  )
}
