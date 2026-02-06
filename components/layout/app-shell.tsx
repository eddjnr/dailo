'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useAppStore } from '@/lib/store'
import { usePomodoroTick } from '@/hooks/use-pomodoro-tick'
import { Logo } from '@/components/ui/logo'
import { Sidebar } from '@/components/dashboard/sidebar'

const emptySubscribe = () => () => {}

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const isCustomizing = useAppStore((state) => state.isCustomizing)
  const toggleCustomizing = useAppStore((state) => state.toggleCustomizing)

  // Run pomodoro timer at layout level so it persists across navigation
  usePomodoroTick()

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
        theme={theme}
        isCustomizing={isCustomizing}
        onToggleTheme={toggleTheme}
        onToggleCustomizing={toggleCustomizing}
      />

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
