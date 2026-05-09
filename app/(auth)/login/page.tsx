import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from './login-form'
import Image from 'next/image'

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
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Common Table"
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
              Common Table is a free space for Columbus neighbors to share
              what they have, ask for what they need, and show up for one another.
            </p>
          </div>

          {/* What you can do */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-card rounded-2xl border border-border p-4 text-center">
              <div className="text-xl mb-2">🤲</div>
              <div className="text-xs font-semibold text-foreground mb-1">Give</div>
              <div className="text-xs text-muted-foreground leading-snug">
                Share things you no longer need
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 text-center">
              <div className="text-xl mb-2">🙏</div>
              <div className="text-xs font-semibold text-foreground mb-1">Ask</div>
              <div className="text-xs text-muted-foreground leading-snug">
                Post a need — neighbors will respond
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 text-center">
              <div className="text-xl mb-2">💛</div>
              <div className="text-xs font-semibold text-foreground mb-1">Help</div>
              <div className="text-xs text-muted-foreground leading-snug">
                Offer your time, skills, or stuff
              </div>
            </div>
          </div>

          {/* Sign in card */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
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
            All posts are public within your neighborhood.
            We don't sell your data or run ads.
          </p>

        </div>
      </div>
    </div>
  )
}
