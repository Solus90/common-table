import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from './login-form'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Sign in to Common Table to share resources, ask for help, and connect with neighbors in your local community.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/feed')
  }

  const { next, error } = await searchParams

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-primary/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 bottom-8 h-44 w-44 rounded-full bg-need/15 blur-2xl"
        />
        <div className="relative grid w-full gap-9 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <section>
            <p className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
              Columbus mutual aid
            </p>

            {/* Logo */}
            <Image
              src="/translogo.png"
              alt="Common Table logo"
              width={520}
              height={320}
              priority
              className="mb-6 h-auto w-72 object-contain md:w-104"
            />

            {/* Hero copy */}
            <h1 className="mb-4 max-w-xl text-4xl font-semibold text-foreground md:text-5xl">
              Local support, right when it is needed.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-foreground/80 md:text-lg">
              Common Table is where neighbors share resources, ask for help, and respond
              with care. Professional enough to trust, human enough to feel like home.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {['Give', 'Ask', 'Help'].map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-sm font-medium text-foreground/85"
                >
                  {word}
                </span>
              ))}
            </div>
          </section>

          {/* Sign in card */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-7">
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              Join your neighborhood
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              Free to use. No passwords. Sign in with your Google account to get started.
            </p>

            {error === 'auth' && (
              <div
                role="alert"
                className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                Something went wrong. Please try again.
              </div>
            )}

            <LoginForm next={next} />
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Posts are public in your neighborhood. No ads. No data selling.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
