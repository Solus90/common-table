import { PostCard } from './PostCard'
import type { Post } from '@/lib/supabase/types'
import { Sprout } from 'lucide-react'

interface FeedListProps {
  posts: Post[]
  emptyMessage?: string
}

export function FeedList({ posts, emptyMessage }: FeedListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Sprout className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground mb-2">
          {emptyMessage ? 'No results' : 'The table is set'}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          {emptyMessage ?? "Your neighborhood hasn't posted anything yet. Be the first to share something or ask for help."}
        </p>
      </div>
    )
  }

  return (
    <section aria-label="Community posts">
      <ol className="space-y-4" role="list">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ol>
    </section>
  )
}
