import { TopBar } from '@/components/nav/TopBar'
import { BottomNav } from '@/components/nav/BottomNav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
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
