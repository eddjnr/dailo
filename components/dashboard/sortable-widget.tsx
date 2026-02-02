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
  className?: string
  onFullscreen?: (widget: Widget) => void
  onResizeStart?: (widget: Widget, e: React.MouseEvent) => void
}

export function SortableWidget({ widget, isCustomizing, isDragging, className, onFullscreen, onResizeStart }: SortableWidgetProps) {
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
        "w-full transition-all duration-200",
        isDragging && "opacity-30 scale-[0.98]",
        className
      )}
    >
      <WidgetCard
        widget={widget}
        isCustomizing={isCustomizing}
        dragHandleProps={{ ...attributes, ...listeners }}
        onFullscreen={onFullscreen}
        onResizeStart={onResizeStart}
      />
    </div>
  )
}
