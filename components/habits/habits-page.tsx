'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Minus, Pencil, Trash2, Flame, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { HabitModal } from './habit-modal'
import { Progress } from '@/components/ui/progress'
import { HabitHeatmap } from './habit-heatmap'
import { ProgressRing, getHabitIcon } from './progress-ring'
import { cn } from '@/lib/utils'
import type { Habit } from '@/lib/types'

// Format date to local YYYY-MM-DD (avoids timezone issues with toISOString)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function HabitsPage() {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week, -1 = last week, etc.

  const habits = useAppStore((state) => state.habits)
  const deleteHabit = useAppStore((state) => state.deleteHabit)
  const toggleHabitDay = useAppStore((state) => state.toggleHabitDay)
  const incrementHabitCount = useAppStore((state) => state.incrementHabitCount)
  const decrementHabitCount = useAppStore((state) => state.decrementHabitCount)

  const today = formatLocalDate(new Date())

  // Auto-select first habit if none selected or selected was deleted
  const selectedHabit = habits.find(h => h.id === selectedHabitId) || habits[0] || null

  const handleAddHabit = useCallback(() => {
    setEditingHabit(null)
    setModalOpen(true)
  }, [])

  const handleEditHabit = useCallback(() => {
    if (selectedHabit) {
      setEditingHabit(selectedHabit)
      setModalOpen(true)
    }
  }, [selectedHabit])

  const handleDeleteHabit = useCallback(() => {
    if (selectedHabit) {
      deleteHabit(selectedHabit.id)
      setSelectedHabitId(null)
    }
  }, [selectedHabit, deleteHabit])

  // Get week days with offset support
  const getWeekDays = (offset: number) => {
    const days = []
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    const todayStr = formatLocalDate(todayDate)

    // Get Sunday of the target week
    const dayOfWeek = todayDate.getDay()
    const sunday = new Date(todayDate)
    sunday.setDate(todayDate.getDate() - dayOfWeek + (offset * 7))

    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday)
      date.setDate(sunday.getDate() + i)
      date.setHours(0, 0, 0, 0)
      const dateStr = formatLocalDate(date)
      days.push({
        date: dateStr,
        dayNum: date.getDate(),
        label: date.toLocaleDateString('en', { weekday: 'short' }).toLowerCase(),
        isToday: dateStr === todayStr,
        isFuture: date > todayDate,
      })
    }
    return days
  }

  const weekDays = getWeekDays(weekOffset)

  // Get week range for display
  const getWeekLabel = () => {
    if (weekOffset === 0) return 'This Week'
    if (weekOffset === -1) return 'Last Week'
    const firstDay = weekDays[0]
    const lastDay = weekDays[6]
    const firstDate = new Date(firstDay.date)
    const lastDate = new Date(lastDay.date)
    return `${firstDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`
  }

  // Helper functions
  const getDayCount = (habit: Habit, date: string) => {
    const dayData = habit.dayData.find((d) => d.date === date)
    return dayData?.count || 0
  }

  const isCompletedOnDay = (habit: Habit, date: string) => {
    return getDayCount(habit, date) >= habit.target
  }

  const getStreak = (habit: Habit) => {
    let streak = 0
    for (let i = 0; i < 365; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = formatLocalDate(date)
      const dayData = habit.dayData.find((d) => d.date === dateStr)
      if (dayData && dayData.count >= habit.target) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  }

  return (
    <main className="flex-1 min-w-0 flex flex-col h-screen">
      {/* Header */}
      <div className="h-14 px-4 border-b border-border shrink-0 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </Link>
            <h1 className="text-lg font-semibold">Habits</h1>
          </div>
          <Button onClick={handleAddHabit} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Column - Habits List */}
        <div className="w-120 border-r border-border flex flex-col shrink-0">
          {/* Week Header with Navigation */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 transition-all duration-150"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-xs font-medium text-muted-foreground">{getWeekLabel()}</span>
              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                disabled={weekOffset >= 0}
                className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="flex justify-between">
              {weekDays.map((day) => (
                <div key={day.date} className="flex flex-col items-center gap-0.5">
                  <span className={cn(
                    'text-[10px] uppercase',
                    day.isToday ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}>
                    {day.label.slice(0, 3)}
                  </span>
                  <span className={cn(
                    'text-sm font-medium',
                    day.isToday ? 'text-primary' : day.isFuture ? 'text-muted-foreground/30' : 'text-muted-foreground'
                  )}>
                    {day.dayNum}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Habits List */}
          <div className="flex-1 overflow-y-auto">
            {habits.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">No habits yet</p>
                <Button onClick={handleAddHabit} variant="outline" size="sm">
                  Create your first habit
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {habits.map((habit) => {
                  const isSelected = selectedHabitId === habit.id
                  const streak = getStreak(habit)
                  const todayCount = getDayCount(habit, today)

                  return (
                    <div
                      key={habit.id}
                      onClick={() => setSelectedHabitId(habit.id)}
                      className={cn(
                        'p-4 cursor-pointer transition-all',
                        isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/30'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <ProgressRing
                          progress={habit.target > 0 ? (todayCount / habit.target) * 100 : 0}
                          size={36}
                          strokeWidth={3}
                          icon={habit.icon}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{habit.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {streak > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Flame className="size-3 text-primary" />
                                {streak}d
                              </span>
                            )}
                            {habit.type === 'count' && (
                              <span>{todayCount}/{habit.target}</span>
                            )}
                          </div>
                        </div>

                        {/* Week days - clickable */}
                        <div className="flex gap-1.5">
                          {weekDays.map((day) => {
                            const completed = isCompletedOnDay(habit, day.date)
                            const dayCount = getDayCount(habit, day.date)
                            const progress = habit.target > 0 ? (dayCount / habit.target) * 100 : 0
                            const size = 22
                            const strokeWidth = 2.5
                            const radius = (size - strokeWidth) / 2
                            const circumference = 2 * Math.PI * radius
                            const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference

                            return (
                              <button
                                key={day.date}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (day.isFuture) return
                                  if (habit.type === 'binary') {
                                    toggleHabitDay(habit.id, day.date)
                                  } else {
                                    // For count: increment, reset to 0 when exceeds target
                                    if (dayCount >= habit.target) {
                                      for (let i = 0; i < dayCount; i++) {
                                        decrementHabitCount(habit.id, day.date)
                                      }
                                    } else {
                                      incrementHabitCount(habit.id, day.date)
                                    }
                                  }
                                }}
                                disabled={day.isFuture}
                                className={cn(
                                  'flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg transition-all',
                                  day.isFuture
                                    ? 'opacity-30 cursor-not-allowed'
                                    : completed
                                      ? 'bg-primary/10'
                                      : 'hover:bg-muted/50',
                                  day.isToday && !day.isFuture && 'ring-1 ring-primary/50'
                                )}
                              >
                                <span className={cn(
                                  'text-[9px] uppercase font-medium',
                                  day.isToday ? 'text-primary' : 'text-muted-foreground'
                                )}>
                                  {day.label.charAt(0)}
                                </span>
                                {/* Progress ring for count habits, simple dot for binary */}
                                <div className="relative" style={{ width: size, height: size }}>
                                  {habit.type === 'count' && dayCount > 0 && !completed && (
                                    <svg
                                      className="absolute inset-0 -rotate-90"
                                      width={size}
                                      height={size}
                                    >
                                      <circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={strokeWidth}
                                        className="text-muted/30"
                                      />
                                      <circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="text-primary transition-all"
                                      />
                                    </svg>
                                  )}
                                  <div className={cn(
                                    'absolute inset-0.5 rounded-full flex items-center justify-center transition-all text-[9px] font-medium',
                                    completed
                                      ? 'bg-primary text-primary-foreground'
                                      : habit.type === 'count' && dayCount > 0
                                        ? 'bg-background text-foreground'
                                        : 'bg-muted/40'
                                  )}>
                                    {completed ? (
                                      <Check className="size-3" />
                                    ) : habit.type === 'count' && dayCount > 0 ? (
                                      dayCount
                                    ) : null}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Add New Habit Card */}
                <button
                  onClick={handleAddHabit}
                  className="w-full p-4 flex items-center gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all group"
                >
                  <div className="size-9 rounded-full border-2 border-dashed border-muted-foreground/30 group-hover:border-muted-foreground/50 flex items-center justify-center transition-colors">
                    <Plus className="size-4" />
                  </div>
                  <span className="text-sm">Add new habit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Habit Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedHabit ? (
            (() => {
              const todayCount = getDayCount(selectedHabit, today)
              const progress = selectedHabit.target > 0 ? (todayCount / selectedHabit.target) * 100 : 0
              const isComplete = todayCount >= selectedHabit.target

              // Dynamic color based on progress
              const getProgressColor = () => {
                if (progress >= 100) return 'text-green-500'
                if (progress >= 50) return 'text-primary'
                return 'text-muted-foreground'
              }

              const HabitIcon = getHabitIcon(selectedHabit.icon)

              return (
                <div className="space-y-8">
                  {/* Hero Section */}
                  <div className="text-center py-8">
                    {/* Edit/Delete actions */}
                    <div className="flex justify-end gap-1 mb-4">
                      <Button variant="ghost" size="icon" onClick={handleEditHabit} className="size-8">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleDeleteHabit} className="size-8 text-destructive hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <HabitIcon className="size-12 text-primary" />
                    </div>

                    {/* Habit Name */}
                    <h2 className="text-xl font-semibold mb-6">{selectedHabit.name}</h2>

                    {/* Big Progress Display */}
                    {selectedHabit.type === 'count' ? (
                      <div className="mb-6">
                        <div className={cn('text-6xl font-bold tracking-tight transition-colors', getProgressColor())}>
                          {todayCount}
                          <span className="text-3xl text-muted-foreground font-normal"> / {selectedHabit.target}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                          {selectedHabit.unit || 'today'}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <div className={cn(
                          'text-4xl font-bold transition-colors',
                          isComplete ? 'text-green-500' : 'text-muted-foreground'
                        )}>
                          {isComplete ? 'Done!' : 'Not yet'}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">today</p>
                      </div>
                    )}

                    {/* Main Action Button */}
                    {selectedHabit.type === 'count' ? (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => decrementHabitCount(selectedHabit.id, today)}
                          disabled={todayCount === 0}
                          className="size-12 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted/50 active:scale-95 disabled:opacity-30 transition-all duration-150"
                        >
                          <Minus className="size-5" />
                        </button>
                        <button
                          onClick={() => incrementHabitCount(selectedHabit.id, today)}
                          disabled={isComplete}
                          className={cn(
                            'h-14 px-8 rounded-xl flex items-center justify-center gap-2 font-medium text-lg transition-all duration-150',
                            isComplete
                              ? 'bg-green-500 text-white'
                              : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]'
                          )}
                        >
                          {isComplete ? (
                            <>
                              <Check className="size-5" />
                              Complete!
                            </>
                          ) : (
                            <>
                              <Plus className="size-5" />
                              Log {selectedHabit.unit || 'progress'}
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleHabitDay(selectedHabit.id, today)}
                        className={cn(
                          'h-14 px-8 rounded-xl flex items-center justify-center gap-2 font-medium text-lg transition-all duration-150 mx-auto active:scale-[0.98]',
                          isComplete
                            ? 'bg-green-500 text-white'
                            : 'bg-primary text-primary-foreground hover:opacity-90'
                        )}
                      >
                        <Check className="size-5" />
                        {isComplete ? 'Completed!' : 'Mark as done'}
                      </button>
                    )}
                  </div>

                  {/* Weekly Goal */}
                  {(() => {
                    const weekDays = getWeekDays(0)
                    const completedDays = weekDays.filter(d => !d.isFuture && isCompletedOnDay(selectedHabit, d.date)).length
                    const totalPastDays = weekDays.filter(d => !d.isFuture).length
                    const progressPercent = totalPastDays > 0 ? (completedDays / totalPastDays) * 100 : 0

                    return (
                      <div className="p-5 rounded-xl bg-card border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium">Weekly Goal</h3>
                          <span className={cn(
                            'text-sm font-semibold',
                            progressPercent >= 80 ? 'text-green-500' : progressPercent >= 50 ? 'text-primary' : 'text-muted-foreground'
                          )}>
                            {completedDays} of {totalPastDays} days
                          </span>
                        </div>
                        <Progress value={progressPercent} className={progressPercent >= 80 ? '[&>div]:bg-green-500' : ''} />
                        <p className="text-xs text-muted-foreground mt-2">
                          {progressPercent >= 80
                            ? '🎯 Great job this week!'
                            : progressPercent >= 50
                              ? 'Keep going, you\'re halfway there!'
                              : 'Start building your streak!'}
                        </p>
                      </div>
                    )
                  })()}

                  {/* Activity Heatmap */}
                  <div className="p-5 rounded-xl bg-card border border-border">
                    <h3 className="text-sm font-medium mb-4">{new Date().getFullYear()} Activity</h3>
                    <HabitHeatmap habit={selectedHabit} />
                  </div>
                </div>
              )
            })()
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Flame className="size-12 mx-auto mb-4 opacity-20" />
                <p>Select a habit to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <HabitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        habit={editingHabit}
      />
    </main>
  )
}
