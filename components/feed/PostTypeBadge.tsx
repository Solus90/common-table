import { cn } from '@/lib/utils'
import type { PostType } from '@/lib/supabase/types'

interface PostTypeBadgeProps {
  type: PostType
  className?: string
}

export function PostTypeBadge({ type, className }: PostTypeBadgeProps) {
  return (
    <span
      aria-label={`Post type: ${type === 'GIVE' ? 'Give' : 'Need'}`}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        type === 'GIVE'
          ? 'bg-give text-give-foreground'
          : 'bg-need text-need-foreground',
        className
      )}
    >
      {type === 'GIVE' ? 'Giving' : 'Need'}
    </span>
  )
}
