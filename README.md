# Common Table

> *We share. We care. We belong.*

Common Table is a hyperlocal mutual aid platform where neighbors publicly share resources, post needs, and offer help. It is deliberately **not** a marketplace, gig economy app, or social network. It is a digital commons — a public neighborhood bulletin board where community care happens in the open.

---

## Table of Contents

- [Product Philosophy](#product-philosophy)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Supabase Setup](#supabase-setup)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Key Architectural Decisions](#key-architectural-decisions)
- [Design System](#design-system)
- [Feature Overview](#feature-overview)
- [Adding Features](#adding-features)
- [Deployment](#deployment)
- [Known Limitations & Next Steps](#known-limitations--next-steps)

---

## Product Philosophy

Before touching the code, read this. It shapes every decision.

**This app should feel like:** a community bulletin board, a church commons, a neighborhood café.

**This app should NOT feel like:** Twitter, Facebook Marketplace, TaskRabbit, Nextdoor.

### What that means in practice

| Do | Don't |
|---|---|
| Public posts visible to all neighbors | DMs or private messaging |
| Chronological feed | Algorithmic ranking |
| "Neighbors helped" trust count | Star ratings or scores |
| Public endorsements (text blurbs) | Anonymous reviews |
| Public offers of help | Hidden negotiations |
| GIVE / NEED post types only | Categories, tags, pricing |
| Mutual aid framing | Gig economy framing |

If you are adding a feature that creates virality, gamification, or transactional dynamics, reconsider.

---

## Tech Stack

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.2.6 | App Router, React Server Components |
| Language | TypeScript | 5.x | Strict mode |
| Styling | Tailwind CSS | 4.x | CSS-based config (no `tailwind.config.js`) |
| Components | shadcn/ui | 4.x (Radix+Nova) | Radix primitives, Geist font, Lucide icons |
| Backend | Supabase | 2.x | Postgres, Auth, Storage, (Realtime future) |
| Auth | Supabase OAuth | — | Google only. No passwords. |
| Package manager | bun | 1.3.x | Use `bun`, not npm/yarn |
| Icons | Lucide React | 1.x | Tree-shakeable SVG icons |

### Important: Next.js 16 differences from 15

Next.js 16 introduced a **breaking rename**:

- `middleware.ts` → `proxy.ts`
- The exported function must be named `proxy`, not `middleware`

Everything else (App Router, `cookies()`, `redirect()`, `params` as Promise) works identically to Next.js 15. If you're Googling Next.js docs and seeing `middleware.ts` examples, the code itself is still valid — just rename the file and function.

---

## Project Structure

```
common-table/
├── app/
│   ├── (auth)/                     # Unauthenticated pages (no TopBar/BottomNav)
│   │   └── login/
│   │       ├── page.tsx            # Login landing page
│   │       └── login-form.tsx      # "Continue with Google" client button
│   ├── (main)/                     # Authenticated shell (TopBar + BottomNav)
│   │   ├── layout.tsx              # Shell layout
│   │   ├── feed/
│   │   │   └── page.tsx            # Public community feed (server component)
│   │   ├── post/
│   │   │   ├── new/page.tsx        # Create post form (auth required)
│   │   │   └── [id]/page.tsx       # Post detail + offer list
│   │   ├── community/
│   │   │   └── page.tsx            # Neighbor grid
│   │   └── profile/
│   │       ├── page.tsx            # Redirects to /profile/[userId]
│   │       └── [id]/page.tsx       # Public profile page
│   ├── auth/
│   │   └── callback/route.ts       # Supabase OAuth code exchange
│   ├── manifest.ts                 # PWA manifest (typed)
│   ├── layout.tsx                  # Root layout (fonts, metadata, skip link)
│   ├── page.tsx                    # Redirects to /feed
│   └── globals.css                 # Design tokens + Tailwind v4 imports
│
├── components/
│   ├── ui/                         # shadcn/ui primitives (do not edit directly)
│   ├── feed/
│   │   ├── FeedList.tsx            # Post list + empty state
│   │   ├── PostCard.tsx            # Individual post card (links to detail)
│   │   └── PostTypeBadge.tsx       # GIVE (green) / NEED (terracotta) pill
│   ├── post/
│   │   ├── NewPostForm.tsx         # Controlled form: type toggle, title, desc, neighborhood
│   │   ├── OfferCard.tsx           # Single offer with author + status management
│   │   └── OfferHelpForm.tsx       # Bottom sheet: help type + message
│   ├── community/
│   │   └── NeighborCard.tsx        # Profile card for community grid
│   ├── profile/
│   │   ├── ProfileHeader.tsx       # Avatar, name, bio, trust stats
│   │   └── EndorseForm.tsx         # Bottom sheet for writing endorsements
│   ├── nav/
│   │   ├── TopBar.tsx              # Sticky header with logo + neighborhood label
│   │   └── BottomNav.tsx           # Mobile-only: Feed / Post / Community / Profile
│   └── shared/
│       └── NeighborhoodSelector.tsx # Reusable neighborhood <Select>
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient() for client components
│   │   ├── server.ts               # createServerClient() for server components
│   │   └── types.ts                # Hand-written TypeScript interfaces for all tables
│   └── utils.ts                    # cn(), formatDistanceToNow(), getInitials()
│
├── supabase/
│   └── migrations/
│       └── 001_initial.sql         # Full schema: tables, indexes, RLS, triggers, seed
│
├── public/
│   ├── logo.png                    # 1254×1254 brand logo (also used as favicon)
│   └── icons/
│       ├── icon-192.png            # PWA icon
│       └── icon-512.png            # PWA icon (maskable)
│
└── proxy.ts                        # Auth session refresh on every request (Next.js 16 middleware)
```

---

## Getting Started

### Prerequisites

- [bun](https://bun.sh) 1.3+
- [Supabase account](https://supabase.com) (free tier is fine for development)
- A Google Cloud project with OAuth 2.0 credentials

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` with your Supabase project values (see [Environment Variables](#environment-variables)).

### 3. Set up the database

In your Supabase project's SQL Editor, run the full migration:

```bash
# Copy the contents of this file and paste into the Supabase SQL Editor
supabase/migrations/001_initial.sql
```

This creates all tables, indexes, RLS policies, triggers, and seeds four starter neighborhoods (Portland, OR — swap these for your city).

### 4. Configure Google OAuth

See [Authentication](#authentication) for the full setup.

### 5. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/feed`.

---

## Supabase Setup

### Creating the project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon public key** from Settings → API
3. Run `supabase/migrations/001_initial.sql` in the SQL Editor

### Running the migration

The migration file (`supabase/migrations/001_initial.sql`) is a single self-contained file. Paste it into **SQL Editor → New Query → Run**.

It creates:

- `neighborhoods` — pre-seeded location labels
- `profiles` — extends `auth.users`, auto-created on signup via trigger
- `posts` — GIVE/NEED posts with status lifecycle
- `offers` — structured help offers linked to posts
- `endorsements` — public community endorsements with unique constraint (one per pair)

All tables have Row Level Security enabled. Public data is readable by anyone (including unauthenticated users). Writes require authentication and ownership checks.

### Supabase Storage (optional, for image uploads)

The MVP doesn't implement image uploads yet, but the `image_url` column on `posts` is ready. When you add it:

1. Create a bucket called `post-images` in Storage → Buckets
2. Set it to **Public** (so images can be displayed without auth)
3. Add an RLS policy allowing authenticated users to upload

---

## Authentication

The app uses **Supabase OAuth with Google only**. No passwords, no email/password flows.

### Google OAuth setup

**In Google Cloud Console:**
1. Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
2. Application type: **Web application**
3. Add Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. For local development, also add: `http://localhost:3000/auth/callback` (optional — see note below)
5. Copy the **Client ID** and **Client Secret**

**In Supabase Dashboard:**
1. Authentication → Providers → Google
2. Paste in Client ID and Client Secret
3. Save

**In Supabase Dashboard → Authentication → URL Configuration:**
- Site URL: `https://yourdomain.com`
- Redirect URLs: add `https://yourdomain.com/**` (and `http://localhost:3000/**` for dev)

> **Note on local OAuth:** Google OAuth redirects go through Supabase's servers first, so `localhost:3000` doesn't need to be an authorized redirect URI in Google — only the Supabase callback URL does. The app constructs `redirectTo` dynamically from `window.location.origin`.

### How auth flows through the app

```
User clicks "Continue with Google"
  → Supabase initiates OAuth with Google
  → Google authenticates user
  → Redirects to: https://<project>.supabase.co/auth/v1/callback
  → Supabase exchanges code, creates session
  → Redirects to: /auth/callback?code=...
  → app/auth/callback/route.ts exchanges code for session cookie
  → Redirects to /feed (or ?next= param)
```

On every request, `proxy.ts` calls `supabase.auth.getUser()` to refresh the session token and keep cookies current.

### Protected routes

Only two routes require authentication:
- `/post/new` — creating a post
- `/profile` — own profile (redirects to `/profile/[id]` after auth check)

All other routes (`/feed`, `/post/[id]`, `/community`, `/profile/[id]`) are **publicly accessible** without login. Unauthenticated users can browse freely but cannot post, offer help, or endorse.

---

## Database Schema

### Tables

#### `neighborhoods`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | e.g. "Northeast" |
| `city` | text | e.g. "Portland" |
| `state` | text | nullable |
| `slug` | text | unique, URL-safe |
| `created_at` | timestamptz | |

Managed by admins. Users select from a pre-seeded list. To add neighborhoods for your city, `INSERT` rows directly or add them to the migration seed section.

#### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, references `auth.users(id)` |
| `display_name` | text | Pulled from Google account on signup |
| `avatar_url` | text | nullable, Google profile photo URL |
| `bio` | text | nullable, user-editable |
| `neighborhood_id` | uuid | FK → neighborhoods |
| `neighbors_helped_count` | int | Default 0, increment on fulfilled offers |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated via trigger |

Created automatically via trigger when a new `auth.users` row is inserted (see `handle_new_user()` function in the migration).

#### `posts`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `author_id` | uuid | FK → profiles |
| `neighborhood_id` | uuid | FK → neighborhoods, nullable |
| `type` | text | `'GIVE'` or `'NEED'` |
| `title` | text | Max 120 chars (enforced client-side) |
| `description` | text | Max 1000 chars (enforced client-side) |
| `image_url` | text | nullable, Supabase Storage URL |
| `status` | text | `'open'`, `'fulfilled'`, `'closed'` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated via trigger |

#### `offers`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `post_id` | uuid | FK → posts |
| `author_id` | uuid | FK → profiles |
| `content` | text | The offer message, max 500 chars |
| `help_type` | text | `'item'`, `'food'`, `'transportation'`, `'labor'`, `'other'` |
| `status` | text | `'pending'`, `'accepted'`, `'fulfilled'` |
| `created_at` | timestamptz | |

#### `endorsements`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `endorser_id` | uuid | FK → profiles (the writer) |
| `endorsed_id` | uuid | FK → profiles (the subject) |
| `content` | text | Public blurb, max 200 chars |
| `created_at` | timestamptz | |

Has a `UNIQUE(endorser_id, endorsed_id)` constraint — one endorsement per pair. Self-endorsement is blocked by `CHECK (endorser_id != endorsed_id)`.

### RLS summary

| Table | Public read | Auth insert | Update | Delete |
|---|---|---|---|---|
| `neighborhoods` | ✓ | ✗ | ✗ | ✗ |
| `profiles` | ✓ | self only | self only | — |
| `posts` | ✓ | auth (own) | author only | author only |
| `offers` | ✓ | auth (own) | offer author OR post author | offer author |
| `endorsements` | ✓ | auth (no self) | — | endorser only |

---

## Environment Variables

```env
# .env.local

# Required — from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key-here
```

Both are prefixed `NEXT_PUBLIC_` because they're used in client-side code (browser Supabase client). The publishable key (`sb_publishable_...`) is safe to expose publicly — it's scoped to the RLS policies defined in the database. Never put your `service_role` key in the app.

**Never commit `.env.local`.** It's in `.gitignore`. The `.env.local.example` file shows the shape without real values.

---

## Key Architectural Decisions

### Server Components by default

All pages are React Server Components unless they need interactivity (forms, state, event handlers). Client components are marked with `'use client'` and kept small — forms, the BottomNav (needs `usePathname`), and action buttons.

This means data fetching happens on the server, close to the database, with no loading spinners for initial page renders.

### Two Supabase clients

`lib/supabase/client.ts` — for client components. Uses `createBrowserClient`. One instance per component tree (singleton pattern via function call).

`lib/supabase/server.ts` — for server components and route handlers. Uses `createServerClient` with async `cookies()` from `next/headers`. Must be `await`ed before use.

```typescript
// Server component (async)
const supabase = await createClient()
const { data } = await supabase.from('posts').select('*')

// Client component
const supabase = createClient()  // not async
await supabase.auth.signInWithOAuth(...)
```

### Route groups for layout isolation

- `(auth)` — login page with no nav chrome
- `(main)` — all app pages with TopBar and BottomNav

The parentheses mean the folder name isn't part of the URL.

### No optimistic updates (yet)

Form submissions do a real database write then call `router.refresh()` to re-fetch server data. This is simple and correct, at the cost of a brief re-render flash. For a community app where speed isn't the primary UX concern, this tradeoff is intentional.

---

## Design System

### Color palette

All colors are CSS custom properties using the OKLCH color space (Tailwind v4 native). Defined in `app/globals.css`.

| Token | OKLCH | Hex approx | Usage |
|---|---|---|---|
| `--background` | `oklch(0.977 0.007 80)` | `#FAF8F5` | Page background |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | Card surfaces |
| `--foreground` | `oklch(0.162 0.005 80)` | `#1C1917` | Body text |
| `--muted-foreground` | `oklch(0.513 0.01 78)` | `#78716C` | Secondary text |
| `--border` | `oklch(0.906 0.008 80)` | `#E7E2DC` | Borders, dividers |
| `--primary` | `oklch(0.42 0.075 152)` | `#3D6B4F` | Sage green — buttons, focus rings |
| `--give` | `oklch(0.489 0.087 152)` | `#4A7C59` | GIVE badge background |
| `--need` | `oklch(0.62 0.127 52)` | `#C4763B` | NEED badge background |

### Usage in components

```tsx
// Use semantic tokens, not raw colors
className="bg-primary text-primary-foreground"
className="text-give"          // GIVE badge text
className="bg-need/10"         // NEED badge subtle background
className="border-border"      // Standard divider
```

### Typography

- Font: Geist Sans (loaded via `next/font/google`)
- Base size: 16px minimum — never go below `text-sm`
- Headings: `font-semibold`, no decorative fonts
- Labels / caps: `text-xs font-medium uppercase tracking-wide` for badges only

### Spacing and shape

- Cards: `rounded-2xl` with `shadow-sm border border-border`
- Buttons: `rounded-xl` (primary), `rounded-full` (icon-only)
- Badges: `rounded-full`
- Generous padding: `p-4` on mobile, `p-5`/`p-6` on detail views

### Accessibility

- Every page has a skip-to-main link (in root layout) — test it with keyboard Tab
- All interactive elements have `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Icons are always paired with `aria-hidden="true"` and a visible or `sr-only` text label
- GIVE/NEED badges use both color and text (never color alone)
- Reduced motion is respected: `@media (prefers-reduced-motion: reduce)` disables all transitions in `globals.css`

---

## Feature Overview

### Feed (`/feed`)

Server component. Fetches the 50 most recent posts with author and neighborhood joins. Renders in `<Suspense>` with a skeleton fallback.

To change the feed scope (e.g. filter by neighborhood), add a `.eq('neighborhood_id', id)` filter to the query in `app/(main)/feed/page.tsx`.

### Creating a post (`/post/new`)

Auth-gated. Client component form in `components/post/NewPostForm.tsx`.

Type toggle (GIVE/NEED) uses `aria-pressed` buttons — accessible and no library dependency. Character counts update live with `aria-live="polite"`.

Submits directly to Supabase from the client, then navigates to the new post's detail page.

### Post detail (`/post/[id]`)

Server component. Fetches post + offers in parallel with `Promise.all`. Shows:
- Post content
- "Offer Help" sheet (auth required, not shown to post author)
- "Sign in to help" CTA (unauthenticated users)
- All existing offers with status management for post author

### Offer Help flow

Bottom sheet (`Sheet` from shadcn/ui) with:
- Help type selector (Item / Food / Ride / Help / Other) — `aria-pressed` pill buttons
- Message textarea with 500-char limit
- Submits to `offers` table

Post author can then Accept or Mark Fulfilled each offer via `OfferCard.tsx`.

### Community (`/community`)

Profiles sorted by `neighbors_helped_count` descending. Simple grid, links to individual profiles.

### Profiles (`/profile/[id]`)

Shows: avatar, name, neighborhood, bio, trust stats, endorsements (as `<blockquote>` elements), and recent posts.

"Endorse" button appears only if: user is authenticated, viewing someone else's profile, and hasn't already endorsed them (checked against the loaded endorsements list).

---

## Adding Features

### Adding a new page

1. Create the file under `app/(main)/your-route/page.tsx`
2. It automatically gets the TopBar + BottomNav from `app/(main)/layout.tsx`
3. If it needs auth: add an `await supabase.auth.getUser()` check at the top and `redirect('/login?next=...')` if no user

### Adding a new table

1. Write the SQL in `supabase/migrations/` (new file: `002_your_feature.sql`)
2. Run it in the Supabase SQL Editor
3. Add TypeScript types in `lib/supabase/types.ts`
4. Create RLS policies following the same pattern: public read, authenticated insert with ownership check, owner-only update/delete

### Adding a new shadcn component

```bash
bunx shadcn@latest add <component-name>
```

This installs to `components/ui/`. Import and use directly. Don't edit files in `components/ui/` — they can be re-generated.

### Updating the neighborhood list

The seed in `001_initial.sql` adds Portland neighborhoods. To change them:

```sql
-- Delete the Portland seed
DELETE FROM neighborhoods WHERE city = 'Portland';

-- Add your own
INSERT INTO neighborhoods (name, city, state, slug) VALUES
  ('East Side', 'Austin', 'TX', 'austin-east-side'),
  ('South Congress', 'Austin', 'TX', 'austin-south-congress');
```

### Enabling Supabase Realtime on the feed

To make the feed update live without refresh:

1. In Supabase Dashboard → Database → Replication → enable `posts` table
2. In the feed page, convert to a client component and subscribe:

```typescript
supabase
  .channel('posts')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, 
    (payload) => setPosts(prev => [payload.new, ...prev]))
  .subscribe()
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo in [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

After deploy, update Supabase → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

And update Google Cloud Console → Authorized redirect URIs with the Supabase callback URL (this is already set from initial setup and doesn't change with your Vercel URL).

### Other hosts

Any Node.js host that supports Next.js App Router will work (Railway, Render, Fly.io, etc.). The app has no server-side dependencies beyond Next.js and Supabase — no Redis, no background workers.

---

## Known Limitations & Next Steps

### Not yet implemented (MVP scope)

- **Image uploads** — `posts.image_url` column exists and is displayed if populated, but the UI upload flow isn't built. Needs Supabase Storage bucket + client-side resize before upload.
- **Profile editing** — users can't edit their bio or neighborhood yet. Add a form that calls `supabase.from('profiles').update(...)`.
- **`neighbors_helped_count` increment** — the counter column exists but isn't incremented automatically when an offer is marked fulfilled. Add a Postgres trigger or call `.rpc()` in `OfferCard.tsx` when status changes to `'fulfilled'`.
- **PWA offline support** — the manifest is wired up, but no service worker exists. Use `next-pwa` or a hand-rolled service worker for full offline capability.
- **Post deletion** — the RLS policy allows it (author can delete), but there's no delete button in the UI yet.
- **Pagination** — the feed loads 50 posts. For a real deployment, add cursor-based pagination using Supabase's `.range()` or `.lt('created_at', cursor)`.
- **Apple Sign In** — the structure is in place (Supabase supports it), but the UI only shows Google. To add Apple: wire up `supabase.auth.signInWithOAuth({ provider: 'apple' })` and configure credentials in Supabase Dashboard.

### Scale considerations

- **Geolocation** — current location model uses neighborhood labels selected by the user. For true proximity filtering, add PostGIS to Supabase and store `lat/lng` on neighborhoods or posts.
- **Moderation** — no flagging or admin tools exist. Add a `flagged` boolean to posts and an admin role to profiles.
- **Notifications** — no push notifications. Supabase Edge Functions can send web push or email when someone offers to help your post.
- **Multiple cities** — the app currently shows all posts globally (or can be filtered by neighborhood). For a true multi-city deployment, add a city-level filter layer.

---

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0-only).
See `LICENSE` for the full text.
