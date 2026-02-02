import { Clock, StickyNote, Music, ListTodo, Flame, CalendarClock, LayoutGrid } from 'lucide-react'

export const WIDGET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pomodoro: Clock,
  timeblock: CalendarClock,
  notes: StickyNote,
  lofi: Music,
  todo: ListTodo,
  habits: Flame,
}

export const DEFAULT_WIDGET_ICON = LayoutGrid

export const MIN_WIDGET_HEIGHT = 150
export const MAX_WIDGET_HEIGHT = 800
