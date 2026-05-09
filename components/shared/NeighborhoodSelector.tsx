'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Neighborhood } from '@/lib/supabase/types'

interface NeighborhoodSelectorProps {
  neighborhoods: Neighborhood[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function NeighborhoodSelector({
  neighborhoods,
  value,
  onChange,
  disabled,
}: NeighborhoodSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className="w-full rounded-xl"
        aria-label="Select neighborhood"
      >
        <SelectValue placeholder="Select your neighborhood" />
      </SelectTrigger>
      <SelectContent>
        {neighborhoods.map((n) => (
          <SelectItem key={n.id} value={n.id}>
            {n.name}{n.city ? ` · ${n.city}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
