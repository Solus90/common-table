import { createClient } from '@/lib/supabase/server'
import { NeighborCard } from '@/components/community/NeighborCard'
import type { Profile } from '@/lib/supabase/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Neighbors',
  description: 'Meet neighbors in Common Table and discover people actively helping others in your area.',
  alternates: {
    canonical: '/community',
  },
}

export default async function CommunityPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      *,
      neighborhood:neighborhoods(id, name)
    `)
    .order('neighbors_helped_count', { ascending: false })
    .limit(48)

  const communityProfiles = (profiles ?? []) as unknown as Profile[]

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-foreground">Your Neighbors</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          The people showing up for each other
        </p>
      </div>

      {communityProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-muted-foreground">
            No neighbors yet. Be the first to post and help build your community.
          </p>
        </div>
      ) : (
        <section aria-label="Community members">
          <ol
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            role="list"
          >
            {communityProfiles.map((profile) => (
              <li key={profile.id}>
                <NeighborCard profile={profile} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
