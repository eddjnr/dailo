'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Widget } from '@/lib/types'
import { WidgetCard } from './widget-card'
import { cn } from '@/lib/utils'

interface SortableWidgetProps {
  widget: Widget
  isCustomizing: boolean
  isDragging: boolean
  isOver?: boolean
  className?: string
  onFullscreen?: (widget: Widget) => void
  onResizeStart?: (widget: Widget, e: React.MouseEvent) => void
}

export function SortableWidget({ widget, isCustomizing, isDragging, isOver, className, onFullscreen, onResizeStart }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: widget.height,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full transition-all duration-200 relative",
        className
      )}
    >
      {isDragging ? (
        <div className="w-full h-full rounded-2xl border-2 border-dashed border-primary/50 bg-primary/10" />
      ) : (
        <WidgetCard
          widget={widget}
          isCustomizing={isCustomizing}
          dragHandleProps={{ ...attributes, ...listeners }}
          onFullscreen={onFullscreen}
          onResizeStart={onResizeStart}
        />
      )}
      {/* Drop target overlay */}
      {isOver && (
        <div className="absolute inset-0 rounded-2xl border-2 border-primary bg-primary/10 pointer-events-none z-10" />
      )}
    </div>
  )
}
