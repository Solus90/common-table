'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn, formatDistanceToNow, getInitials } from '@/lib/utils'
import type { Offer, OfferHelpType } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const HELP_TYPE_LABELS: Record<OfferHelpType, string> = {
  item: 'Item',
  food: 'Food',
  transportation: 'Transportation',
  labor: 'Help',
  other: 'Other',
}

interface OfferCardProps {
  offer: Offer
  isPostAuthor: boolean
  currentUserId?: string
}

export function OfferCard({ offer, isPostAuthor, currentUserId }: OfferCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const authorName = offer.author?.display_name ?? 'A neighbor'

  async function updateStatus(status: 'accepted' | 'fulfilled') {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('offers').update({ status }).eq('id', offer.id)
    setLoading(false)
    router.refresh()
  }

  return (
    <article
      className={cn(
        'rounded-xl border p-4 space-y-3',
        offer.status === 'fulfilled'
          ? 'border-give/30 bg-give/5'
          : offer.status === 'accepted'
            ? 'border-primary/30 bg-primary/5'
            : 'border-border bg-card'
      )}
      aria-label={`Offer from ${authorName}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarImage src={offer.author?.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
            {getInitials(authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-foreground">{authorName}</span>
            <span className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
              {HELP_TYPE_LABELS[offer.help_type]}
            </span>
            {offer.status !== 'pending' && (
              <span
                className={cn(
                  'text-xs font-medium rounded-full px-2 py-0.5',
                  offer.status === 'fulfilled'
                    ? 'bg-give/20 text-give'
                    : 'bg-primary/20 text-primary'
                )}
              >
                {offer.status === 'fulfilled' ? 'Fulfilled' : 'Accepted'}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{offer.content}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(offer.created_at)}</p>
        </div>
      </div>

      {isPostAuthor && offer.status === 'pending' && (
        <div className="flex gap-2 pl-11">
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg text-xs"
            onClick={() => updateStatus('accepted')}
            disabled={loading}
          >
            Accept offer
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-lg text-xs"
            onClick={() => updateStatus('fulfilled')}
            disabled={loading}
          >
            Mark fulfilled
          </Button>
        </div>
      )}

      {isPostAuthor && offer.status === 'accepted' && (
        <div className="pl-11">
          <Button
            size="sm"
            className="h-8 rounded-lg text-xs"
            onClick={() => updateStatus('fulfilled')}
            disabled={loading}
          >
            Mark fulfilled
          </Button>
        </div>
      )}
    </article>
  )
}
