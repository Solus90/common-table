'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  postId: string
  userId: string
  displayName: string
  avatarUrl?: string | null
}

export function CommentForm({ postId, userId, displayName, avatarUrl }: CommentFormProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: userId,
      content: trimmed,
    })

    setLoading(false)

    if (insertError) {
      setError('Could not post reply. Please try again.')
      return
    }

    setContent('')
    router.refresh()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-3">
        <Avatar className="h-7 w-7 shrink-0 mt-1">
          <AvatarImage src={avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a public reply… (Enter to send)"
              maxLength={300}
              rows={1}
              disabled={loading}
              aria-label="Write a reply"
              className={cn(
                'w-full resize-none rounded-2xl rounded-tl-sm bg-muted px-3 py-2.5 text-sm',
                'placeholder:text-muted-foreground text-foreground leading-relaxed',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:opacity-50 transition-all',
                'min-h-[40px] max-h-32 overflow-y-auto'
              )}
              style={{ height: 'auto' }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${el.scrollHeight}px`
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-1.5 ml-1">
            <span className="text-xs text-muted-foreground">
              {content.length > 0 && `${content.length}/300`}
            </span>
            {content.trim() && (
              <button
                type="submit"
                disabled={loading}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Reply'}
              </button>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs text-destructive mt-1 ml-1">{error}</p>
          )}
        </div>
      </div>
    </form>
  )
}
