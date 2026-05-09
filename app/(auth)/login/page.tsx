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
    <main id="main-content" tabIndex={-1} className="min-h-dvh overflow-x-hidden bg-background">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-4xl items-center overflow-x-hidden px-4 py-6 md:px-6 md:min-h-screen md:py-12">
        <div className="relative grid w-full min-w-0 gap-5 md:gap-9 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <section className="flex min-w-0 flex-col items-center text-center md:items-start md:text-left">
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
              className="mb-4 h-auto w-56 object-contain md:mb-6 md:w-104"
            />

            {/* Hero copy */}
            <h1 className="mb-2 max-w-xl text-2xl font-semibold text-foreground md:mb-4 md:text-5xl">
              Local support, right when it is needed.
            </h1>
            <p className="hidden max-w-lg text-base leading-relaxed text-foreground/80 md:block md:text-lg">
              Common Table is where neighbors share resources, ask for help, and respond
              with care. Professional enough to trust, human enough to feel like home.
            </p>

            <div className="mt-6 hidden flex-wrap gap-2.5 md:flex">
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
          <section className="min-w-0 rounded-2xl border border-transparent bg-transparent p-5 md:border-border md:bg-card md:p-7">
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
