'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { Widget } from '@/lib/types'
import { MIN_WIDGET_HEIGHT, MAX_WIDGET_HEIGHT } from '@/components/dashboard/constants'

export function useWidgetResize(
  updateWidgetHeight: (id: string, height: number) => void
) {
  const [resizingWidget, setResizingWidget] = useState<Widget | null>(null)
  const resizeStartY = useRef(0)
  const resizeStartHeight = useRef(0)

  const handleResizeStart = useCallback((widget: Widget, e: React.MouseEvent) => {
    setResizingWidget(widget)
    resizeStartY.current = e.clientY
    resizeStartHeight.current = widget.height
  }, [])

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingWidget) return

    const deltaY = e.clientY - resizeStartY.current
    const newHeight = Math.max(
      MIN_WIDGET_HEIGHT,
      Math.min(MAX_WIDGET_HEIGHT, resizeStartHeight.current + deltaY)
    )

    updateWidgetHeight(resizingWidget.id, newHeight)
  }, [resizingWidget, updateWidgetHeight])

  const handleResizeEnd = useCallback(() => {
    setResizingWidget(null)
  }, [])

  useEffect(() => {
    if (resizingWidget) {
      window.addEventListener('mousemove', handleResizeMove)
      window.addEventListener('mouseup', handleResizeEnd)
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove)
      window.removeEventListener('mouseup', handleResizeEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizingWidget, handleResizeMove, handleResizeEnd])

  return {
    resizingWidget,
    handleResizeStart,
  }
}
