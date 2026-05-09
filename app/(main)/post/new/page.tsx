import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewPostForm } from '@/components/post/NewPostForm'
import type { Neighborhood } from '@/lib/supabase/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'New Post — Common Table',
}

export default async function NewPostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/post/new')
  }

  const [profileResult, neighborhoodsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('neighborhood_id')
      .eq('id', user.id)
      .single(),
    supabase
      .from('neighborhoods')
      .select('*')
      .order('name'),
  ])

  const neighborhoods = (neighborhoodsResult.data ?? []) as Neighborhood[]
  const defaultNeighborhoodId = profileResult.data?.neighborhood_id ?? null

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/feed"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          aria-label="Back to feed"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Feed
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Share with your neighbors</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All posts are public within your neighborhood.
        </p>
      </div>

      <NewPostForm
        neighborhoods={neighborhoods}
        userId={user.id}
        defaultNeighborhoodId={defaultNeighborhoodId}
      />
    </div>
  )
}
