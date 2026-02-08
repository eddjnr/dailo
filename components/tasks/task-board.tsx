'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useAppStore } from '@/lib/store'
import { TaskColumn } from './task-column'
import { TaskCard } from './task-card'
import { TaskEditor } from './task-editor'
import type { Task, TaskStatus } from '@/lib/types'
import Link from 'next/link'

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'working', title: 'Working' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
]

export function TaskBoard() {
  const tasks = useAppStore((state) => state.tasks)
  const addTask = useAppStore((state) => state.addTask)
  const moveTask = useAppStore((state) => state.moveTask)
  const reorderTasks = useAppStore((state) => state.reorderTasks)
  const activeTaskId = useAppStore((state) => state.activeTaskId)
  const setActiveTask = useAppStore((state) => state.setActiveTask)

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  // Clear activeTaskId when leaving the page
  useEffect(() => {
    return () => {
      setActiveTask(null)
    }
  }, [setActiveTask])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => {
      return tasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.order - b.order)
    },
    [tasks]
  )

  const draggedTask = useMemo(
    () => tasks.find((t) => t.id === draggedTaskId),
    [tasks, draggedTaskId]
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDraggedTaskId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback(() => {}, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      setDraggedTaskId(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      const activeTask = tasks.find((t) => t.id === activeId)
      if (!activeTask) return

      // Check if dropped on a column
      if (overId.startsWith('column-')) {
        const newStatus = overId.replace('column-', '') as TaskStatus
        if (activeTask.status !== newStatus) {
          const tasksInNewColumn = getTasksByStatus(newStatus)
          moveTask(activeId, newStatus, tasksInNewColumn.length)
        }
        return
      }

      // Dropped on another task
      const overTask = tasks.find((t) => t.id === overId)
      if (!overTask) return

      // Same column - reorder
      if (activeTask.status === overTask.status) {
        const columnTasks = getTasksByStatus(activeTask.status)
        const oldIndex = columnTasks.findIndex((t) => t.id === activeId)
        const newIndex = columnTasks.findIndex((t) => t.id === overId)

        if (oldIndex !== newIndex) {
          const reordered = arrayMove(columnTasks, oldIndex, newIndex)
          const updatedTasks = tasks.map((t) => {
            const reorderedIndex = reordered.findIndex((r) => r.id === t.id)
            if (reorderedIndex !== -1) {
              return { ...t, order: reorderedIndex }
            }
            return t
          })
          reorderTasks(updatedTasks)
        }
      } else {
        // Different column - move to new status
        const tasksInNewColumn = getTasksByStatus(overTask.status)
        const overIndex = tasksInNewColumn.findIndex((t) => t.id === overId)
        moveTask(activeId, overTask.status, overIndex)
      }
    },
    [tasks, getTasksByStatus, moveTask, reorderTasks]
  )

  const prevTaskCountRef = useRef(tasks.length)
  const pendingOpenRef = useRef(false)

  const handleAddTask = useCallback(
    (status: TaskStatus) => {
      pendingOpenRef.current = true
      addTask({
        title: '',
        description: '',
        status,
        priority: 2,
        tags: [],
        dueDate: null,
      })
    },
    [addTask]
  )

  const handleCreateNewTask = useCallback(() => {
    handleAddTask('todo')
  }, [handleAddTask])

  // Effect to open editor for newly created task
  useEffect(() => {
    if (pendingOpenRef.current && tasks.length > prevTaskCountRef.current) {
      const newestTask = [...tasks].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
      if (newestTask) {
        setActiveTask(newestTask.id)
      }
      pendingOpenRef.current = false
    }
    prevTaskCountRef.current = tasks.length
  }, [tasks, setActiveTask])

  const handleTaskClick = useCallback(
    (task: Task) => {
      setActiveTask(task.id)
    },
    [setActiveTask]
  )

  return (
    <main className="flex-1 min-w-0 flex flex-col h-screen">
      {/* Header */}
      <div className="h-14 px-4 border-b border-border shrink-0 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </Link>
            <h1 className="text-lg font-semibold">Tasks</h1>
          </div>
          <Button onClick={handleCreateNewTask} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 p-4 min-h-0 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full grid grid-cols-4 gap-4">
          {COLUMNS.map((column) => (
            <TaskColumn
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={getTasksByStatus(column.status)}
              onAddTask={() => handleAddTask(column.status)}
              onTaskClick={handleTaskClick}
            />
          ))}
          </div>

          <DragOverlay>
            {draggedTask && <TaskCard task={draggedTask} isOverlay />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Editor Modal */}
      {activeTaskId && (
        <TaskEditor
          taskId={activeTaskId}
          onClose={() => setActiveTask(null)}
        />
      )}
    </main>
  )
}
