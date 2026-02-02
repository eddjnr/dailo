'use client'

import { Minus, Plus } from 'lucide-react'

interface SettingRowProps {
  label: string
  value: number
  unit: string
  onDecrease: () => void
  onIncrease: () => void
}

export function SettingRow({ label, value, unit, onDecrease, onIncrease }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={onDecrease}
          className="size-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
        >
          <Minus className="size-3.5" />
        </button>
        <div className="w-12 text-center">
          <span className="text-lg font-light tabular-nums">{value}</span>
          <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>
        </div>
        <button
          onClick={onIncrease}
          className="size-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
