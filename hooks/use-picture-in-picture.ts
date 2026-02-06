'use client'

import { useState, useCallback, useRef, useLayoutEffect } from 'react'

interface PipOptions {
  width?: number
  height?: number
}

// Type augmentation for Document PiP API (Chrome 116+)
interface DocumentPictureInPicture {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>
  window: Window | null
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture
  }
}

export function usePictureInPicture() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null)
  const pipWindowRef = useRef<Window | null>(null)

  const isSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window
  const isOpen = pipWindow !== null

  const copyStyles = useCallback((target: Window) => {
    // Copy all stylesheets to PiP window
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      target.document.head.appendChild(node.cloneNode(true))
    })

    // Copy dark mode class
    if (document.documentElement.classList.contains('dark')) {
      target.document.documentElement.classList.add('dark')
    }

    // Ensure html/body fill the PiP window so h-full works
    target.document.documentElement.style.height = '100%'
    target.document.body.style.height = '100%'
    target.document.body.style.margin = '0'
  }, [])

  const open = useCallback(async (options?: PipOptions) => {
    if (!isSupported || pipWindowRef.current) return null

    try {
      const win = await window.documentPictureInPicture!.requestWindow({
        width: options?.width ?? 320,
        height: options?.height ?? 180,
      })

      copyStyles(win)

      // Listen for PiP window close
      win.addEventListener('pagehide', () => {
        pipWindowRef.current = null
        setPipWindow(null)
      })

      pipWindowRef.current = win
      setPipWindow(win)
      return win
    } catch {
      return null
    }
  }, [isSupported, copyStyles])

  const close = useCallback(() => {
    pipWindowRef.current?.close()
    pipWindowRef.current = null
    setPipWindow(null)
  }, [])

  // Cleanup on unmount - use layoutEffect for synchronous cleanup before DOM updates
  useLayoutEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        pipWindowRef.current.close()
        pipWindowRef.current = null
      }
    }
  }, [])

  return { pipWindow, isSupported, isOpen, open, close }
}
