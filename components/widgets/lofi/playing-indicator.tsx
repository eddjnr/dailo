'use client'

interface PlayingIndicatorProps {
  size?: 'sm' | 'md'
}

export function PlayingIndicator({ size = 'sm' }: PlayingIndicatorProps) {
  const barWidth = size === 'sm' ? 'w-0.5' : 'w-1'
  const heights = size === 'sm' ? [6, 8, 10] : [8, 11, 14]

  return (
    <div className="flex items-end gap-0.5">
      {heights.map((height, i) => (
        <div
          key={i}
          className={`${barWidth} bg-primary rounded-full animate-pulse`}
          style={{
            height: `${height}px`,
            animationDelay: `${(i + 1) * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}
