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
import { Star } from 'lucide-react'

interface EndorseFormProps {
  endorsedId: string
  endorsedName: string
  currentUserId: string
}

export function EndorseForm({ endorsedId, endorsedName, currentUserId }: EndorseFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('endorsements').insert({
      endorser_id: currentUserId,
      endorsed_id: endorsedId,
      content: content.trim(),
    })

    setLoading(false)

    if (insertError?.code === '23505') {
      setError('You have already endorsed this neighbor.')
      return
    }

    if (insertError) {
      setError('Could not submit your endorsement. Please try again.')
      return
    }

    setContent('')
    setOpen(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-xl gap-2">
          <Star className="h-4 w-4" aria-hidden="true" />
          Endorse {endorsedName.split(' ')[0]}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-6">
        <SheetHeader className="text-left mb-5">
          <SheetTitle className="text-base">Endorse {endorsedName}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
            Share a public note about how this neighbor has shown up for the community.
            Endorsements are visible on their profile.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="endorsement-content"
              className="text-sm font-medium text-foreground"
            >
              Your endorsement
            </label>
            <Textarea
              id="endorsement-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What makes ${endorsedName.split(' ')[0]} a great neighbor?`}
              rows={3}
              maxLength={200}
              required
              className="rounded-xl resize-none"
              aria-required="true"
            />
            <div className="text-xs text-muted-foreground text-right" aria-live="polite">
              {content.length}/200
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full h-11 rounded-xl font-medium"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" aria-hidden="true" />
                Submitting…
              </span>
            ) : (
              'Submit endorsement'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
