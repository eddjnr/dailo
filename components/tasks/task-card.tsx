'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, GripVertical, Flame, Zap, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

const priorityConfig = {
  1: {
    color: 'bg-primary',
    textColor: 'text-primary',
    icon: Flame,
    label: 'High',
  },
  2: {
    color: 'bg-amber-400',
    textColor: 'text-amber-400',
    icon: Zap,
    label: 'Medium',
  },
  3: {
    color: 'bg-muted-foreground/30',
    textColor: 'text-muted-foreground',
    icon: Leaf,
    label: 'Low',
  },
}

const tagColors = [
  'bg-blue-500/20 text-blue-400',
  'bg-green-500/20 text-green-400',
  'bg-purple-500/20 text-purple-400',
  'bg-pink-500/20 text-pink-400',
  'bg-orange-500/20 text-orange-400',
]

function getTagColor(tag: string) {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return tagColors[hash % tagColors.length]
}

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'MMM d')
}

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isOverlay?: boolean
}

export function TaskCard({ task, onClick, isOverlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = priorityConfig[task.priority]
  const Icon = config.icon
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done'

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        'bg-card rounded-xl p-3 border border-border/50 cursor-pointer hover:border-border transition-all group/card',
        isDragging && 'opacity-50',
        isOverlay && 'shadow-2xl rotate-1 scale-[1.02]'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover/card:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Priority indicator + tags */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <div className={cn('size-2 rounded-full shrink-0', config.color)} />
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-md font-medium',
                  getTagColor(tag)
                )}
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-[10px] text-muted-foreground">
                +{task.tags.length - 2}
              </span>
            )}
          </div>

          {/* Title */}
          <p className={cn(
            'text-sm font-medium line-clamp-2',
            task.status === 'done' && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>

          {/* Footer: due date */}
          {task.dueDate && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs',
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}>
              <Calendar className="size-3" />
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        <Icon className={cn('size-3.5 shrink-0 mt-0.5', config.textColor)} />
      </div>
    </div>
  )
}
