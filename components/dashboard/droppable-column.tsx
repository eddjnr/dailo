'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface DroppableColumnProps {
  id: string
  isCustomizing: boolean
  isDragging: boolean
  children: React.ReactNode
}

export function DroppableColumn({ id, isCustomizing, isDragging, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-5 min-h-[200px] rounded-2xl transition-all duration-200",
        isCustomizing && "p-2 -m-2",
        isCustomizing && isOver && "bg-primary/5",
        isCustomizing && !isOver && "bg-transparent"
      )}
    >
      {children}

      {/* Drop placeholder */}
      {isDragging && (
        <div
          className={cn(
            "h-32 rounded-2xl border-2 border-dashed transition-all duration-200",
            isOver
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/30 bg-muted/20"
          )}
        />
      )}
    </div>
  )
}
