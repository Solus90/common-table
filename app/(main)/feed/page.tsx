import { createClient } from '@/lib/supabase/server'
import { FeedList } from '@/components/feed/FeedList'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'
import type { Post } from '@/lib/supabase/types'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export const metadata = {
  title: 'Feed — Common Table',
}

async function PostsFeed() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(id, display_name, avatar_url, neighborhood_id),
      neighborhood:neighborhoods(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return (
      <div className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive" role="alert">
        Could not load posts. Please refresh to try again.
      </div>
    )
  }

  return <FeedList posts={(posts as unknown as Post[]) ?? []} />
}

function FeedSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading posts">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FeedPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Community Feed</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            What your neighbors are sharing
          </p>
        </div>
        <Link
          href="/post/new"
          className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Create a new post"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Post
        </Link>
      </div>
      <Suspense fallback={<FeedSkeleton />}>
        <PostsFeed />
      </Suspense>
    </div>
  )
}
