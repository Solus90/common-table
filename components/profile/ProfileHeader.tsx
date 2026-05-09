import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/lib/supabase/types'

interface ProfileHeaderProps {
  profile: Profile
  endorsementCount: number
  postCount: number
}

export function ProfileHeader({ profile, endorsementCount, postCount }: ProfileHeaderProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 shrink-0">
          <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
            {getInitials(profile.display_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {profile.display_name}
          </h1>
          {profile.neighborhood && (
            <p className="text-sm text-muted-foreground">
              {(profile.neighborhood as { name: string }).name}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Trust stats */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        {profile.neighbors_helped_count > 0 && (
          <div className="text-sm">
            <span className="font-semibold text-foreground">{profile.neighbors_helped_count}</span>
            <span className="text-muted-foreground ml-1">
              neighbor{profile.neighbors_helped_count !== 1 ? 's' : ''} helped
            </span>
          </div>
        )}
        {endorsementCount > 0 && (
          <div className="text-sm">
            <span className="font-semibold text-foreground">{endorsementCount}</span>
            <span className="text-muted-foreground ml-1">
              endorsement{endorsementCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {postCount > 0 && (
          <div className="text-sm">
            <span className="font-semibold text-foreground">{postCount}</span>
            <span className="text-muted-foreground ml-1">
              post{postCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
