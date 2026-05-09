import Link from 'next/link'
import Image from 'next/image'
import { LogoutButton } from '@/components/shared/LogoutButton'

interface TopBarProps {
  isSignedIn?: boolean
}

export function TopBar({ isSignedIn }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-warm-surface/95 backdrop-blur supports-backdrop-filter:bg-warm-surface/85 border-b border-border" role="banner">
      <div className="max-w-2xl mx-auto px-4 h-15 flex items-center justify-between">
        <Link
          href="/feed"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          aria-label="Common Table — go to feed"
        >
          <div className="relative w-9 h-9 overflow-hidden rounded-full shrink-0">
            <Image
              src="/logo.png"
              alt=""
              fill
              sizes="36px"
              className="object-cover object-top scale-[1.65] translate-y-[5%]"
              priority
            />
          </div>
          <span className="text-lg font-semibold text-foreground leading-none">Common Table</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-xs text-muted-foreground font-medium">
            neighbor to neighbor
          </span>
          {isSignedIn && (
            <div className="hidden md:block">
              <LogoutButton variant="subtle" />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
