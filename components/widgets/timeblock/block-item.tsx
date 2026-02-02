'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getColorClasses, isCurrentBlock, formatTime, getDuration } from './constants'
import type { TimeBlock } from '@/lib/types'

interface BlockItemProps {
  block: TimeBlock
  onEdit: (block: TimeBlock) => void
  onDelete: (id: string) => void
}

export function BlockItem({ block, onEdit, onDelete }: BlockItemProps) {
  const colorClasses = getColorClasses(block.color)
  const isCurrent = isCurrentBlock(block)

  return (
    <div className="group flex items-stretch gap-3">
      {/* Time column */}
      <div className="w-12 shrink-0 flex flex-col items-end pt-2.5">
        <span className={cn(
          "text-xs font-medium tabular-nums",
          isCurrent ? "text-primary" : "text-muted-foreground/70"
        )}>
          {block.startTime}
        </span>
      </div>

      {/* Timeline dot and line */}
      <div className="relative flex flex-col items-center">
        <div className={cn(
          "size-2.5 rounded-full mt-3 z-10",
          isCurrent ? "bg-primary shadow-lg shadow-primary/50" : colorClasses.dot
        )} />
        <div className="flex-1 w-px bg-border/50 -mt-0.5" />
      </div>

      {/* Block card */}
      <div
        className={cn(
          "flex-1 p-3 rounded-xl transition-all mb-1 border",
          colorClasses.bg,
          isCurrent ? "border-primary/50 shadow-lg shadow-primary/10" : "border-transparent"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium text-sm truncate",
              isCurrent && "text-foreground"
            )}>
              {block.title}
            </p>
            <p className={cn(
              "text-xs mt-0.5",
              isCurrent ? "text-primary" : "text-muted-foreground/70"
            )}>
              {isCurrent ? `Until ${formatTime(block.endTime)}` : getDuration(block.startTime, block.endTime)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(block)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-background/50 transition-all"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={() => onDelete(block.id)}
              className="p-1.5 text-muted-foreground hover:text-rose-400 rounded-lg hover:bg-background/50 transition-all"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
