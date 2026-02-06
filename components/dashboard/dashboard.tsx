'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useWidgetResize } from '@/hooks/use-widget-resize'
import type { Widget } from '@/lib/types'
import { GreetingHeader } from './greeting-header'
import { WidgetGrid } from './widget-grid'
import { FullscreenWidget } from './fullscreen-widget'

export function Dashboard() {
  const widgets = useAppStore((state) => state.widgets)
  const reorderWidgets = useAppStore((state) => state.reorderWidgets)
  const updateWidgetHeight = useAppStore((state) => state.updateWidgetHeight)
  const isCustomizing = useAppStore((state) => state.isCustomizing)

  const [fullscreenWidget, setFullscreenWidget] = useState<Widget | null>(null)

  const { handleResizeStart } = useWidgetResize(updateWidgetHeight)

  return (
    <main className="flex-1 min-w-0 p-6">
      <GreetingHeader />

      <WidgetGrid
        widgets={widgets}
        isCustomizing={isCustomizing}
        onReorderWidgets={reorderWidgets}
        onFullscreen={setFullscreenWidget}
        onResizeStart={handleResizeStart}
      />

      <FullscreenWidget
        widget={fullscreenWidget}
        onClose={() => setFullscreenWidget(null)}
      />
    </main>
  )
}
