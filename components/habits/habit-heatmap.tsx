'use client'

import { useMemo, Fragment } from 'react'
import { cn } from '@/lib/utils'
import type { Habit, HabitDayData } from '@/lib/types'

// Format date to local YYYY-MM-DD (avoids timezone issues with toISOString)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface HeatmapCellData {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
  isFuture: boolean
}

interface HabitHeatmapProps {
  habit: Habit
  className?: string
}

function getLevel(percentage: number): 0 | 1 | 2 | 3 | 4 {
  if (percentage === 0) return 0
  if (percentage <= 25) return 1
  if (percentage <= 50) return 2
  if (percentage <= 75) return 3
  return 4
}

function getHeatmapColor(level: 0 | 1 | 2 | 3 | 4): string {
  const colors = {
    0: 'bg-foreground/10',
    1: 'bg-primary/40',
    2: 'bg-primary/60',
    3: 'bg-primary/80',
    4: 'bg-primary',
  }
  return colors[level]
}

function generateWeeksData(dayData: HabitDayData[], target: number): HeatmapCellData[][] {
  const weeks: HeatmapCellData[][] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from January 1st of current year, aligned to Sunday
  const currentYear = today.getFullYear()
  const jan1 = new Date(currentYear, 0, 1)
  jan1.setHours(0, 0, 0, 0)

  // Go back to the Sunday before Jan 1 (or Jan 1 if it's a Sunday)
  const startDate = new Date(jan1)
  startDate.setDate(jan1.getDate() - jan1.getDay())

  // Calculate number of weeks from start to end of year (or today + some buffer)
  const endOfYear = new Date(currentYear, 11, 31)
  const totalDays = Math.ceil((endOfYear.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 7
  const totalWeeks = Math.ceil(totalDays / 7)

  // Create a map for faster lookup
  const dayDataMap = new Map(dayData.map((d) => [d.date, d.count]))

  // Generate weeks for the year
  for (let week = 0; week < totalWeeks; week++) {
    const weekData: HeatmapCellData[] = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + week * 7 + day)
      date.setHours(0, 0, 0, 0)

      const isFuture = date > today
      const isBeforeYear = date.getFullYear() < currentYear
      const isAfterYear = date.getFullYear() > currentYear
      const dateStr = formatLocalDate(date)
      const count = dayDataMap.get(dateStr) || 0
      const percentage = target > 0 ? (count / target) * 100 : 0
      const level = (isFuture || isBeforeYear || isAfterYear) ? 0 : getLevel(percentage)

      weekData.push({ date: dateStr, count, level, isFuture: isFuture || isBeforeYear || isAfterYear })
    }
    weeks.push(weekData)
  }

  return weeks
}

function getMonthLabels(weeks: HeatmapCellData[][]): { label: string; weekIndex: number }[] {
  const months: { label: string; weekIndex: number }[] = []
  const currentYear = new Date().getFullYear()
  let lastMonth = -1

  weeks.forEach((week, weekIndex) => {
    // Find the first day of current year in this week
    const dayInCurrentYear = week.find(d => {
      const date = new Date(d.date)
      return date.getFullYear() === currentYear
    })

    if (!dayInCurrentYear) return

    const date = new Date(dayInCurrentYear.date)
    const month = date.getMonth()

    if (month !== lastMonth) {
      months.push({
        label: date.toLocaleDateString('en', { month: 'short' }),
        weekIndex,
      })
      lastMonth = month
    }
  })

  return months
}

export function HabitHeatmap({ habit, className }: HabitHeatmapProps) {
  const weeks = useMemo(
    () => generateWeeksData(habit.dayData, habit.target),
    [habit.dayData, habit.target]
  )
  const months = useMemo(() => getMonthLabels(weeks), [weeks])

  const cellHeight = 12
  const rowGap = 4

  return (
    <div className={cn('w-full', className)}>
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `28px repeat(${weeks.length}, 1fr)`,
          gap: `${rowGap}px`
        }}
      >
        {/* Month labels row */}
        <div></div>
        {weeks.map((_, weekIndex) => {
          const month = months.find(m => m.weekIndex === weekIndex)
          return (
            <div key={`month-${weekIndex}`} className="text-[10px] text-muted-foreground truncate">
              {month ? month.label : ''}
            </div>
          )
        })}

        {/* Grid rows for each day of week */}
        {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
          <Fragment key={`row-${dayOfWeek}`}>
            {/* Day label */}
            <div className="text-[10px] text-muted-foreground flex items-center" style={{ height: cellHeight }}>
              {dayOfWeek === 1 ? 'Mon' : dayOfWeek === 3 ? 'Wed' : dayOfWeek === 5 ? 'Fri' : ''}
            </div>
            {/* Cells for this day across all weeks */}
            {weeks.map((week, weekIndex) => {
              const day = week[dayOfWeek]
              return (
                <div
                  key={`cell-${weekIndex}-${dayOfWeek}`}
                  className={cn(
                    'rounded-xs transition-colors',
                    day.isFuture ? 'bg-foreground/5' : getHeatmapColor(day.level)
                  )}
                  style={{ height: cellHeight }}
                  title={
                    day.date && !day.isFuture
                      ? `${day.date}: ${day.count}/${habit.target}${habit.unit ? ` ${habit.unit}` : ''}`
                      : ''
                  }
                />
              )
            })}
          </Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn('rounded-sm', getHeatmapColor(level as 0 | 1 | 2 | 3 | 4))}
            style={{ width: 12, height: 12 }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
