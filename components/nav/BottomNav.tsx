'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/post/new', label: 'Post', icon: PlusCircle, isAction: true },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-warm-surface border-t border-border md:hidden"
      aria-label="Main navigation"
    >
      <div className="max-w-2xl mx-auto px-2">
        <ul className="flex items-center justify-around h-16" role="list">
          {navItems.map(({ href, label, icon: Icon, isAction }) => {
            const isActive = href === '/feed'
              ? pathname === '/feed' || pathname === '/'
              : pathname.startsWith(href)

            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isAction
                      ? 'text-primary'
                      : isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'transition-all',
                      isAction ? 'h-6 w-6' : 'h-5 w-5',
                      isAction && 'fill-primary/10'
                    )}
                    aria-hidden="true"
                    strokeWidth={isActive || isAction ? 2 : 1.5}
                  />
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
