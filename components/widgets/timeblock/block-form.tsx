'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COLORS, BlockFormData } from './constants'

interface BlockFormProps {
  formData: BlockFormData
  onFormChange: (data: BlockFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function BlockForm({ formData, onFormChange, onSubmit, onCancel }: BlockFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/50">
      <input
        type="text"
        value={formData.title}
        onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
        placeholder="Block title"
        className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/50"
        autoFocus
        spellCheck={false}
      />
      <div className="flex items-center gap-2 text-sm">
        <input
          type="time"
          value={formData.startTime}
          onChange={(e) => onFormChange({ ...formData, startTime: e.target.value })}
          className="bg-muted/50 rounded-lg px-2 py-1.5 text-xs outline-none border border-border/50"
        />
        <span className="text-muted-foreground/50">→</span>
        <input
          type="time"
          value={formData.endTime}
          onChange={(e) => onFormChange({ ...formData, endTime: e.target.value })}
          className="bg-muted/50 rounded-lg px-2 py-1.5 text-xs outline-none border border-border/50"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onFormChange({ ...formData, color: c.id })}
              className={cn(
                "size-5 rounded-full transition-all",
                c.dot,
                formData.color === c.id && "ring-2 ring-offset-2 ring-offset-card ring-white/50 scale-110"
              )}
            />
          ))}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
          >
            <X className="size-4" />
          </button>
          <button
            type="submit"
            disabled={!formData.title.trim()}
            className="p-1.5 text-primary hover:text-primary disabled:opacity-30 transition-all rounded-lg hover:bg-primary/10"
          >
            <Check className="size-4" />
          </button>
        </div>
      </div>
    </form>
  )
}
