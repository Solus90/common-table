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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="Common Table — We Share. We Care. We Belong."
            width={220}
            height={220}
            priority
            className="w-52 h-52 object-contain"
          />
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h1 className="text-base font-medium text-foreground mb-1">
            Sign in to your neighborhood
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            No account needed — sign in with Google to get started.
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

        <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
          Common Table is a mutual aid platform. All posts are public within your
          neighborhood. We do not sell your data.
        </p>
      </div>
    </div>
  )
}
