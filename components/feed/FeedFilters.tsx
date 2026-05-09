'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'GIVE', label: 'Giving' },
  { value: 'NEED', label: 'Need' },
] as const

export function FeedFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const q = searchParams.get('q') ?? ''
  const type = searchParams.get('type') ?? ''

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, val]) => {
        if (val) {
          params.set(key, val)
        } else {
          params.delete(key)
        }
      })
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const value = (form.elements.namedItem('q') as HTMLInputElement).value.trim()
    updateParams({ q: value })
  }

  function clearSearch() {
    updateParams({ q: '' })
    const input = document.getElementById('feed-search') as HTMLInputElement
    if (input) input.value = ''
  }

  return (
    <div className={cn('space-y-3 mb-5', isPending && 'opacity-60 pointer-events-none')}>
      {/* Search */}
      <form onSubmit={handleSearch} role="search">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="feed-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search posts…"
            autoComplete="off"
            className={cn(
              'w-full h-10 pl-9 pr-9 rounded-xl border border-border bg-card text-sm',
              'placeholder:text-muted-foreground text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'transition-colors'
            )}
            aria-label="Search posts"
          />
          {q && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {/* Type filter */}
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label="Filter by post type"
      >
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateParams({ type: option.value })}
            aria-pressed={type === option.value}
            className={cn(
              'h-8 px-4 rounded-full text-sm font-medium border transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              type === option.value
                ? option.value === 'GIVE'
                  ? 'bg-give border-give text-give-foreground'
                  : option.value === 'NEED'
                    ? 'bg-need border-need text-need-foreground'
                    : 'bg-foreground border-foreground text-background'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
