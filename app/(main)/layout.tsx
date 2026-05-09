import { TopBar } from '@/components/nav/TopBar'
import { BottomNav } from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar isSignedIn={!!user} />
      <main
        id="main-content"
        className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-24 md:pb-8"
        tabIndex={-1}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
