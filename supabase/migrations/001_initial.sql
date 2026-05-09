-- =============================================
-- Common Table — Initial Schema
-- =============================================

-- Neighborhoods
CREATE TABLE neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  state text,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  neighborhood_id uuid REFERENCES neighborhoods(id),
  neighbors_helped_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  neighborhood_id uuid REFERENCES neighborhoods(id),
  type text NOT NULL CHECK (type IN ('GIVE', 'NEED')),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Offers / replies
CREATE TABLE offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  help_type text NOT NULL CHECK (help_type IN ('item', 'food', 'transportation', 'labor', 'other')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'fulfilled')),
  created_at timestamptz DEFAULT now()
);

-- Endorsements
CREATE TABLE endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endorser_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endorsed_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_endorsement CHECK (endorser_id != endorsed_id),
  UNIQUE(endorser_id, endorsed_id)
);

-- =============================================
-- Indexes (critical for RLS policy performance)
-- =============================================
CREATE INDEX posts_author_id_idx ON posts(author_id);
CREATE INDEX posts_neighborhood_id_idx ON posts(neighborhood_id);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX offers_post_id_idx ON offers(post_id);
CREATE INDEX offers_author_id_idx ON offers(author_id);
CREATE INDEX endorsements_endorsed_id_idx ON endorsements(endorsed_id);
CREATE INDEX endorsements_endorser_id_idx ON endorsements(endorser_id);

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;

-- Neighborhoods: public read only (admin-managed)
CREATE POLICY "public_read" ON neighborhoods FOR SELECT USING (true);

-- Profiles: public read, self insert/update
CREATE POLICY "public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "self_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "self_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: public read, auth insert, author update/delete
CREATE POLICY "public_read" ON posts FOR SELECT USING (true);
CREATE POLICY "auth_insert" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "author_update" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "author_delete" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Offers: public read, auth insert, offer-author or post-author can update
CREATE POLICY "public_read" ON offers FOR SELECT USING (true);
CREATE POLICY "auth_insert" ON offers FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "offer_or_post_author_update" ON offers FOR UPDATE USING (
  auth.uid() = author_id OR
  auth.uid() = (SELECT author_id FROM posts WHERE id = post_id)
);
CREATE POLICY "offer_author_delete" ON offers FOR DELETE USING (auth.uid() = author_id);

-- Endorsements: public read, auth insert (no self), endorser delete
CREATE POLICY "public_read" ON endorsements FOR SELECT USING (true);
CREATE POLICY "auth_insert" ON endorsements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = endorser_id AND auth.uid() != endorsed_id);
CREATE POLICY "endorser_delete" ON endorsements FOR DELETE USING (auth.uid() = endorser_id);

-- =============================================
-- Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Neighbor'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Updated_at trigger for posts and profiles
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- Seed: starter neighborhoods
-- =============================================
INSERT INTO neighborhoods (name, city, state, slug) VALUES
  ('Downtown', 'Portland', 'OR', 'portland-downtown'),
  ('Northeast', 'Portland', 'OR', 'portland-northeast'),
  ('Southeast', 'Portland', 'OR', 'portland-southeast'),
  ('North', 'Portland', 'OR', 'portland-north');
