'use client'

import { Sun, Moon, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { WIDGET_ICONS, DEFAULT_WIDGET_ICON } from './constants'
import type { Widget } from '@/lib/types'

interface SidebarProps {
  widgets: Widget[]
  theme: 'light' | 'dark'
  isCustomizing: boolean
  onToggleTheme: () => void
  onToggleCustomizing: () => void
  onToggleWidgetVisibility: (id: string) => void
  onWidgetClick: (widget: Widget) => void
}

export function Sidebar({
  widgets,
  theme,
  isCustomizing,
  onToggleTheme,
  onToggleCustomizing,
  onToggleWidgetVisibility,
  onWidgetClick,
}: SidebarProps) {
  return (
    <aside className="w-16 shrink-0 border-r border-border flex flex-col items-center py-6 gap-2 sticky top-0 h-screen">
      {/* Logo */}
      <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Logo className="size-5 text-primary" />
      </div>

      {/* Widget toggles */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1">
        {widgets.map((widget) => {
          const Icon = WIDGET_ICONS[widget.type] || DEFAULT_WIDGET_ICON
          return (
            <button
              key={widget.id}
              onClick={() => {
                if (isCustomizing) {
                  onToggleWidgetVisibility(widget.id)
                } else if (widget.visible) {
                  onWidgetClick(widget)
                }
              }}
              className={cn(
                "size-10 rounded-xl flex items-center justify-center transition-all duration-200",
                widget.visible
                  ? "text-foreground bg-muted/50 hover:bg-muted cursor-pointer"
                  : "text-muted-foreground/50 hover:text-muted-foreground",
                isCustomizing && "hover:bg-muted/50 cursor-pointer"
              )}
              title={widget.title}
            >
              <Icon className="size-5" />
            </button>
          )
        })}
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-1 mt-auto">
        <button
          onClick={onToggleTheme}
          className="size-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
        </button>
        <button
          onClick={onToggleCustomizing}
          className={cn(
            "size-10 rounded-xl flex items-center justify-center transition-all",
            isCustomizing
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          aria-label={isCustomizing ? 'Done customizing' : 'Customize'}
        >
          <Settings className={cn("size-5", isCustomizing && "animate-spin")} />
        </button>
      </div>
    </aside>
  )
}
