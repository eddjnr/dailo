'use client'

import { useEffect, useRef } from 'react'

const SIZE = 32
const DEFAULT_FAVICON = '/logo.svg'

function setFavicon(href: string): void {
  // Remove all existing icon links to avoid conflicts (Next.js may generate multiple)
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((el) => el.remove())

  const link = document.createElement('link')
  link.rel = 'icon'
  link.href = href
  document.head.appendChild(link)
}

export function useFaviconTimer(
  isRunning: boolean,
  progress: number,
  phase: 'focus' | 'shortBreak' | 'longBreak',
  timeLeft: number,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!isRunning) {
      setFavicon(DEFAULT_FAVICON)
      return
    }

    // Lazy-create canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
      canvasRef.current.width = SIZE
      canvasRef.current.height = SIZE
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const center = SIZE / 2
    const radius = center - 2
    const ringWidth = 3.5
    const isFocus = phase === 'focus'
    const accentColor = isFocus ? '#f97316' : '#22c55e'

    // Clear
    ctx.clearRect(0, 0, SIZE, SIZE)

    // Background fill
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#18181b'
    ctx.fill()

    // Track ring
    ctx.beginPath()
    ctx.arc(center, center, radius - ringWidth / 2, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = ringWidth
    ctx.stroke()

    // Progress arc
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (progress / 100) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(center, center, radius - ringWidth / 2, startAngle, endAngle)
    ctx.strokeStyle = accentColor
    ctx.lineWidth = ringWidth
    ctx.lineCap = 'round'
    ctx.stroke()

    // Minutes text
    const mins = Math.ceil(timeLeft / 60)
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${SIZE * 0.42}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(mins.toString(), center, center + 1)

    // Apply to favicon
    setFavicon(canvasRef.current.toDataURL('image/png'))
  }, [isRunning, progress, phase, timeLeft])

  // Restore on unmount
  useEffect(() => {
    return () => setFavicon(DEFAULT_FAVICON)
  }, [])
}
