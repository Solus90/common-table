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
    <main id="main-content" tabIndex={-1} className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Common Table logo"
              width={160}
              height={160}
              priority
              className="w-40 h-40 object-contain"
            />
          </div>

          {/* Hero copy */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
              Your neighbors are here.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
              A free mutual aid space to share what you have, ask for what you need,
              and help nearby neighbors.
            </p>
          </div>

          <p className="text-sm text-center text-muted-foreground mb-8">
            Give. Ask. Help.
          </p>

          {/* Sign in card */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-base font-semibold text-foreground mb-1">
              Join your neighborhood
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
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
          </div>

          {/* Footer note */}
          <p className="mt-5 text-center text-xs text-muted-foreground leading-relaxed">
            Posts are public in your neighborhood. No ads. No data selling.
          </p>

        </div>
      </div>
    </main>
  )
}
