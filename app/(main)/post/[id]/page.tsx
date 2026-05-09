import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PostTypeBadge } from '@/components/feed/PostTypeBadge'
import { OfferCard } from '@/components/post/OfferCard'
import { OfferHelpForm } from '@/components/post/OfferHelpForm'
import { ArrowLeft } from 'lucide-react'
import { formatDistanceToNow, getInitials } from '@/lib/utils'
import type { Post, Offer } from '@/lib/supabase/types'

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

  const [postResult, offersResult, authResult] = await Promise.all([
    supabase
      .from('posts')
      .select(`*, author:profiles(id, display_name, avatar_url), neighborhood:neighborhoods(id, name)`)
      .eq('id', id)
      .single(),
    supabase
      .from('offers')
      .select(`*, author:profiles(id, display_name, avatar_url)`)
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
    supabase.auth.getUser(),
  ])

  if (postResult.error || !postResult.data) {
    notFound()
  }

  const post = postResult.data as unknown as Post
  const offers = (offersResult.data ?? []) as unknown as Offer[]
  const currentUser = authResult.data.user
  const isPostAuthor = currentUser?.id === post.author_id

  const authorName = post.author?.display_name ?? 'A neighbor'

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
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <PostTypeBadge type={post.type} />
          {post.status !== 'open' && (
            <span className="text-sm text-muted-foreground font-medium capitalize">
              {post.status}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-foreground leading-snug">
          {post.title}
        </h1>

        {/* Description */}
        <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {post.description}
        </p>

        {/* Image */}
        {post.image_url && (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted">
            <Image
              src={post.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
        )}

        {/* Author + meta */}
        <div className="flex items-center gap-3 pt-1 border-t border-border">
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
        </div>
      </article>

      {/* Offer help — authenticated users only, not the post author */}
      {currentUser && !isPostAuthor && post.status === 'open' && (
        <OfferHelpForm
          postId={post.id}
          userId={currentUser.id}
          postTitle={post.title}
        />
      )}

      {!currentUser && post.status === 'open' && (
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to offer your help to this neighbor.
          </p>
          <Link
            href={`/login?next=/post/${post.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign in to help
          </Link>
        </div>
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
    </div>
  )
}
