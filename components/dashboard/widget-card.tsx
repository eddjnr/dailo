'use client'

import { memo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { GripVertical, Eye, EyeOff, Maximize2, GripHorizontal, Loader2 } from 'lucide-react'
import type { Widget } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

// Loading placeholder for widgets
const WidgetLoader = () => (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="size-5 animate-spin text-muted-foreground" />
  </div>
)

// Dynamic imports for all widgets to prevent hydration/unmount issues
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
const LofiWidget = dynamic(
  () => import('@/components/widgets/lofi').then(mod => ({ default: mod.LofiWidget })),
  { ssr: false, loading: WidgetLoader }
)

interface WidgetCardProps {
  widget: Widget
  isCustomizing?: boolean
  isOverlay?: boolean
  dragHandleProps?: Record<string, unknown>
  onFullscreen?: (widget: Widget) => void
  onResizeStart?: (widget: Widget, e: React.MouseEvent) => void
}

const widgetComponents: Record<Widget['type'], React.ComponentType> = {
  pomodoro: PomodoroWidget,
  todo: TodoWidget,
  timeblock: TimeBlockWidget,
  habits: HabitsWidget,
  notes: NotesWidget,
  lofi: LofiWidget,
}

const widgetTitles: Record<Widget['type'], string> = {
  pomodoro: 'Pomodoro Timer',
  todo: 'Tasks',
  timeblock: 'Time Blocking',
  habits: 'Habit Tracker',
  notes: 'Quick Notes',
  lofi: 'Lofi Player',
}

// Isolado com memo - só re-renderiza quando o type muda (nunca durante digitação)
const WidgetContent = memo(function WidgetContent({ type }: { type: Widget['type'] }) {
  const Component = widgetComponents[type]
  return <Component />
})

export function WidgetCard({ widget, isCustomizing = false, isOverlay = false, dragHandleProps, onFullscreen, onResizeStart }: WidgetCardProps) {
  const router = useRouter()
  const toggleWidgetVisibility = useAppStore((state) => state.toggleWidgetVisibility)

  const handleFullscreen = () => {
    if (widget.type === 'todo') {
      router.push('/tasks')
    } else if (widget.type === 'notes') {
      router.push('/notes')
    } else if (widget.type === 'timeblock') {
      router.push('/timeblock')
    } else if (widget.type === 'habits') {
      router.push('/habits')
    } else if (onFullscreen) {
      onFullscreen(widget)
    }
  }

  return (
    <div
      className={cn(
        "w-full h-full relative group/card",
        !widget.visible && "opacity-40",
        isOverlay && "rotate-1 scale-[1.02] cursor-grabbing"
      )}
    >
      <div
        className={cn(
          "h-full rounded-2xl bg-muted/20 border border-border/50 text-card-foreground p-5 flex flex-col transition-all duration-200",
          isCustomizing && "border-primary/30 group-hover/card:border-primary",
          isOverlay && "border-primary shadow-2xl shadow-primary/20"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg transition-colors touch-none",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              {...dragHandleProps}
            >
              <GripVertical className="size-4" />
            </button>
            <h3 className="text-sm font-medium">{widgetTitles[widget.type]}</h3>
          </div>

          <div className="flex items-center gap-1">
            {/* Fullscreen button - always visible on hover */}
            {!isOverlay && (onFullscreen || widget.type === 'todo' || widget.type === 'notes' || widget.type === 'timeblock' || widget.type === 'habits') && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFullscreen()
                }}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  "text-muted-foreground/0 group-hover/card:text-muted-foreground",
                  "hover:text-foreground hover:bg-muted/50",
                  "active:scale-95"
                )}
                title="Expand widget"
              >
                <Maximize2 className="size-4" />
              </button>
            )}

            {isCustomizing && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleWidgetVisibility(widget.id)
                }}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  widget.visible
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    : "text-destructive hover:bg-destructive/10"
                )}
                title={widget.visible ? 'Hide widget' : 'Show widget'}
              >
                {widget.visible ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <WidgetContent type={widget.type} />
        </div>
      </div>

      {/* Resize handle - bottom edge for height */}
      {isCustomizing && !isOverlay && onResizeStart && (
        <div
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onResizeStart(widget, e)
          }}
          className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2",
            "flex items-center justify-center",
            "w-16 h-4 rounded-full",
            "bg-muted/30 border border-border/50 cursor-ns-resize",
            "opacity-0 group-hover/card:opacity-100 transition-opacity",
            "hover:bg-primary/20 active:bg-primary/30"
          )}
        >
          <GripHorizontal className="size-3 text-muted-foreground" />
        </div>
      )}

    </div>
  )
}
