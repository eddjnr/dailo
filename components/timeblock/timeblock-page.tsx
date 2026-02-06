'use client'

import { useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { EventCalendar } from '@/components/calendar/event-calendar'
import type { CalendarEvent } from '@/components/calendar/types'

export function TimeBlockPage() {
  const timeBlocks = useAppStore((state) => state.timeBlocks)
  const addTimeBlock = useAppStore((state) => state.addTimeBlock)
  const updateTimeBlock = useAppStore((state) => state.updateTimeBlock)
  const deleteTimeBlock = useAppStore((state) => state.deleteTimeBlock)

  // Convert stored TimeBlocks to CalendarEvents (string dates to Date objects)
  const events: CalendarEvent[] = useMemo(() => {
    return timeBlocks.map((block) => ({
      id: block.id,
      title: block.title,
      description: block.description,
      start: new Date(block.start),
      end: new Date(block.end),
      allDay: block.allDay,
      color: block.color,
      location: block.location,
    }))
  }, [timeBlocks])

  const handleEventAdd = useCallback((event: CalendarEvent) => {
    addTimeBlock({
      title: event.title,
      description: event.description,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      allDay: event.allDay,
      color: event.color,
      location: event.location,
    })
  }, [addTimeBlock])

  const handleEventUpdate = useCallback((event: CalendarEvent) => {
    updateTimeBlock(event.id, {
      title: event.title,
      description: event.description,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      allDay: event.allDay,
      color: event.color,
      location: event.location,
    })
  }, [updateTimeBlock])

  const handleEventDelete = useCallback((eventId: string) => {
    deleteTimeBlock(eventId)
  }, [deleteTimeBlock])

  return (
    <main className="flex-1 min-w-0 p-6 flex flex-col h-screen">
      <EventCalendar
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        className="flex-1"
      />
    </main>
  )
}
