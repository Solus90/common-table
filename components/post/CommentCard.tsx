import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow, getInitials } from '@/lib/utils'
import type { Comment } from '@/lib/supabase/types'
import Link from 'next/link'

interface CommentCardProps {
  comment: Comment
}

export function CommentCard({ comment }: CommentCardProps) {
  const authorName = comment.author?.display_name ?? 'A neighbor'

  return (
    <div className="flex gap-3">
      <Link href={`/profile/${comment.author_id}`} className="shrink-0 mt-0.5" tabIndex={-1} aria-hidden="true">
        <Avatar className="h-7 w-7">
          <AvatarImage src={comment.author?.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
            {getInitials(authorName)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5">
          <Link
            href={`/profile/${comment.author_id}`}
            className="text-xs font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {authorName}
          </Link>
          <p className="text-sm text-foreground leading-relaxed mt-0.5 break-words">
            {comment.content}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-1">
          {formatDistanceToNow(comment.created_at)}
        </p>
      </div>
    </div>
  )
}
