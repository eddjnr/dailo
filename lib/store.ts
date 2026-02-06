'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Widget, Todo, TimeBlock, Habit, Note, PomodoroSettings, PomodoroTimerState, PomodoroPhase, CustomStream, Task, TaskStatus } from './types'

interface AppState {
  widgets: Widget[]
  todos: Todo[]
  tasks: Task[]
  activeTaskId: string | null
  timeBlocks: TimeBlock[]
  habits: Habit[]
  notes: Note[]
  activeNoteId: string | null
  pomodoroSettings: PomodoroSettings
  pomodoroTimer: PomodoroTimerState
  customStreams: CustomStream[]
  theme: 'light' | 'dark'
  isCustomizing: boolean

  // UI actions
  setIsCustomizing: (value: boolean) => void
  toggleCustomizing: () => void

  // Widget actions
  setWidgets: (widgets: Widget[]) => void
  toggleWidgetVisibility: (id: string) => void
  updateWidgetHeight: (id: string, height: Widget['height']) => void
  updateWidgetWidth: (id: string, width: Widget['width']) => void
  updateWidgetPosition: (id: string, column: number, order: number) => void
  reorderWidgets: (widgets: Widget[]) => void

  // Todo actions
  addTodo: (text: string, priority: 1 | 2 | 3) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, status: TaskStatus, newOrder: number) => void
  reorderTasks: (tasks: Task[]) => void
  setActiveTask: (id: string | null) => void

  // TimeBlock actions
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void
  updateTimeBlock: (id: string, block: Partial<TimeBlock>) => void
  deleteTimeBlock: (id: string) => void

  // Habit actions
  addHabit: (name: string, icon: string) => void
  toggleHabitDay: (id: string, date: string) => void
  deleteHabit: (id: string) => void

  // Notes actions
  addNote: (title?: string) => void
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void
  deleteNote: (id: string) => void
  setActiveNote: (id: string | null) => void

  // Pomodoro actions
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void
  updatePomodoroTimer: (timer: Partial<PomodoroTimerState>) => void
  tickPomodoroTimer: () => void
  resetPomodoroTimer: () => void

  // Custom streams actions
  addCustomStream: (name: string, videoId: string, gif: string) => void
  deleteCustomStream: (id: string) => void

  // Theme actions
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

const defaultWidgets: Widget[] = [
  { id: 'pomodoro', type: 'pomodoro', title: 'Pomodoro Timer', height: 310, width: 2, column: 0, order: 0, visible: true },
  { id: 'todo', type: 'todo', title: 'Tasks', height: 437, width: 1, column: 0, order: 1, visible: true },
  { id: 'timeblock', type: 'timeblock', title: 'Time Blocking', height: 558, width: 1, column: 1, order: 1, visible: true },
  { id: 'habits', type: 'habits', title: 'Habit Tracker', height: 336, width: 1, column: 2, order: 1, visible: true },
  { id: 'notes', type: 'notes', title: 'Quick Notes', height: 410, width: 1, column: 2, order: 0, visible: true },
  { id: 'lofi', type: 'lofi', title: 'Lofi Player', height: 190, width: 1, column: 1, order: 0, visible: true },
]

const defaultPomodoroSettings: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
}

