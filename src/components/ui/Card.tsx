import type { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'hover'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  children: ReactNode
}

export default function Card({
  variant = 'default',
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-card border border-ink-100 transition-all duration-200',
        variant === 'hover' &&
          'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
