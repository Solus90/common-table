export type PostType = 'GIVE' | 'NEED'
export type PostStatus = 'open' | 'fulfilled' | 'closed'
export type OfferHelpType = 'item' | 'food' | 'transportation' | 'labor' | 'other'
export type OfferStatus = 'pending' | 'accepted' | 'fulfilled'

export interface Neighborhood {
  id: string
  name: string
  city: string
  state: string | null
  slug: string
  created_at: string
}

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  neighborhood_id: string | null
  neighbors_helped_count: number
  created_at: string
  updated_at: string
  neighborhood?: Neighborhood | null
}

export interface Post {
  id: string
  author_id: string
  neighborhood_id: string | null
  type: PostType
  title: string
  description: string
  image_url: string | null
  status: PostStatus
  created_at: string
  updated_at: string
  author?: Profile | null
  neighborhood?: Neighborhood | null
  offers?: Offer[]
}

export interface Offer {
  id: string
  post_id: string
  author_id: string
  content: string
  help_type: OfferHelpType
  status: OfferStatus
  created_at: string
  author?: Profile | null
}

export interface Endorsement {
  id: string
  endorser_id: string
  endorsed_id: string
  content: string
  created_at: string
  endorser?: Profile | null
}
