'use client'

import { memo, useMemo } from 'react'
import { format, setHours, setMinutes } from 'date-fns'
import { useAppStore } from '@/lib/store'
import { EventCalendar } from '@/components/event-calendar'
import type { CalendarEvent, EventColor } from '@/components/types'
import type { TimeBlock } from '@/lib/types'

// Convert TimeBlock time string (HH:mm) to Date object for today
function timeStringToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  const date = new Date()
  return setMinutes(setHours(date, hours), minutes)
}

// Convert Date to time string (HH:mm)
function dateToTimeString(date: Date): string {
  return format(date, 'HH:mm')
}

// Map TimeBlock color to EventColor
function mapColor(color: string): EventColor {
  const colorMap: Record<string, EventColor> = {
    blue: 'sky',
    green: 'emerald',
    red: 'rose',
    yellow: 'amber',
    purple: 'violet',
    orange: 'orange',
    // Default mappings for event colors
    sky: 'sky',
    amber: 'amber',
    violet: 'violet',
    rose: 'rose',
    emerald: 'emerald',
  }
  return colorMap[color] || 'sky'
}

// Map EventColor back to TimeBlock color
function mapColorBack(color?: EventColor): string {
  return color || 'sky'
}

// Convert TimeBlock to CalendarEvent
function timeBlockToCalendarEvent(block: TimeBlock): CalendarEvent {
  return {
    id: block.id,
    title: block.title,
    start: timeStringToDate(block.startTime),
    end: timeStringToDate(block.endTime),
    color: mapColor(block.color),
    allDay: false,
  }
}

// Convert CalendarEvent to TimeBlock data (for add/update)
function calendarEventToTimeBlock(event: CalendarEvent): Omit<TimeBlock, 'id'> {
  return {
    title: event.title,
    startTime: dateToTimeString(new Date(event.start)),
    endTime: dateToTimeString(new Date(event.end)),
    color: mapColorBack(event.color),
  }
}

export const TimeBlockWidget = memo(function TimeBlockWidget() {
  const timeBlocks = useAppStore((state) => state.timeBlocks)
  const addTimeBlock = useAppStore((state) => state.addTimeBlock)
  const updateTimeBlock = useAppStore((state) => state.updateTimeBlock)
  const deleteTimeBlock = useAppStore((state) => state.deleteTimeBlock)

  // Convert timeBlocks to CalendarEvents
  const events = useMemo(() => {
    return timeBlocks.map(timeBlockToCalendarEvent)
  }, [timeBlocks])

  const handleEventAdd = (event: CalendarEvent) => {
    const blockData = calendarEventToTimeBlock(event)
    addTimeBlock(blockData)
  }

  const handleEventUpdate = (event: CalendarEvent) => {
    const blockData = calendarEventToTimeBlock(event)
    updateTimeBlock(event.id, blockData)
  }

  const handleEventDelete = (eventId: string) => {
    deleteTimeBlock(eventId)
  }

  return (
    <div className="flex flex-col h-full ">
      <EventCalendar
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="day"
        compact
      />
    </div>
  )
})
