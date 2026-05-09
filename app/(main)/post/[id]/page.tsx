import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PostTypeBadge } from '@/components/feed/PostTypeBadge'
import { OfferCard } from '@/components/post/OfferCard'
import { OfferHelpForm } from '@/components/post/OfferHelpForm'
import { CommentCard } from '@/components/post/CommentCard'
import { CommentForm } from '@/components/post/CommentForm'
import { DeletePostButton } from '@/components/post/DeletePostButton'
import { ArrowLeft, Mail } from 'lucide-react'
import { formatDistanceToNow, getInitials } from '@/lib/utils'
import type { Post, Offer, Comment, Profile } from '@/lib/supabase/types'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('posts').select('title, type').eq('id', id).single()
  if (!data) return { title: 'Post — Common Table' }
  return { title: `${data.type === 'GIVE' ? 'Giving' : 'Need'}: ${data.title} — Common Table` }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [postResult, offersResult, commentsResult, authResult] = await Promise.all([
    supabase
      .from('posts')
      .select(`*, author:profiles(id, display_name, avatar_url, email), neighborhood:neighborhoods(id, name)`)
      .eq('id', id)
      .single(),
    supabase
      .from('offers')
      .select(`*, author:profiles(id, display_name, avatar_url, email)`)
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('comments')
      .select(`*, author:profiles(id, display_name, avatar_url)`)
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
    supabase.auth.getUser(),
  ])

  if (postResult.error || !postResult.data) notFound()

  const post = postResult.data as unknown as Post
  const offers = (offersResult.data ?? []) as unknown as Offer[]
  const comments = (commentsResult.data ?? []) as unknown as Comment[]
  const currentUser = authResult.data.user
  const isPostAuthor = currentUser?.id === post.author_id
  const authorName = post.author?.display_name ?? 'A neighbor'

  // Accepted/fulfilled offers — used for contact reveal
  const closedOffers = offers.filter(
    (o) => o.status === 'accepted' || o.status === 'fulfilled'
  )
  const currentUserOffer = offers.find((o) => o.author_id === currentUser?.id)
  const currentUserOfferAccepted =
    currentUserOffer?.status === 'accepted' || currentUserOffer?.status === 'fulfilled'

  // Fetch current user's profile for comment form avatar
  let currentUserProfile: Pick<Profile, 'display_name' | 'avatar_url'> | null = null
  if (currentUser) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', currentUser.id)
      .single()
    currentUserProfile = data
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        aria-label="Back to feed"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Feed
      </Link>

      {/* Post */}
      <article className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <PostTypeBadge type={post.type} />
          {post.status !== 'open' && (
            <span className="text-sm text-muted-foreground font-medium capitalize">
              {post.status}
            </span>
          )}
        </div>

        <h1 className="text-xl font-semibold text-foreground leading-snug">
          {post.title}
        </h1>

        <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {post.description}
        </p>

        {post.image_url && (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted">
            <Image src={post.image_url} alt="" fill className="object-cover" sizes="(max-width: 672px) 100vw, 672px" />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-border">
          <Link
            href={`/profile/${post.author_id}`}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            aria-label={`View ${authorName}'s profile`}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={post.author?.avatar_url ?? undefined} alt="" />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                {getInitials(authorName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium text-foreground">{authorName}</div>
              <div className="text-xs text-muted-foreground">
                {post.neighborhood?.name && `${post.neighborhood.name} · `}
                {formatDistanceToNow(post.created_at)}
              </div>
            </div>
          </Link>
          {isPostAuthor && <DeletePostButton postId={post.id} />}
        </div>
      </article>

      {/* Offer help */}
      {currentUser && !isPostAuthor && post.status === 'open' && !currentUserOffer && (
        <OfferHelpForm postId={post.id} userId={currentUser.id} postTitle={post.title} />
      )}

      {/* Offers */}
      {offers.length > 0 && (
        <section aria-label={`${offers.length} ${offers.length === 1 ? 'offer' : 'offers'} of help`}>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Neighbors offering to help
            <span className="ml-2 text-sm font-normal text-muted-foreground">({offers.length})</span>
          </h2>
          <div className="space-y-3">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isPostAuthor={isPostAuthor}
                currentUserId={currentUser?.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Contact reveal — only shown when there's an accepted offer */}
      {closedOffers.length > 0 && (isPostAuthor || currentUserOfferAccepted) && (
        <section
          aria-label="Contact information for coordination"
          className="bg-give/8 border border-give/20 rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-give shrink-0" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">
              Ready to connect
            </h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Use the public thread below to arrange logistics, or reach out directly by email to coordinate privately.
          </p>

          <div className="space-y-2">
            {/* Post author sees each accepted offerer's email */}
            {isPostAuthor && closedOffers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between gap-3 bg-card rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage src={offer.author?.avatar_url ?? undefined} alt="" />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {getInitials(offer.author?.display_name ?? '?')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground truncate">
                    {offer.author?.display_name}
                  </span>
                </div>
                {(offer.author as Profile)?.email && (
                  <a
                    href={`mailto:${(offer.author as Profile).email}`}
                    className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded shrink-0"
                  >
                    {(offer.author as Profile).email}
                  </a>
                )}
              </div>
            ))}

            {/* Offerer sees post author's email when their offer is accepted */}
            {!isPostAuthor && currentUserOfferAccepted && (post.author as Profile)?.email && (
              <div className="flex items-center justify-between gap-3 bg-card rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage src={post.author?.avatar_url ?? undefined} alt="" />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {getInitials(authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground truncate">{authorName}</span>
                </div>
                <a
                  href={`mailto:${(post.author as Profile).email}`}
                  className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded shrink-0"
                >
                  {(post.author as Profile).email}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Public comment thread */}
      <section aria-label="Public discussion">
        <h2 className="text-base font-semibold text-foreground mb-4">
          {comments.length > 0
            ? `Discussion (${comments.length})`
            : 'Discussion'}
        </h2>

        {comments.length > 0 && (
          <div className="space-y-4 mb-4">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {currentUser && currentUserProfile && (
          <CommentForm
            postId={post.id}
            userId={currentUser.id}
            displayName={currentUserProfile.display_name}
            avatarUrl={currentUserProfile.avatar_url}
          />
        )}

        {comments.length === 0 && !currentUser && (
          <p className="text-sm text-muted-foreground">
            Sign in to join the discussion.
          </p>
        )}
      </section>
    </div>
  )
}
