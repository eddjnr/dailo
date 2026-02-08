'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { ambientManager, AmbientState, DEFAULT_AMBIENT_STATE } from './ambient-manager'

export function useAmbientState(): AmbientState {
  return useSyncExternalStore(
    useCallback((callback) => {
      if (!ambientManager) return () => {}
      return ambientManager.subscribe(callback)
    }, []),
    () => ambientManager?.getState() ?? DEFAULT_AMBIENT_STATE,
    () => DEFAULT_AMBIENT_STATE
  )
}
