'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import type { Widget } from '@/lib/types'
import { SortableWidget } from './sortable-widget'
import { WidgetCard } from './widget-card'
import { DroppableColumn } from './droppable-column'

interface WidgetGridProps {
  widgets: Widget[]
  isCustomizing: boolean
  onReorderWidgets: (widgets: Widget[]) => void
  onFullscreen: (widget: Widget) => void
  onResizeStart: (widget: Widget, e: React.MouseEvent) => void
}

export function WidgetGrid({
  widgets,
  isCustomizing,
  onReorderWidgets,
  onFullscreen,
  onResizeStart,
}: WidgetGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const getWidgetsByColumn = useCallback((columnIndex: number) => {
    return widgets
      .filter((w) => w.column === columnIndex && (w.visible || isCustomizing))
      .sort((a, b) => a.order - b.order)
  }, [widgets, isCustomizing])

  const column0 = getWidgetsByColumn(0)
  const column1 = getWidgetsByColumn(1)
  const column2 = getWidgetsByColumn(2)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeWidget = widgets.find((w) => w.id === active.id)
    if (!activeWidget) return

    const overId = over.id as string
    const sourceColumn = activeWidget.column

    // Dropping on a column (empty area / placeholder)
    if (overId.startsWith('column-')) {
      const targetColumn = parseInt(overId.split('-')[1])
      if (sourceColumn !== targetColumn) {
        const targetColumnWidgets = getWidgetsByColumn(targetColumn)
        const updatedWidgets = widgets.map((w) => {
          if (w.id === activeWidget.id) {
            return { ...w, column: targetColumn, order: targetColumnWidgets.length }
          }
          if (w.column === sourceColumn && w.order > activeWidget.order) {
            return { ...w, order: w.order - 1 }
          }
          return w
        })
        onReorderWidgets(updatedWidgets)
      }
      return
    }

    // Dropping on another widget
    const overWidget = widgets.find((w) => w.id === over.id)
    if (!overWidget || active.id === over.id) return

    const targetColumn = overWidget.column
    const targetOrder = overWidget.order

    if (sourceColumn !== targetColumn) {
      const updatedWidgets = widgets.map((w) => {
        if (w.id === activeWidget.id) {
          return { ...w, column: targetColumn, order: targetOrder }
        }
        if (w.column === sourceColumn && w.order > activeWidget.order) {
          return { ...w, order: w.order - 1 }
        }
        if (w.column === targetColumn && w.order >= targetOrder) {
          return { ...w, order: w.order + 1 }
        }
        return w
      })
      onReorderWidgets(updatedWidgets)
    } else {
      const columnWidgets = getWidgetsByColumn(sourceColumn)
      const oldIndex = columnWidgets.findIndex((w) => w.id === active.id)
      const newIndex = columnWidgets.findIndex((w) => w.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(columnWidgets, oldIndex, newIndex)
        const updatedWidgets = widgets.map((w) => {
          const idx = reordered.findIndex((r) => r.id === w.id)
          if (idx !== -1) {
            return { ...w, order: idx }
          }
          return w
        })
        onReorderWidgets(updatedWidgets)
      }
    }
  }

  const activeWidget = activeId ? widgets.find((w) => w.id === activeId) : null

  const renderColumn = (columnWidgets: Widget[], columnId: string) => (
    <DroppableColumn id={columnId} isCustomizing={isCustomizing} isDragging={!!activeId}>
      <SortableContext items={columnWidgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
        {columnWidgets.map((widget, index) => (
          <SortableWidget
            key={widget.id}
            widget={widget}
            isCustomizing={isCustomizing}
            isDragging={activeId === widget.id}
            onFullscreen={onFullscreen}
            onResizeStart={onResizeStart}
            className={cn(
              "animate-fade-in-up",
              `stagger-${Math.min(index + 1, 6)}`
            )}
          />
        ))}
      </SortableContext>
    </DroppableColumn>
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-5 items-start">
        {renderColumn(column0, 'column-0')}
        {renderColumn(column1, 'column-1')}
        {renderColumn(column2, 'column-2')}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
        {activeWidget && (
          <div
            style={{ height: activeWidget.height, width: 'calc((100vw - 64px - 48px - 40px) / 3)' }}
            className="animate-in zoom-in-95 duration-150"
          >
            <WidgetCard
              widget={activeWidget}
              isCustomizing={isCustomizing}
              isOverlay
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
