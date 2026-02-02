'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { useAppStore } from '@/lib/store'
import { useWidgetResize } from '@/hooks/use-widget-resize'
import type { Widget } from '@/lib/types'
import { Logo } from '@/components/ui/logo'
import { Sidebar } from './sidebar'
import { GreetingHeader } from './greeting-header'
import { WidgetGrid } from './widget-grid'
import { FullscreenWidget } from './fullscreen-widget'

const emptySubscribe = () => () => {}

export function Dashboard() {
  const {
    widgets,
    reorderWidgets,
    toggleWidgetVisibility,
    updateWidgetHeight,
    theme,
    toggleTheme,
  } = useAppStore()

  const [isCustomizing, setIsCustomizing] = useState(false)
  const [fullscreenWidget, setFullscreenWidget] = useState<Widget | null>(null)

  const { handleResizeStart } = useWidgetResize(updateWidgetHeight)

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Logo className="size-8 text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        widgets={widgets}
        theme={theme}
        isCustomizing={isCustomizing}
        onToggleTheme={toggleTheme}
        onToggleCustomizing={() => setIsCustomizing(!isCustomizing)}
        onToggleWidgetVisibility={toggleWidgetVisibility}
        onWidgetClick={setFullscreenWidget}
      />

      <main className="flex-1 min-w-0 p-6">
        <GreetingHeader />

        <WidgetGrid
          widgets={widgets}
          isCustomizing={isCustomizing}
          onReorderWidgets={reorderWidgets}
          onFullscreen={setFullscreenWidget}
          onResizeStart={handleResizeStart}
        />
      </main>

      <FullscreenWidget
        widget={fullscreenWidget}
        onClose={() => setFullscreenWidget(null)}
      />
    </div>
  )
}
