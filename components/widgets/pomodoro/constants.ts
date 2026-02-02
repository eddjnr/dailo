export type Phase = 'focus' | 'shortBreak' | 'longBreak'

export const PHASE_TABS = [
  { id: 'focus' as Phase, label: 'Focus' },
  { id: 'shortBreak' as Phase, label: 'Break' },
  { id: 'longBreak' as Phase, label: 'Long' },
] as const

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function getPhaseLabel(phase: Phase): string {
  switch (phase) {
    case 'focus': return 'Focus'
    case 'shortBreak': return 'Break'
    case 'longBreak': return 'Long Break'
  }
}
