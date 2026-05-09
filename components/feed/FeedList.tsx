import { PostCard } from './PostCard'
import type { Post } from '@/lib/supabase/types'
import { Sprout } from 'lucide-react'

interface FeedListProps {
  posts: Post[]
  homeNeighborhoodId?: string | null
  emptyMessage?: string
}

export function FeedList({ posts, homeNeighborhoodId, emptyMessage }: FeedListProps) {
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

  // Split into local vs other when neighborhood prioritization is active
  const localPosts = homeNeighborhoodId
    ? posts.filter((p) => p.neighborhood_id === homeNeighborhoodId)
    : []
  const otherPosts = homeNeighborhoodId
    ? posts.filter((p) => p.neighborhood_id !== homeNeighborhoodId)
    : posts

  if (homeNeighborhoodId && localPosts.length > 0) {
    return (
      <div className="space-y-6">
        <section aria-label="Posts from your neighborhood">
          <h2 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Your neighborhood
          </h2>
          <ol className="space-y-4" role="list">
            {localPosts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ol>
        </section>

        {otherPosts.length > 0 && (
          <section aria-label="Posts from other neighborhoods">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Around Columbus
            </h2>
            <ol className="space-y-4" role="list">
              {otherPosts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ol>
          </section>
        )}
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
