'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Circle, Wrench, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskCard } from './task-card'
import type { Task, TaskStatus } from '@/lib/types'

const statusConfig: Record<TaskStatus, { icon: React.ElementType; color: string }> = {
  todo: { icon: Circle, color: 'text-muted-foreground' },
  working: { icon: Wrench, color: 'text-amber-500' },
  'in-progress': { icon: Clock, color: 'text-blue-500' },
  done: { icon: CheckCircle2, color: 'text-green-500' },
}

interface TaskColumnProps {
  status: TaskStatus
  title: string
  tasks: Task[]
  onAddTask: () => void
  onTaskClick: (task: Task) => void
}

export function TaskColumn({ status, title, tasks, onAddTask, onTaskClick }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` })
  const { icon: Icon, color } = statusConfig[status]

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-2xl bg-muted/20 border border-border/50 p-3',
        isOver && 'ring-2 ring-primary/50 bg-primary/5 border-primary/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Icon className={cn('size-4', color)} />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Tasks list */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 overflow-y-auto min-h-0 pr-1">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}

          {/* Add task card */}
          <button
            onClick={onAddTask}
            className="flex items-center justify-center gap-2 w-full py-4 px-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-2 border-dashed border-border/50 hover:border-primary/50"
          >
            <Plus className="size-4" />
            <span>Add task</span>
          </button>
        </div>
      </SortableContext>
    </div>
  )
}
