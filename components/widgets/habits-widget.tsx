"use client";

import { memo, useState } from "react";
import {
  Plus,
  Minus,
  X,
  Check,
  Flame,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { ProgressRing, getHabitIcon } from "../habits/progress-ring";
import type { HabitType } from "@/lib/types";

// Format date to local YYYY-MM-DD (avoids timezone issues with toISOString)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const habitIcons = [
  { id: "droplets", label: "Water" },
  { id: "moon", label: "Sleep" },
  { id: "dumbbell", label: "Exercise" },
  { id: "book", label: "Read" },
  { id: "heart", label: "Health" },
];

export const HabitsWidget = memo(function HabitsWidget() {
  const habits = useAppStore((state) => state.habits);
  const addHabit = useAppStore((state) => state.addHabit);
  const toggleHabitDay = useAppStore((state) => state.toggleHabitDay);
  const incrementHabitCount = useAppStore((state) => state.incrementHabitCount);
  const decrementHabitCount = useAppStore((state) => state.decrementHabitCount);
  const deleteHabit = useAppStore((state) => state.deleteHabit);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    icon: "droplets",
    type: "binary" as HabitType,
    target: 1,
  });
  const [collapsedHabits, setCollapsedHabits] = useState<Set<string>>(
    new Set()
  );

  const toggleCollapsed = (habitId: string) => {
    setCollapsedHabits((prev) => {
      const next = new Set(prev);
      if (next.has(habitId)) {
        next.delete(habitId);
      } else {
        next.add(habitId);
      }
      return next;
    });
  };

  const today = formatLocalDate(new Date());

  const getCurrentWeek = () => {
    const days = [];
    const todayDate = new Date();
    const todayStr = formatLocalDate(todayDate);

    // Get Monday of current week
    const dayOfWeek = todayDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(todayDate);
    monday.setDate(todayDate.getDate() + diffToMonday);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = formatLocalDate(date);
      days.push({
        date: dateStr,
        label: date.toLocaleDateString("en", { weekday: "short" }).charAt(0),
        isToday: dateStr === todayStr,
      });
    }
    return days;
  };

  const days = getCurrentWeek();

  const getStreak = (habit: typeof habits[0]) => {
    let streak = 0;
    const sortedDays = [...habit.dayData].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatLocalDate(date);
      const dayData = sortedDays.find((d) => d.date === dateStr);

      if (dayData && dayData.count >= habit.target) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.name.trim()) {
      addHabit({
        name: newHabit.name.trim(),
        icon: newHabit.icon,
        type: newHabit.type,
        target: newHabit.type === "binary" ? 1 : newHabit.target,
      });
      setNewHabit({ name: "", icon: "droplets", type: "binary", target: 1 });
      setIsAdding(false);
    }
  };

  const getDayCount = (habit: typeof habits[0], date: string) => {
    const dayData = habit.dayData.find((d) => d.date === date);
    return dayData?.count || 0;
  };

  const isCompletedOnDay = (habit: typeof habits[0], date: string) => {
    return getDayCount(habit, date) >= habit.target;
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {habits.length === 0 && !isAdding ? (
        <div className="flex-1 flex items-center justify-center">
          <Empty className="py-0">
            <EmptyHeader>
              <EmptyMedia variant="default" className="text-muted-foreground/40">
                <Flame className="size-8" />
              </EmptyMedia>
              <EmptyTitle className="text-muted-foreground/90">
                No habits yet
              </EmptyTitle>
              <EmptyDescription>
                Build your daily routine by tracking habits that matter to you.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={() => setIsAdding(true)} variant="outline">
                Add Habit
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-5">
          {habits.map((habit) => {
            const Icon = getHabitIcon(habit.icon);
            const streak = getStreak(habit);
            const todayCount = getDayCount(habit, today);
            const todayProgress = (todayCount / habit.target) * 100;
            const isCompletedToday = todayCount >= habit.target;
            const isCollapsed = collapsedHabits.has(habit.id);

            return (
              <div key={habit.id} className="group">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => toggleCollapsed(habit.id)}
                    className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                  >
                    <ProgressRing
                      progress={todayProgress}
                      size={32}
                      strokeWidth={3}
                      icon={habit.icon}
                    />
                    <span className="text-sm font-medium">{habit.name}</span>
                    {habit.type === "count" && (
                      <span className="text-xs text-muted-foreground">
                        {todayCount}/{habit.target}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform duration-300",
                        !isCollapsed && "rotate-180"
                      )}
                    />
                  </button>
                  <div className="flex items-center gap-3">
                    {streak > 0 && (
                      <span className="text-xs text-primary flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10">
                        <Flame className="size-3" />
                        {streak}
                      </span>
                    )}
                    {/* Quick actions for count habits */}
                    {habit.type === "count" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => decrementHabitCount(habit.id, today)}
                          disabled={todayCount === 0}
                          className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-all"
                        >
                          <Minus className="size-3" />
                        </button>
                        <button
                          onClick={() => incrementHabitCount(habit.id, today)}
                          disabled={isCompletedToday}
                          className={cn(
                            "size-6 rounded-md flex items-center justify-center transition-all",
                            isCompletedToday
                              ? "bg-green-500/10 text-green-500"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          {isCompletedToday ? (
                            <Check className="size-3" />
                          ) : (
                            <Plus className="size-3" />
                          )}
                        </button>
                      </div>
                    )}
                    {/* Quick action for binary habits */}
                    {habit.type === "binary" && (
                      <button
                        onClick={() => toggleHabitDay(habit.id, today)}
                        className={cn(
                          "size-6 rounded-md flex items-center justify-center transition-all",
                          isCompletedToday
                            ? "bg-green-500 text-white"
                            : "border border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary"
                        )}
                      >
                        <Check className="size-3" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    !isCollapsed
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="flex justify-between gap-1.5">
                      {days.map((day) => {
                        const isCompleted = isCompletedOnDay(habit, day.date);
                        const dayCount = getDayCount(habit, day.date);
                        const progress = habit.target > 0 ? (dayCount / habit.target) * 100 : 0;
                        const size = 26;
                        const strokeWidth = 2.5;
                        const radius = (size - strokeWidth) / 2;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

                        return (
                          <button
                            key={day.date}
                            onClick={() => {
                              if (habit.type === "binary") {
                                toggleHabitDay(habit.id, day.date);
                              } else {
                                // For count: increment, reset to 0 when exceeds target
                                if (dayCount >= habit.target) {
                                  for (let i = 0; i < dayCount; i++) {
                                    decrementHabitCount(habit.id, day.date);
                                  }
                                } else {
                                  incrementHabitCount(habit.id, day.date);
                                }
                              }
                            }}
                            className={cn(
                              "flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all duration-300 border-2 border-transparent",
                              isCompleted
                                ? "bg-primary/15"
                                : "bg-muted/20 hover:bg-muted/40",
                              day.isToday && "border-primary/50"
                            )}
                          >
                            <span
                              className={cn(
                                "text-[10px] uppercase tracking-wider",
                                day.isToday
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground/70"
                              )}
                            >
                              {day.label}
                            </span>
                            {/* Progress ring for count habits */}
                            <div className="relative" style={{ width: size, height: size }}>
                              {habit.type === "count" && dayCount > 0 && !isCompleted && (
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
                              <div
                                className={cn(
                                  "absolute inset-0.5 rounded-full flex items-center justify-center transition-all duration-300 text-[10px] font-medium",
                                  isCompleted
                                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                                    : habit.type === "count" && dayCount > 0
                                      ? "bg-background text-foreground"
                                      : "bg-muted/50"
                                )}
                              >
                                {isCompleted ? (
                                  <Check className="size-3.5" />
                                ) : habit.type === "count" && dayCount > 0 ? (
                                  dayCount
                                ) : null}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isAdding && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-4 rounded-2xl bg-muted/20 border border-border/50"
            >
              <input
                type="text"
                value={newHabit.name}
                onChange={(e) =>
                  setNewHabit({ ...newHabit, name: e.target.value })
                }
                placeholder="Habit name"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 font-medium"
                autoFocus
                spellCheck={false}
              />

              {/* Type selection */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewHabit({ ...newHabit, type: "binary", target: 1 })}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-xs transition-all",
                    newHabit.type === "binary"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  Simple
                </button>
                <button
                  type="button"
                  onClick={() => setNewHabit({ ...newHabit, type: "count", target: 8 })}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-xs transition-all",
                    newHabit.type === "count"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  Count
                </button>
              </div>

              {newHabit.type === "count" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Target:</span>
                  <div className="flex items-center border border-input rounded-full overflow-hidden">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newHabit.target}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, target: parseInt(e.target.value) || 1 })
                      }
                      className="w-12 bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, target: Math.max(1, newHabit.target - 1) })}
                      disabled={newHabit.target <= 1}
                      className="size-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-colors border-l border-input"
                    >
                      <Minus className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, target: Math.min(100, newHabit.target + 1) })}
                      disabled={newHabit.target >= 100}
                      className="size-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-colors border-l border-input"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {habitIcons.map((h) => {
                    const IconComp = getHabitIcon(h.id);
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setNewHabit({ ...newHabit, icon: h.id })}
                        className={cn(
                          "size-8 rounded-xl flex items-center justify-center transition-all duration-200",
                          newHabit.icon === h.id
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                            : "border-2 border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:scale-105 hover:border-muted-foreground/50"
                        )}
                      >
                        <IconComp className="size-4" />
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newHabit.name.trim()}
                    className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-xl disabled:opacity-40 transition-all duration-200 btn-lift shadow-lg shadow-primary/20"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {!isAdding && habits.length > 0 && habits.length < 5 && (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 shrink-0 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300 group"
        >
          <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add habit</span>
        </button>
      )}
    </div>
  );
});
