'use client'

import { cn } from '@/lib/utils'
import { PHASE_TABS, Phase } from './constants'

interface PhaseTabsProps {
  currentPhase: Phase
  isRunning: boolean
  onSelectPhase: (phase: Phase) => void
}

export function PhaseTabs({ currentPhase, isRunning, onSelectPhase }: PhaseTabsProps) {
  return (
    <div className="flex justify-center gap-1 mb-2 shrink-0">
      {PHASE_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectPhase(tab.id)}
          disabled={isRunning}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
            currentPhase === tab.id
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            isRunning && currentPhase !== tab.id && "opacity-40 cursor-not-allowed"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
