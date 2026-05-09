import { createClient } from '@/lib/supabase/server'
import { FeedList } from '@/components/feed/FeedList'
import { FeedFilters } from '@/components/feed/FeedFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'
import type { Post } from '@/lib/supabase/types'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Feed',
  description: 'Browse nearby mutual aid posts, search by need or offer, and connect with neighbors in your community.',
  alternates: {
    canonical: '/feed',
  },
}

type SearchParams = Promise<{ q?: string; type?: string }>

async function PostsFeed({ q, type }: { q: string; type: string }) {
  const supabase = await createClient()

  // Get user's home neighborhood for prioritization
  const { data: { user } } = await supabase.auth.getUser()
  let homeNeighborhoodId: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('neighborhood_id')
      .eq('id', user.id)
      .single()
    homeNeighborhoodId = profile?.neighborhood_id ?? null
  }

  const selectClause = `
    *,
    author:profiles(id, display_name, avatar_url, neighborhood_id),
    neighborhood:neighborhoods(id, name)
  `

  let posts: Post[] = []

  if (homeNeighborhoodId && !q && !type) {
    // Prioritize: home neighborhood first, then everything else
    const [localResult, otherResult] = await Promise.all([
      supabase
        .from('posts')
        .select(selectClause)
        .eq('neighborhood_id', homeNeighborhoodId)
        .order('created_at', { ascending: false })
        .limit(25),
      supabase
        .from('posts')
        .select(selectClause)
        .or(`neighborhood_id.neq.${homeNeighborhoodId},neighborhood_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(25),
    ])
    posts = [
      ...((localResult.data ?? []) as unknown as Post[]),
      ...((otherResult.data ?? []) as unknown as Post[]),
    ]
  } else {
    // Search/filter active — single sorted query, no prioritization
    let query = supabase
      .from('posts')
      .select(selectClause)
      .order('created_at', { ascending: false })
      .limit(50)

    if (type === 'GIVE' || type === 'NEED') {
      query = query.eq('type', type)
    }
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    }

    const { data, error } = await query

    if (error) {
      return (
        <div className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          Could not load posts. Please refresh to try again.
        </div>
      )
    }
    posts = (data ?? []) as unknown as Post[]
  }

  return (
    <FeedList
      posts={posts}
      homeNeighborhoodId={homeNeighborhoodId}
      emptyMessage={
        q || type
          ? 'No posts match your search. Try different words or clear the filter.'
          : undefined
      }
    />
  )
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

export default async function FeedPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = '', type = '' } = await searchParams

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Community Feed</h1>
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

      <FeedFilters />

      <Suspense fallback={<FeedSkeleton />} key={`${q}-${type}`}>
        <PostsFeed q={q} type={type} />
      </Suspense>
    </div>
  )
}
