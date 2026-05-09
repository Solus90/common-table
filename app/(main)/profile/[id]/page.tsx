import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { EndorseForm } from '@/components/profile/EndorseForm'
import { PostCard } from '@/components/feed/PostCard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, formatDistanceToNow } from '@/lib/utils'
import type { Profile, Post, Endorsement, Neighborhood } from '@/lib/supabase/types'
import { LogoutButton } from '@/components/shared/LogoutButton'
import { NeighborhoodUpdateForm } from '@/components/profile/NeighborhoodUpdateForm'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('display_name').eq('id', id).single()
  if (!data) return { title: 'Profile — Common Table' }
  return { title: `${data.display_name} — Common Table` }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [profileResult, postsResult, endorsementsResult, authResult, neighborhoodsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select(`*, neighborhood:neighborhoods(id, name)`)
      .eq('id', id)
      .single(),
    supabase
      .from('posts')
      .select(`*, author:profiles(id, display_name, avatar_url), neighborhood:neighborhoods(id, name)`)
      .eq('author_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('endorsements')
      .select(`*, endorser:profiles(id, display_name, avatar_url)`)
      .eq('endorsed_id', id)
      .order('created_at', { ascending: false }),
    supabase.auth.getUser(),
    supabase.from('neighborhoods').select('*').order('name'),
  ])

  if (profileResult.error || !profileResult.data) {
    notFound()
  }

  const profile = profileResult.data as unknown as Profile
  const posts = (postsResult.data ?? []) as unknown as Post[]
  const endorsements = (endorsementsResult.data ?? []) as unknown as Endorsement[]
  const neighborhoods = (neighborhoodsResult.data ?? []) as Neighborhood[]
  const currentUser = authResult.data.user
  const isOwnProfile = currentUser?.id === id
  const hasEndorsed = endorsements.some((e) => e.endorser_id === currentUser?.id)

  return (
    <div className="space-y-5">
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        aria-label="Back to community"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Community
      </Link>

      <ProfileHeader
        profile={profile}
        endorsementCount={endorsements.length}
        postCount={posts.length}
      />

      {/* Neighborhood setting — own profile only */}
      {isOwnProfile && (
        <div className="bg-card rounded-2xl border border-border px-5 py-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Your neighborhood
          </h2>
          <NeighborhoodUpdateForm
            userId={id}
            currentNeighborhoodId={profile.neighborhood_id}
            neighborhoods={neighborhoods}
          />
        </div>
      )}

      {/* Endorse button */}
      {currentUser && !isOwnProfile && !hasEndorsed && (
        <div>
          <EndorseForm
            endorsedId={id}
            endorsedName={profile.display_name}
            currentUserId={currentUser.id}
          />
        </div>
      )}

      {/* Endorsements */}
      {endorsements.length > 0 && (
        <section aria-label="Endorsements">
          <h2 className="text-base font-semibold text-foreground mb-3">
            What neighbors say
          </h2>
          <div className="space-y-3">
            {endorsements.map((endorsement) => (
              <blockquote
                key={endorsement.id}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                  "{endorsement.content}"
                </p>
                <footer className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage src={endorsement.endorser?.avatar_url ?? undefined} alt="" />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {getInitials(endorsement.endorser?.display_name ?? '?')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    <Link
                      href={`/profile/${endorsement.endorser_id}`}
                      className="font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                      {endorsement.endorser?.display_name ?? 'A neighbor'}
                    </Link>
                    {' · '}{formatDistanceToNow(endorsement.created_at)}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <section aria-label={`${profile.display_name}'s posts`}>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Recent posts
          </h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Sign out — own profile only */}
      {isOwnProfile && (
        <div className="pt-4 pb-2 flex justify-center border-t border-border">
          <LogoutButton />
        </div>
      )}
    </div>
  )
}
