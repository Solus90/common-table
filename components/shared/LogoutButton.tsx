'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  className?: string
  variant?: 'default' | 'subtle'
}

export function LogoutButton({ className, variant = 'default' }: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      aria-label="Sign out"
      className={cn(
        'inline-flex items-center gap-2 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg',
        'disabled:opacity-50 disabled:pointer-events-none',
        variant === 'default'
          ? 'text-muted-foreground hover:text-destructive'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
