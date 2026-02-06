'use client'

import { useEffect, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { X, Loader2 } from 'lucide-react'
import type { Widget } from '@/lib/types'
import { cn } from '@/lib/utils'

// Loading placeholder
const WidgetLoader = () => (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="size-6 animate-spin text-muted-foreground" />
  </div>
)

// Dynamic imports for all widgets
const PomodoroWidget = dynamic(
  () => import('@/components/widgets/pomodoro').then(mod => ({ default: mod.PomodoroWidget })),
  { ssr: false, loading: WidgetLoader }
)
const TodoWidget = dynamic(
  () => import('@/components/widgets/todo-widget').then(mod => ({ default: mod.TodoWidget })),
  { ssr: false, loading: WidgetLoader }
)
const TimeBlockWidget = dynamic(
  () => import('@/components/widgets/timeblock').then(mod => ({ default: mod.TimeBlockWidget })),
  { ssr: false, loading: WidgetLoader }
)
const HabitsWidget = dynamic(
  () => import('@/components/widgets/habits-widget').then(mod => ({ default: mod.HabitsWidget })),
  { ssr: false, loading: WidgetLoader }
)
const NotesWidget = dynamic(
  () => import('@/components/widgets/notes-widget').then(mod => ({ default: mod.NotesWidget })),
  { ssr: false, loading: WidgetLoader }
)
const LofiFullscreenWidget = dynamic(
  () => import('@/components/widgets/lofi').then(mod => ({ default: mod.LofiFullscreenWidget })),
  { ssr: false, loading: WidgetLoader }
)

interface FullscreenWidgetProps {
  widget: Widget | null
  onClose: () => void
}

const widgetComponents: Record<Widget['type'], React.ComponentType> = {
  pomodoro: PomodoroWidget,
  todo: TodoWidget,
  timeblock: TimeBlockWidget,
  habits: HabitsWidget,
  notes: NotesWidget,
  lofi: LofiFullscreenWidget,
}

const widgetTitles: Record<Widget['type'], string> = {
  pomodoro: 'Pomodoro Timer',
  todo: 'Tasks',
  timeblock: 'Time Blocking',
  habits: 'Habit Tracker',
  notes: 'Quick Notes',
  lofi: 'Lofi Player',
}

export function FullscreenWidget({ widget, onClose }: FullscreenWidgetProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [currentWidget, setCurrentWidget] = useState<Widget | null>(null)

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }, [onClose])

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
  }, [handleClose])

  useEffect(() => {
    if (widget) {
      setCurrentWidget(widget)
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [widget, handleEscape])

  // Keep showing the widget during close animation
  const displayWidget = currentWidget

  if (!widget && !isClosing) {
    return null
  }

  if (!displayWidget) return null

  const WidgetComponent = widgetComponents[displayWidget.type]

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-xl transition-opacity duration-200",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
        <div
          className={cn(
            "pointer-events-auto relative w-full max-w-4xl h-full max-h-[80vh] bg-card rounded-3xl",
            "shadow-2xl shadow-black/20 border border-border/50",
            "flex flex-col overflow-hidden",
            "transition-all duration-200 ease-out",
            isClosing
              ? "opacity-0 scale-95 translate-y-4"
              : "opacity-100 scale-100 translate-y-0 animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <h2 className="text-lg font-semibold">{widgetTitles[displayWidget.type]}</h2>
            <button
              onClick={handleClose}
              className={cn(
                "size-10 rounded-xl flex items-center justify-center",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted/50 transition-all duration-200",
                "active:scale-95"
              )}
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            <WidgetComponent />
          </div>
        </div>
      </div>
    </div>
  )
}
