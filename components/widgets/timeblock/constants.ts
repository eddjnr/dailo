export const COLORS = [
  { id: 'slate', bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400' },
  { id: 'blue', bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  { id: 'emerald', bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  { id: 'amber', bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  { id: 'rose', bg: 'bg-rose-500/15', text: 'text-rose-400', dot: 'bg-rose-400' },
  { id: 'violet', bg: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400' },
] as const

export type ColorId = typeof COLORS[number]['id']

export interface BlockFormData {
  title: string
  startTime: string
  endTime: string
  color: string
}

export const DEFAULT_FORM_DATA: BlockFormData = {
  title: '',
  startTime: '09:00',
  endTime: '10:00',
  color: 'blue',
}

export function getColorClasses(colorId: string) {
  return COLORS.find((c) => c.id === colorId) || COLORS[1]
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export function getDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const totalMinutes = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMinutes < 60) return `${totalMinutes} min`
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function getCurrentTime(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

export function isCurrentBlock(block: { startTime: string; endTime: string }): boolean {
  const now = getCurrentTime()
  return now >= block.startTime && now <= block.endTime
}
