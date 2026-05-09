import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NeighborhoodForm } from './neighborhood-form'
import Image from 'next/image'
import type { Neighborhood } from '@/lib/supabase/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Neighborhood Setup',
  description: 'Choose your neighborhood on Common Table so local requests and offers appear first in your feed.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('neighborhood_id, display_name')
    .eq('id', user.id)
    .single()

  // Already has a neighborhood — skip onboarding
  if (profile?.neighborhood_id) redirect('/feed')

  const { data: neighborhoods } = await supabase
    .from('neighborhoods')
    .select('*')
    .order('name')

  const { next = '/feed' } = await searchParams
  const firstName = profile?.display_name?.split(' ')[0] ?? 'neighbor'

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12"
    >
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Common Table logo"
            width={120}
            height={120}
            priority
            className="w-28 h-28 object-contain"
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Welcome, {firstName}.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Where in Columbus do you call home? We&apos;ll show you posts from
            your neighborhood first.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <label className="block text-sm font-medium text-foreground mb-3">
            Your neighborhood
          </label>
          <NeighborhoodForm
            userId={user.id}
            neighborhoods={(neighborhoods ?? []) as Neighborhood[]}
            next={next}
          />
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          You can change this anytime from your profile.
        </p>
      </div>
    </main>
  )
}
