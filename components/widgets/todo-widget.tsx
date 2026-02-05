'use client'

import { memo, useState } from 'react'
import { Plus, Check, Trash2, Flame, Zap, Leaf, RotateCcw } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const priorityConfig = {
  1: {
    color: 'text-primary',
    borderColor: 'border-primary/50',
    activeColor: 'bg-primary text-primary-foreground',
    icon: Flame,
    label: 'High',
  },
  2: {
    color: 'text-amber-400',
    borderColor: 'border-amber-400/50',
    activeColor: 'bg-amber-400 text-amber-950',
    icon: Zap,
    label: 'Medium',
  },
  3: {
    color: 'text-muted-foreground',
    borderColor: 'border-muted-foreground/30',
    activeColor: 'bg-muted-foreground text-background',
    icon: Leaf,
    label: 'Low',
  },
}

export const TodoWidget = memo(function TodoWidget() {
  const todos = useAppStore((state) => state.todos)
  const addTodo = useAppStore((state) => state.addTodo)
  const toggleTodo = useAppStore((state) => state.toggleTodo)
  const deleteTodo = useAppStore((state) => state.deleteTodo)
  const [newTodo, setNewTodo] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<1 | 2 | 3>(1)
  const [isAdding, setIsAdding] = useState(false)

  const activeTodos = todos
    .filter((t) => !t.completed)
    .sort((a, b) => a.priority - b.priority)

  const completedTodos = todos.filter((t) => t.completed)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim()) {
      addTodo(newTodo.trim(), selectedPriority)
      setNewTodo('')
      setIsAdding(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Active priorities */}
        <div className="space-y-1">
          {activeTodos.map((todo) => {
            const config = priorityConfig[todo.priority]
            const Icon = config.icon
            return (
              <div
                key={todo.id}
                className="group flex items-center gap-3 py-2.5 px-1 rounded-xl transition-colors hover:bg-muted/20"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                    config.borderColor,
                    "hover:scale-110"
                  )}
                />
                <span className="flex-1 text-sm truncate">{todo.text}</span>
                <Icon className={cn("size-3.5 shrink-0", config.color)} />
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1 rounded-lg text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Add form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mt-2 space-y-3 p-3 rounded-xl bg-muted/20 border border-border/50">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What's your priority?"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              autoFocus
              spellCheck={false}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {([1, 2, 3] as const).map((p) => {
                  const config = priorityConfig[p]
                  const Icon = config.icon
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPriority(p)}
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center transition-all duration-200",
                        selectedPriority === p
                          ? cn(config.activeColor, "shadow-lg")
                          : cn("border-2", config.borderColor, config.color, "hover:scale-105")
                      )}
                    >
                      <Icon className="size-4" />
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setNewTodo('')
                  }}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTodo.trim()}
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

        {/* Empty state hint */}
        {activeTodos.length === 0 && !isAdding && (
          <p className="text-center text-sm text-muted-foreground/50 py-4">
            Focus on what matters most today
          </p>
        )}
      </div>

      {/* Completed section */}
      {completedTodos.length > 0 && (
        <div className="mt-auto pt-3 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-2">
            Completed
          </p>
          <div className="space-y-0.5 max-h-24 overflow-y-auto">
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-center gap-2.5 py-1.5 px-1 rounded-lg hover:bg-muted/20 transition-colors"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="size-4 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0 hover:bg-muted-foreground/30 transition-colors"
                  title="Mark as incomplete"
                >
                  <Check className="size-2.5 text-muted-foreground/60" />
                </button>
                <span className="flex-1 text-xs text-muted-foreground/50 line-through truncate">
                  {todo.text}
                </span>
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="p-1 rounded text-muted-foreground/30 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                  title="Restore"
                >
                  <RotateCcw className="size-3" />
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1 rounded text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})
