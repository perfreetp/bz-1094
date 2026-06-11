import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Card from './Card'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: ReactNode
  highlight?: 'copper' | 'none'
  className?: string
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  highlight = 'none',
  className,
}: StatCardProps) {
  const isPositive = (change ?? 0) >= 0

  return (
    <Card
      className={cn(
        'p-5',
        highlight === 'copper' && 'border-copper-200 bg-gradient-to-br from-white to-copper-50/30',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-500 font-medium">{title}</p>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tracking-tight font-serif',
              highlight === 'copper' ? 'text-copper-700' : 'text-ink-900'
            )}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center',
              highlight === 'copper'
                ? 'bg-copper-100 text-copper-600'
                : 'bg-brand-50 text-brand-600'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {typeof change === 'number' && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-sm font-semibold',
              isPositive ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(change)}%
          </span>
          {changeLabel && (
            <span className="text-sm text-ink-400">{changeLabel}</span>
          )}
        </div>
      )}
    </Card>
  )
}
