export type WidgetType =
  | 'pomodoro'
  | 'todo'
  | 'timeblock'
  | 'habits'
  | 'notes'
  | 'lofi'

export type WidgetWidth = 1 | 2 | 3

export interface Widget {
  id: string
  type: WidgetType
  title: string
  height: number // Height in pixels
  width: WidgetWidth
  column: number // 0, 1, or 2 (which column the widget is in)
  order: number // Order within the column
  visible: boolean
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 1 | 2 | 3
}

export type TaskStatus = 'todo' | 'working' | 'in-progress' | 'done'

export interface Task {
  id: string
  title: string
  description: string // HTML content from Tiptap
  status: TaskStatus
  priority: 1 | 2 | 3
  tags: string[]
  dueDate: string | null
  createdAt: string
  updatedAt: string
  order: number // Position within column
}

export type EventColor = 'sky' | 'amber' | 'violet' | 'rose' | 'emerald' | 'orange'

export interface TimeBlock {
  id: string
  title: string
  description?: string
  start: string // ISO date string
  end: string // ISO date string
  allDay?: boolean
  color?: EventColor
  location?: string
}

export type HabitType = 'binary' | 'count'

export interface HabitDayData {
  date: string      // YYYY-MM-DD
  count: number     // Para count: valor atual; para binary: 0 ou 1
}

export interface Habit {
  id: string
  name: string
  icon: string
  type: HabitType
  target: number    // Para count: meta diária; para binary: sempre 1
  unit?: string     // Opcional: "copos", "páginas", etc.
  dayData: HabitDayData[]
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string // HTML content from Tiptap
  createdAt: string
  updatedAt: string
}

export interface PomodoroSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
}

export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak'

export interface PomodoroTimerState {
  phase: PomodoroPhase
  timeLeft: number
  isRunning: boolean
  sessionsCompleted: number
}

export interface CustomStream {
  id: string
  name: string
  videoId: string
  gif: string
}

export interface ExcalidrawData {
  elements: unknown[]
  appState: Record<string, unknown>
  files: Record<string, unknown>
}
