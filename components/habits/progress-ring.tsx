'use client'

import { cn } from '@/lib/utils'
import {
  Droplets,
  Moon,
  Dumbbell,
  BookOpen,
  Heart,
  Flame,
  Coffee,
  Footprints,
  Pill,
  Bike,
  type LucideIcon,
} from 'lucide-react'

const habitIconsMap: Record<string, LucideIcon> = {
  droplets: Droplets,
  moon: Moon,
  dumbbell: Dumbbell,
  book: BookOpen,
  heart: Heart,
  flame: Flame,
  coffee: Coffee,
  footprints: Footprints,
  pill: Pill,
  bike: Bike,
}

export function getHabitIcon(iconId: string): LucideIcon {
  return habitIconsMap[iconId] || Flame
}

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  icon?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 4,
  icon,
  showPercentage = false,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference
  const isComplete = progress >= 100

  const Icon = icon ? getHabitIcon(icon) : null

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg className="size-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            'transition-all duration-300',
            isComplete ? 'text-green-500' : 'text-primary'
          )}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {showPercentage ? (
          <span className="text-xs font-medium">{Math.round(progress)}%</span>
        ) : Icon ? (
          <Icon
            className={cn(
              'transition-colors',
              isComplete ? 'text-green-500' : 'text-muted-foreground'
            )}
            style={{ width: size * 0.35, height: size * 0.35 }}
          />
        ) : null}
      </div>
    </div>
  )
}
