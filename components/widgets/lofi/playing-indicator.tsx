'use client'

interface PlayingIndicatorProps {
  size?: 'sm' | 'md'
}

export function PlayingIndicator({ size = 'sm' }: PlayingIndicatorProps) {
  const barWidth = size === 'sm' ? 'w-0.5' : 'w-1'
  const maxHeight = size === 'sm' ? 6 : 10
  const minHeight = size === 'sm' ? 1 : 2

  return (
    <div className="flex items-end gap-0.5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`${barWidth} bg-primary rounded-full`}
          style={{
            height: `${maxHeight}px`,
            animation: `soundbar 1.4s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            ['--min-height' as string]: `${minHeight}px`,
            ['--max-height' as string]: `${maxHeight}px`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes soundbar {
          0%, 100% {
            height: var(--min-height);
          }
          50% {
            height: var(--max-height);
          }
        }
      `}</style>
    </div>
  )
}
