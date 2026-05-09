'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import type { OfferHelpType } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'
import { HandHeart } from 'lucide-react'

const HELP_TYPES: { value: OfferHelpType; label: string; emoji: string }[] = [
  { value: 'item', label: 'Item', emoji: '📦' },
  { value: 'food', label: 'Food', emoji: '🥘' },
  { value: 'transportation', label: 'Ride', emoji: '🚗' },
  { value: 'labor', label: 'Help', emoji: '🤝' },
  { value: 'other', label: 'Other', emoji: '💛' },
]

interface OfferHelpFormProps {
  postId: string
  userId: string
  postTitle: string
}

export function OfferHelpForm({ postId, userId, postTitle }: OfferHelpFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [helpType, setHelpType] = useState<OfferHelpType>('item')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('offers').insert({
      post_id: postId,
      author_id: userId,
      content: message.trim(),
      help_type: helpType,
    })

    setLoading(false)

    if (insertError) {
      setError('Could not submit your offer. Please try again.')
      return
    }

    setMessage('')
    setOpen(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="w-full h-11 rounded-xl font-medium gap-2"
          size="lg"
        >
          <HandHeart className="h-5 w-5" aria-hidden="true" />
          Offer to Help
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-6">
        <SheetHeader className="text-left mb-5">
          <SheetTitle className="text-base">Offer your help</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
            Responding to: <span className="font-medium text-foreground">"{postTitle}"</span>
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Help type */}
          <fieldset>
            <legend className="text-sm font-medium text-foreground mb-2">
              What are you offering?
            </legend>
            <div className="flex flex-wrap gap-2" role="group">
              {HELP_TYPES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setHelpType(value)}
                  aria-pressed={helpType === value}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border-2 transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    helpType === value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                  )}
                >
                  <span aria-hidden="true">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Message */}
          <div className="space-y-1.5">
            <label
              htmlFor="offer-message"
              className="text-sm font-medium text-foreground"
            >
              Your message
            </label>
            <Textarea
              id="offer-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell them what you have or how you can help…"
              rows={3}
              maxLength={500}
              required
              className="rounded-xl resize-none"
              aria-required="true"
            />
            <div className="text-xs text-muted-foreground text-right" aria-live="polite">
              {message.length}/500
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full h-11 rounded-xl font-medium"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" aria-hidden="true" />
                Sending…
              </span>
            ) : (
              'Send your offer'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
