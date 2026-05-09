import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/profile')
  }

  redirect(`/profile/${user.id}`)
}
