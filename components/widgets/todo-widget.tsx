"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Flame, Zap, Leaf, ExternalLink } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";

const priorityConfig = {
  1: {
    color: "text-primary",
    borderColor: "border-primary/50",
    activeColor: "bg-primary text-primary-foreground",
    icon: Flame,
    label: "High",
  },
  2: {
    color: "text-amber-400",
    borderColor: "border-amber-400/50",
    activeColor: "bg-amber-400 text-amber-950",
    icon: Zap,
    label: "Medium",
  },
  3: {
    color: "text-muted-foreground",
    borderColor: "border-muted-foreground/30",
    activeColor: "bg-muted-foreground text-background",
    icon: Leaf,
    label: "Low",
  },
};

export const TodoWidget = memo(function TodoWidget() {
  const router = useRouter();
  const tasks = useAppStore((state) => state.tasks);
  const addTask = useAppStore((state) => state.addTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const setActiveTask = useAppStore((state) => state.setActiveTask);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<1 | 2 | 3>(1);
  const [isAdding, setIsAdding] = useState(false);

  // Show high/medium priority tasks that aren't done, limited to 5
  const topPriorities = tasks
    .filter((t) => t.status !== "done" && t.priority <= 2)
    .sort((a, b) => a.priority - b.priority || a.order - b.order)
    .slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle.trim(),
        description: "",
        status: "todo",
        priority: selectedPriority,
        tags: [],
        dueDate: null,
      });
      setNewTaskTitle("");
      setIsAdding(false);
    }
  };

  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      updateTask(taskId, { status: task.status === "done" ? "todo" : "done" });
    }
  };

  const handleTaskClick = (taskId: string) => {
    setActiveTask(taskId);
    router.push("/tasks");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Priority list */}
        <div className="space-y-1">
          {topPriorities.map((task) => {
            const config = priorityConfig[task.priority];
            const Icon = config.icon;
            return (
              <div
                key={task.id}
                className="group flex items-center gap-3 py-2.5 px-1 rounded-xl transition-colors hover:bg-muted/20"
              >
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                    config.borderColor,
                    "hover:scale-110",
                  )}
                >
                  {task.status === "done" && (
                    <Check className="size-3 text-muted-foreground" />
                  )}
                </button>
                <span
                  onClick={() => handleTaskClick(task.id)}
                  className={cn(
                    "flex-1 text-sm truncate cursor-pointer hover:text-primary transition-colors",
                    task.status === "done" &&
                      "line-through text-muted-foreground",
                  )}
                >
                  {task.title}
                </span>
                <Icon className={cn("size-3.5 shrink-0", config.color)} />
              </div>
            );
          })}
        </div>

        {/* Add form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="mt-2 space-y-3 p-3 rounded-xl bg-muted/20 border border-border/50"
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What's your priority?"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              autoFocus
              spellCheck={false}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {([1, 2, 3] as const).map((p) => {
                  const config = priorityConfig[p];
                  const Icon = config.icon;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPriority(p)}
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center transition-all duration-200",
                        selectedPriority === p
                          ? cn(config.activeColor, "shadow-lg")
                          : cn(
                              "border-2",
                              config.borderColor,
                              config.color,
                              "hover:scale-105",
                            ),
                      )}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTaskTitle("");
                  }}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg disabled:opacity-40 transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Add button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-1 flex items-center gap-2 w-full py-2.5 px-1 rounded-xl text-sm text-muted-foreground/60 hover:text-foreground hover:bg-muted/20 transition-all group"
          >
            <div className="size-5 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-muted-foreground/50 transition-colors">
              <Plus className="size-3 opacity-50 group-hover:opacity-100" />
            </div>
            <span>Add priority</span>
          </button>
        )}

        {/* Empty state */}
        {topPriorities.length === 0 && !isAdding && (
          <p className="text-center text-sm text-muted-foreground/50 py-4">
            No high priority tasks
          </p>
        )}
      </div>

      <Link
        href="/tasks"
        className="mt-auto pt-3 border-t border-border/30 flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
      >
        {/* Link to full board */}

        <span>View all tasks</span>
        <ExternalLink className="size-3 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
});
