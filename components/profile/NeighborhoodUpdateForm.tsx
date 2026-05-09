'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { NeighborhoodSelector } from '@/components/shared/NeighborhoodSelector'
import type { Neighborhood } from '@/lib/supabase/types'
import { MapPin } from 'lucide-react'

interface NeighborhoodUpdateFormProps {
  userId: string
  currentNeighborhoodId: string | null
  neighborhoods: Neighborhood[]
}

export function NeighborhoodUpdateForm({
  userId,
  currentNeighborhoodId,
  neighborhoods,
}: NeighborhoodUpdateFormProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState(currentNeighborhoodId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentName = neighborhoods.find((n) => n.id === currentNeighborhoodId)?.name

  async function handleSave() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ neighborhood_id: selected || null })
      .eq('id', userId)

    if (updateError) {
      setError('Could not update neighborhood.')
      setLoading(false)
      return
    }

    setEditing(false)
    setLoading(false)
    router.refresh()
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{currentName ?? 'No neighborhood set'}</span>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {currentName ? 'Change' : 'Set neighborhood'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <NeighborhoodSelector
        neighborhoods={neighborhoods}
        value={selected}
        onChange={setSelected}
      />

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={loading}
          size="sm"
          className="rounded-lg h-8 text-xs"
        >
          {loading ? 'Saving…' : 'Save'}
        </Button>
        <Button
          onClick={() => { setEditing(false); setSelected(currentNeighborhoodId ?? '') }}
          variant="outline"
          size="sm"
          className="rounded-lg h-8 text-xs"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
