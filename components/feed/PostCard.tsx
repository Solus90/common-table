import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PostTypeBadge } from './PostTypeBadge'
import type { Post } from '@/lib/supabase/types'
import { formatDistanceToNow } from '@/lib/utils'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const initials = post.author?.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '??'

  return (
    <article className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <Link
        href={`/post/${post.id}`}
        className="block p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
        aria-label={`${post.type === 'GIVE' ? 'Giving' : 'Need'}: ${post.title}`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <PostTypeBadge type={post.type} />
          {post.status !== 'open' && (
            <span className="text-xs text-muted-foreground font-medium capitalize">
              {post.status}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-foreground leading-snug mb-1.5">
          {post.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
          {post.description}
        </p>

        {/* Optional image */}
        {post.image_url && (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 bg-muted">
            <Image
              src={post.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-1">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={post.author?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            <span className="font-medium text-foreground">
              {post.author?.display_name ?? 'A neighbor'}
            </span>
            {post.neighborhood && (
              <> · {post.neighborhood.name}</>
            )}
            {' · '}
            {formatDistanceToNow(post.created_at)}
          </span>
        </div>
      </Link>
    </article>
  )
}
