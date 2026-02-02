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

export interface TimeBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  color: string
}

export interface Habit {
  id: string
  name: string
  icon: string
  completedDays: string[]
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