const defaultPomodoroTimer: PomodoroTimerState = {
  phase: 'focus',
  timeLeft: 25 * 60,
  isRunning: false,
  sessionsCompleted: 0,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,
      todos: [],
      tasks: [],
      activeTaskId: null,
      timeBlocks: [],
      habits: [],
      notes: [],
      activeNoteId: null,
      pomodoroSettings: defaultPomodoroSettings,
      pomodoroTimer: defaultPomodoroTimer,
      customStreams: [],
      theme: 'dark',
      isCustomizing: false,

      setIsCustomizing: (value) => set({ isCustomizing: value }),
      toggleCustomizing: () => set((state) => ({ isCustomizing: !state.isCustomizing })),

      setWidgets: (widgets) => set({ widgets }),

      toggleWidgetVisibility: (id) => set((state) => ({
        widgets: state.widgets.map((w) =>
          w.id === id ? { ...w, visible: !w.visible } : w
        ),
      })),

      updateWidgetHeight: (id, height) => set((state) => ({
        widgets: state.widgets.map((w) =>
          w.id === id ? { ...w, height } : w
        ),
      })),

      updateWidgetWidth: (id, width) => set((state) => ({
        widgets: state.widgets.map((w) =>
          w.id === id ? { ...w, width } : w
        ),
      })),

      updateWidgetPosition: (id, column, order) => set((state) => ({
        widgets: state.widgets.map((w) =>
          w.id === id ? { ...w, column, order } : w
        ),
      })),

      reorderWidgets: (widgets) => set({ widgets }),

      addTodo: (text, priority) => set((state) => ({
        todos: [
          ...state.todos,
          { id: crypto.randomUUID(), text, completed: false, priority },
        ],
      })),

      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        ),
      })),

      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
      })),

      addTask: (task) => set((state) => {
        const now = new Date().toISOString()
        const tasksInColumn = state.tasks.filter((t) => t.status === task.status)
        const maxOrder = tasksInColumn.length > 0
          ? Math.max(...tasksInColumn.map((t) => t.order))
          : -1
        return {
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: crypto.randomUUID(),
              createdAt: now,
              updatedAt: now,
              order: maxOrder + 1,
            },
          ],
        }
      }),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
      })),

      moveTask: (id, status, newOrder) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status, order: newOrder, updatedAt: new Date().toISOString() } : t
        ),
      })),

      reorderTasks: (tasks) => set({ tasks }),

      setActiveTask: (id) => set({ activeTaskId: id }),

      addTimeBlock: (block) => set((state) => ({
        timeBlocks: [
          ...state.timeBlocks,
          { ...block, id: crypto.randomUUID() },
        ],
      })),

      updateTimeBlock: (id, block) => set((state) => ({
        timeBlocks: state.timeBlocks.map((tb) =>
          tb.id === id ? { ...tb, ...block } : tb
        ),
      })),

      deleteTimeBlock: (id) => set((state) => ({
        timeBlocks: state.timeBlocks.filter((tb) => tb.id !== id),
      })),

      addHabit: (name, icon) => set((state) => ({
        habits: [
          ...state.habits,
          { id: crypto.randomUUID(), name, icon, completedDays: [] },
        ],
      })),

      toggleHabitDay: (id, date) => set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id
            ? {
                ...h,
                completedDays: h.completedDays.includes(date)
                  ? h.completedDays.filter((d) => d !== date)
                  : [...h.completedDays, date],
              }
            : h
        ),
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      })),

      addNote: (title) => set((state) => {
        const now = new Date().toISOString()
        const newNote: Note = {
          id: crypto.randomUUID(),
          title: title || 'Untitled',
          content: '',
          createdAt: now,
          updatedAt: now,
        }
        return {
          notes: [newNote, ...state.notes],
          activeNoteId: newNote.id,
        }
      }),

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
        ),
      })),

      deleteNote: (id) => set((state) => {
        const newNotes = state.notes.filter((n) => n.id !== id)
        return {
          notes: newNotes,
          activeNoteId: state.activeNoteId === id
            ? (newNotes[0]?.id ?? null)
            : state.activeNoteId,
        }
      }),

      setActiveNote: (id) => set({ activeNoteId: id }),

      updatePomodoroSettings: (settings) => set((state) => ({
        pomodoroSettings: { ...state.pomodoroSettings, ...settings },
      })),

      updatePomodoroTimer: (timer) => set((state) => ({
        pomodoroTimer: { ...state.pomodoroTimer, ...timer },
      })),

      tickPomodoroTimer: () => set((state) => ({
        pomodoroTimer: { ...state.pomodoroTimer, timeLeft: state.pomodoroTimer.timeLeft - 1 },
      })),

      resetPomodoroTimer: () => set((state) => ({
        pomodoroTimer: {
          phase: 'focus',
          timeLeft: state.pomodoroSettings.focusDuration * 60,
          isRunning: false,
          sessionsCompleted: 0,
        },
      })),

      addCustomStream: (name, videoId, gif) => set((state) => ({
        customStreams: [
          ...state.customStreams,
          { id: crypto.randomUUID(), name, videoId, gif },
        ],
      })),

      deleteCustomStream: (id) => set((state) => ({
        customStreams: state.customStreams.filter((s) => s.id !== id),
      })),

      setTheme: (theme) => set({ theme }),

      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
    }),
    {
      name: 'dailo-storage',
      version: 7,
      partialize: (state) => ({
        widgets: state.widgets,
        todos: state.todos,
        tasks: state.tasks,
        activeTaskId: state.activeTaskId,
        timeBlocks: state.timeBlocks,
        habits: state.habits,
        notes: state.notes,
        activeNoteId: state.activeNoteId,
        pomodoroSettings: state.pomodoroSettings,
        pomodoroTimer: { ...state.pomodoroTimer, isRunning: false }, // Don't persist running state
        customStreams: state.customStreams,
        theme: state.theme,
      }),
      migrate: (persistedState, version) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = persistedState as any

        // Version 2: Migrate height format
        // Version 3: Add column/order fields
        if (version < 3) {
          state.widgets = defaultWidgets
        }

        // Version 4: Migrate notes from string to Note[]
        if (version < 4) {
          const oldNotes = state.notes
          if (typeof oldNotes === 'string' && oldNotes.trim()) {
            const now = new Date().toISOString()
            state.notes = [{
              id: crypto.randomUUID(),
              title: 'My Notes',
              content: `<p>${oldNotes.replace(/\n/g, '</p><p>')}</p>`,
              createdAt: now,
              updatedAt: now,
            }]
            state.activeNoteId = state.notes[0].id
          } else {
            state.notes = []
            state.activeNoteId = null
          }
        }

        // Version 5: Persist pomodoroTimer - initialize from settings if not present
        if (version < 5) {
          const settings = state.pomodoroSettings || defaultPomodoroSettings
          state.pomodoroTimer = {
            phase: 'focus',
            timeLeft: settings.focusDuration * 60,
            isRunning: false,
            sessionsCompleted: 0,
          }
        }

        // Version 6: Add tasks array
        if (version < 6) {
          state.tasks = []
          state.activeTaskId = null
        }

        // Version 7: Migrate timeBlocks to new format with start/end ISO strings
        if (version < 7) {
          const oldBlocks = state.timeBlocks || []
          state.timeBlocks = oldBlocks.map((block: { id: string; title: string; date?: string; startTime?: string; endTime?: string; color?: string; start?: string; end?: string; description?: string; allDay?: boolean; location?: string }) => {
            // If already in new format, keep as is
            if (block.start && block.end) {
              return block
            }
            // Convert old format to new format
            const date = block.date || new Date().toISOString().split('T')[0]
            const startTime = block.startTime || '09:00'
            const endTime = block.endTime || '10:00'
            return {
              id: block.id,
              title: block.title,
              start: `${date}T${startTime}:00`,
              end: `${date}T${endTime}:00`,
              color: block.color === 'blue' ? 'sky' : block.color === 'green' ? 'emerald' : block.color === 'red' ? 'rose' : block.color === 'yellow' ? 'amber' : block.color === 'purple' ? 'violet' : block.color || 'sky',
              allDay: false,
            }
          })
        }

        return state
      },
    }
  )
)
