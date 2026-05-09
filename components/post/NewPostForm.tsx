'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { NeighborhoodSelector } from '@/components/shared/NeighborhoodSelector'
import { createClient } from '@/lib/supabase/client'
import type { Neighborhood, PostType } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface NewPostFormProps {
  neighborhoods: Neighborhood[]
  userId: string
  defaultNeighborhoodId?: string | null
}

export function NewPostForm({ neighborhoods, userId, defaultNeighborhoodId }: NewPostFormProps) {
  const router = useRouter()
  const [type, setType] = useState<PostType>('GIVE')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [neighborhoodId, setNeighborhoodId] = useState(defaultNeighborhoodId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        neighborhood_id: neighborhoodId || null,
        type,
        title: title.trim(),
        description: description.trim(),
      })
      .select('id')
      .single()

    setLoading(false)

    if (insertError) {
      setError('Could not create post. Please try again.')
      return
    }

    router.push(`/post/${data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Post type toggle */}
      <fieldset>
        <legend className="text-sm font-medium text-foreground mb-2">
          Post type <span aria-hidden="true" className="text-muted-foreground font-normal">— what are you doing?</span>
        </legend>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Post type">
          {(['GIVE', 'NEED'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={cn(
                'h-12 rounded-xl border-2 text-sm font-semibold transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                type === t
                  ? t === 'GIVE'
                    ? 'border-give bg-give text-give-foreground'
                    : 'border-need bg-need text-need-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
              )}
            >
              {t === 'GIVE' ? '🤲 Giving' : '🙏 Need'}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Title <span className="text-muted-foreground font-normal text-xs">(what are you giving or needing?)</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === 'GIVE' ? 'e.g. Winter coats, kids sizes 6-10' : 'e.g. Help moving furniture this Saturday'}
          maxLength={120}
          required
          className="rounded-xl"
          aria-required="true"
        />
        <div className="text-xs text-muted-foreground text-right" aria-hidden="true">
          {title.length}/120
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Share any helpful details — condition, availability, how to coordinate…"
          rows={4}
          maxLength={1000}
          required
          className="rounded-xl resize-none"
          aria-required="true"
        />
        <div className="text-xs text-muted-foreground text-right" aria-hidden="true">
          {description.length}/1000
        </div>
      </div>

      {/* Neighborhood */}
      {neighborhoods.length > 0 && (
        <div className="space-y-1.5">
          <Label>
            Neighborhood <span className="text-muted-foreground font-normal text-xs">(optional)</span>
          </Label>
          <NeighborhoodSelector
            neighborhoods={neighborhoods}
            value={neighborhoodId}
            onChange={setNeighborhoodId}
          />
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !title.trim() || !description.trim()}
        className="w-full h-11 rounded-xl font-medium"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" aria-hidden="true" />
            Posting…
          </span>
        ) : (
          `Share to your neighborhood`
        )}
      </Button>
    </form>
  )
}
