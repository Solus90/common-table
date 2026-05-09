'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { NeighborhoodSelector } from '@/components/shared/NeighborhoodSelector'
import type { Neighborhood } from '@/lib/supabase/types'

interface NeighborhoodFormProps {
  userId: string
  neighborhoods: Neighborhood[]
  next: string
}

export function NeighborhoodForm({ userId, neighborhoods, next }: NeighborhoodFormProps) {
  const router = useRouter()
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!selected) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ neighborhood_id: selected })
      .eq('id', userId)

    if (updateError) {
      setError('Could not save your neighborhood. Please try again.')
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  async function handleSkip() {
    router.push(next)
  }

  return (
    <div className="space-y-4">
      <NeighborhoodSelector
        neighborhoods={neighborhoods}
        value={selected}
        onChange={setSelected}
      />

      {error && (
        <div role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={!selected || loading}
        className="w-full h-11 rounded-xl font-medium"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" aria-hidden="true" />
            Saving…
          </span>
        ) : (
          'Get started'
        )}
      </Button>

      <button
        onClick={handleSkip}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded py-1"
      >
        Skip for now
      </button>
    </div>
  )
}
