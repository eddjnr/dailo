"use client";

import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  eachHourOfInterval,
  format,
  getHours,
  getMinutes,
  isSameDay,
  startOfDay,
} from "date-fns";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";

import { WeekCellsHeight } from "@/components/constants";
import { DraggableEvent } from "@/components/draggable-event";
import { DroppableCell } from "@/components/droppable-cell";
import { EventItem } from "@/components/event-item";
import { useCurrentTimeIndicator } from "@/hooks/use-current-time-indicator";
import type { CalendarEvent } from "@/components/types";
import { isMultiDayEvent } from "@/components/utils";
import {
  EndHour,
  StartHour,
} from "@/components/constants";
import { cn } from "@/lib/utils";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date) => void;
}

interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

export function DayView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: DayViewProps) {
  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      end: addHours(dayStart, EndHour - 1),
      start: addHours(dayStart, StartHour),
    });
  }, [currentDate]);

  const dayEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return (
          isSameDay(currentDate, eventStart) ||
          isSameDay(currentDate, eventEnd) ||
          (currentDate > eventStart && currentDate < eventEnd)
        );
      })
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }, [currentDate, events]);

  // Filter all-day events
  const allDayEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      // Include explicitly marked all-day events or multi-day events
      return event.allDay || isMultiDayEvent(event);
    });
  }, [dayEvents]);

  // Get only single-day time-based events
  const timeEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      // Exclude all-day events and multi-day events
      return !event.allDay && !isMultiDayEvent(event);
    });
  }, [dayEvents]);

  // Process events to calculate positions
  const positionedEvents = useMemo(() => {
    const result: PositionedEvent[] = [];
    const dayStart = startOfDay(currentDate);

    // Sort events by start time and duration
    const sortedEvents = [...timeEvents].sort((a, b) => {
      const aStart = new Date(a.start);
      const bStart = new Date(b.start);
      const aEnd = new Date(a.end);
      const bEnd = new Date(b.end);

      // First sort by start time
      if (aStart < bStart) return -1;
      if (aStart > bStart) return 1;

      // If start times are equal, sort by duration (longer events first)
      const aDuration = differenceInMinutes(aEnd, aStart);
      const bDuration = differenceInMinutes(bEnd, bStart);
      return bDuration - aDuration;
    });

    // Track columns for overlapping events
    const columns: { event: CalendarEvent; end: Date }[][] = [];

    for (const event of sortedEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Adjust start and end times if they're outside this day
      const adjustedStart = isSameDay(currentDate, eventStart)
        ? eventStart
        : dayStart;
      const adjustedEnd = isSameDay(currentDate, eventEnd)
        ? eventEnd
        : addHours(dayStart, 24);

      // Calculate top position and height
      const startHour =
        getHours(adjustedStart) + getMinutes(adjustedStart) / 60;
      const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60;

      const top = (startHour - StartHour) * WeekCellsHeight;
      const height = (endHour - startHour) * WeekCellsHeight;

      // Find a column for this event
      let columnIndex = 0;
      let placed = false;

      while (!placed) {
        const col = columns[columnIndex] || [];
        if (col.length === 0) {
          columns[columnIndex] = col;
          placed = true;
        } else {
          const overlaps = col.some((c) =>
            areIntervalsOverlapping(
              { end: adjustedEnd, start: adjustedStart },
              { end: new Date(c.event.end), start: new Date(c.event.start) },
            ),
          );

          if (!overlaps) {
            placed = true;
          } else {
            columnIndex++;
          }
        }
      }

      // Ensure column is initialized before pushing
      const currentColumn = columns[columnIndex] || [];
      columns[columnIndex] = currentColumn;
      currentColumn.push({ end: adjustedEnd, event });

      // First column takes full width, others are indented by 10% and take 90% width
      const width = columnIndex === 0 ? 1 : 0.9;
      const left = columnIndex === 0 ? 0 : columnIndex * 0.1;

      result.push({
        event,
        height,
        left,
        top,
        width,
        zIndex: 10 + columnIndex,
      });
    }

    return result;
  }, [currentDate, timeEvents]);

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  const showAllDaySection = allDayEvents.length > 0;
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "day",
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = getHours(now) + getMinutes(now) / 60;

      // Calculate scroll position (current hour - start hour) * cell height
      // Offset by -2 hours to show some context before current time
      const scrollToHour = Math.max(currentHour - 2, StartHour);
      const scrollPosition = (scrollToHour - StartHour) * WeekCellsHeight;

      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0" data-slot="day-view">
      {showAllDaySection && (
        <div className="border-border/30 border-b">
          <div className="grid grid-cols-[auto_1fr]">
            <div className="flex items-center justify-end pl-1 pr-2 border-r border-border/50">
              <span className="text-[10px] font-medium text-muted-foreground/50 whitespace-nowrap">
                all day
              </span>
            </div>
            <div className="relative p-1">
              {allDayEvents.map((event) => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                const isFirstDay = isSameDay(currentDate, eventStart);
                const isLastDay = isSameDay(currentDate, eventEnd);

                return (
                  <EventItem
                    event={event}
                    isFirstDay={isFirstDay}
                    isLastDay={isLastDay}
                    key={`spanning-${event.id}`}
                    onClick={(e) => handleEventClick(event, e)}
                    view="month"
                  >
                    {/* Always show the title in day view for better usability */}
                    <div>{event.title}</div>
                  </EventItem>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="grid flex-1 grid-cols-[auto_1fr] min-w-0 overflow-y-auto overflow-x-hidden"
      >
        <div className="border-r border-border/50 pl-1">
          {hours.map((hour) => (
            <div
              className="relative h-[var(--week-cells-height)] flex items-start justify-end"
              key={hour.toString()}
            >
              <span className="-translate-y-1/2 pr-2 text-[10px] font-medium text-muted-foreground/50 tabular-nums whitespace-nowrap">
                {format(hour, "h a").toLowerCase()}
              </span>
            </div>
          ))}
        </div>

        <div className="relative">
          {/* Positioned events */}
          {positionedEvents.map((positionedEvent) => (
            <div
              className="absolute z-10 px-0.5"
              key={positionedEvent.event.id}
              style={{
                height: `${positionedEvent.height}px`,
                left: `${positionedEvent.left * 100}%`,
                top: `${positionedEvent.top}px`,
                width: `${positionedEvent.width * 100}%`,
                zIndex: positionedEvent.zIndex,
              }}
            >
              <div className="size-full">
                <DraggableEvent
                  event={positionedEvent.event}
                  height={positionedEvent.height}
                  onClick={(e) => handleEventClick(positionedEvent.event, e)}
                  showTime
                  view="day"
                />
              </div>
            </div>
          ))}

          {/* Current time indicator */}
          {currentTimeVisible && (
            <div
              className="pointer-events-none absolute right-0 left-0 z-20"
              style={{ top: `${currentTimePosition}%` }}
            >
              <div className="relative flex items-center">
                <div className="-left-1.5 absolute size-2.5 rounded-full bg-primary/90" />
                <div className="h-[1.5px] w-full bg-primary/70" />
              </div>
            </div>
          )}

          {/* Time grid */}
          {hours.map((hour) => {
            const hourValue = getHours(hour);
            return (
              <div
                className="relative h-[var(--week-cells-height)] border-border/30 border-b last:border-b-0"
                key={hour.toString()}
              >
                {/* Quarter-hour intervals */}
                {[0, 1, 2, 3].map((quarter) => {
                  const quarterHourTime = hourValue + quarter * 0.25;
                  return (
                    <DroppableCell
                      className={cn(
                        "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                        quarter === 0 && "top-0",
                        quarter === 1 &&
                          "top-[calc(var(--week-cells-height)/4)]",
                        quarter === 2 &&
                          "top-[calc(var(--week-cells-height)/4*2)]",
                        quarter === 3 &&
                          "top-[calc(var(--week-cells-height)/4*3)]",
                      )}
                      date={currentDate}
                      id={`day-cell-${currentDate.toISOString()}-${quarterHourTime}`}
                      key={`${hour.toString()}-${quarter}`}
                      onClick={() => {
                        const startTime = new Date(currentDate);
                        startTime.setHours(hourValue);
                        startTime.setMinutes(quarter * 15);
                        onEventCreate(startTime);
                      }}
                      time={quarterHourTime}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
