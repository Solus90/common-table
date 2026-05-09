import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you were looking for could not be found on Common Table.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center"
    >
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Common Table logo"
            width={100}
            height={100}
            className="w-24 h-24 object-contain opacity-60"
          />
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          This page doesn&apos;t exist or may have been moved.
          The table is still set — head back to the feed.
        </p>

        <Link
          href="/feed"
          className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Go to feed
        </Link>
      </div>
    </main>
  )
}
