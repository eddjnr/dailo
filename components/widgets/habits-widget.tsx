"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Check,
  Flame,
  Droplets,
  Moon,
  Dumbbell,
  BookOpen,
  Heart,
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

const habitIcons = [
  // { id: 'flame', icon: Flame, label: 'Streak' },
  { id: "droplets", icon: Droplets, label: "Water" },
  { id: "moon", icon: Moon, label: "Sleep" },
  { id: "dumbbell", icon: Dumbbell, label: "Exercise" },
  { id: "book", icon: BookOpen, label: "Read" },
  { id: "heart", icon: Heart, label: "Health" },
];

export function HabitsWidget() {
  const { habits, addHabit, toggleHabitDay, deleteHabit } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", icon: "flame" });
  const [collapsedHabits, setCollapsedHabits] = useState<Set<string>>(new Set());

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

  const today = new Date().toISOString().split("T")[0];

  const getCurrentWeek = () => {
    const days = [];
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Get Monday of current week
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, so go back 6 days
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        label: date.toLocaleDateString("en", { weekday: "short" }).charAt(0),
        isToday: dateStr === todayStr,
      });
    }
    return days;
  };

  const days = getCurrentWeek();

  const getStreak = (completedDays: string[]) => {
    let streak = 0;
    const sortedDays = [...completedDays].sort().reverse();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      if (sortedDays.includes(dateStr)) {
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
      addHabit(newHabit.name.trim(), newHabit.icon);
      setNewHabit({ name: "", icon: "flame" });
      setIsAdding(false);
    }
  };

  const getIcon = (iconId: string) => {
    return habitIcons.find((h) => h.id === iconId)?.icon || Flame;
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
              <EmptyTitle className="text-muted-foreground/90">No habits yet</EmptyTitle>
              <EmptyDescription>
                Build your daily routine by tracking habits that matter to you.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={() => setIsAdding(true)} variant="outline">Add Habit</Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-5">
          {habits.map((habit) => {
            const Icon = getIcon(habit.icon);
            const streak = getStreak(habit.completedDays);
            const isCompletedToday = habit.completedDays.includes(today);
            const isCollapsed = collapsedHabits.has(habit.id);
            return (
              <div key={habit.id} className="group">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => toggleCollapsed(habit.id)}
                    className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-lg transition-colors duration-300",
                        isCompletedToday ? "bg-primary/20" : "bg-muted/30",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 transition-colors duration-300",
                          isCompletedToday
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <span className="text-sm font-medium">{habit.name}</span>
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
                    !isCollapsed ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="flex justify-between gap-1.5">
                  {days.map((day) => {
                    const isCompleted = habit.completedDays.includes(day.date);
                    return (
                      <button
                        key={day.date}
                        onClick={() => toggleHabitDay(habit.id, day.date)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all duration-300 border-2 border-transparent",
                          isCompleted
                            ? "bg-primary/15"
                            : "bg-muted/20 hover:bg-muted/40",
                          day.isToday && "border-primary/50",
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px] uppercase tracking-wider",
                            day.isToday
                              ? "text-primary font-medium"
                              : "text-muted-foreground/70",
                          )}
                        >
                          {day.label}
                        </span>
                        <div
                          className={cn(
                            "size-6 rounded-full flex items-center justify-center transition-all duration-300",
                            isCompleted
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                              : "bg-muted/50",
                          )}
                        >
                          {isCompleted && <Check className="size-3.5" />}
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
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {habitIcons.map((h) => {
                  const IconComp = h.icon;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, icon: h.id })}
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center transition-all duration-200",
                        newHabit.icon === h.id
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                          : "border-2 border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:scale-105 hover:border-muted-foreground/50",
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
}
