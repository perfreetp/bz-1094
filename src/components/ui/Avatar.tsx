import { cn } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  emoji?: string
  src?: string
  alt?: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
}

export default function Avatar({
  emoji,
  src,
  alt = '',
  size = 'md',
  className,
}: AvatarProps) {
  const baseClasses = cn(
    'rounded-full flex items-center justify-center overflow-hidden bg-brand-100 font-medium',
    sizeClasses[size],
    className
  )

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(baseClasses, 'object-cover')}
      />
    )
  }

  return (
    <div className={baseClasses}>
      {emoji ? (
        <span className="leading-none">{emoji}</span>
      ) : (
        <span className="text-ink-500">{alt?.charAt(0)?.toUpperCase() || '?'}</span>
      )}
    </div>
  )
}
