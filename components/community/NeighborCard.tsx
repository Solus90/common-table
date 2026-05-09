import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/lib/supabase/types'

interface NeighborCardProps {
  profile: Profile
  endorsementCount?: number
}

export function NeighborCard({ profile, endorsementCount = 0 }: NeighborCardProps) {
  return (
    <Link
      href={`/profile/${profile.id}`}
      className="block bg-card rounded-2xl border border-border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`View ${profile.display_name}'s profile`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-sm bg-primary/10 text-primary font-medium">
            {getInitials(profile.display_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {profile.display_name}
          </div>
          {profile.neighborhood && (
            <div className="text-xs text-muted-foreground truncate">
              {profile.neighborhood.name}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {profile.neighbors_helped_count > 0 && (
          <span className="font-medium text-foreground">
            Helped {profile.neighbors_helped_count} neighbor{profile.neighbors_helped_count !== 1 ? 's' : ''}
          </span>
        )}
        {endorsementCount > 0 && (
          <span>
            {endorsementCount} endorsement{endorsementCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Link>
  )
}
