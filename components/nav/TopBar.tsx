import Link from 'next/link'
import Image from 'next/image'

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-warm-surface border-b border-border" role="banner">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/feed"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          aria-label="Common Table — go to feed"
        >
          {/* Logo mark: show only the circular icon portion of the square logo */}
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
          <span className="text-base font-semibold text-foreground tracking-tight">
            common table
          </span>
        </Link>

        <div className="text-xs text-muted-foreground font-medium">
          your neighborhood
        </div>
      </div>
    </header>
  )
}
