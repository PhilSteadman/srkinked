# SRJ Inked – Website

React + Vite frontend hosted on Netlify, Supabase backend.

## Pages
- `/` Home — hero, gallery, pricing, events, CTA
- `/gallery` — filterable masonry grid with lightbox
- `/booking` — calendar slot picker + booking form
- `/pricing` — rate cards + FAQ
- `/events` — conventions and pop-ups
- `/blog` — journal posts
- `/blog/:slug` — post detail
- `/videos` — YouTube channel feed
- `/contact` — contact form + socials
- `/admin` — full management panel (auth required)

## Setup

### 1. Supabase
1. Create project at supabase.com
2. SQL Editor → run `supabase-setup.sql`
3. Authentication → Users → Invite User (your email)
4. Copy Project URL and anon key from Settings → API

### 2. Netlify
1. Push to GitHub, connect to Netlify
2. Build command: `npm run build` · Publish dir: `dist`
3. Environment variables:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
VITE_YOUTUBE_API_KEY=optional
VITE_YOUTUBE_CHANNEL_ID=optional
```

### 3. Local dev
```bash
npm install
cp .env.example .env   # add your Supabase keys
npm run dev
```

## Admin
Visit `/admin` → sign in with invited email → manage bookings, slots, gallery, events, posts.

## Adding booking slots
Admin → Availability → select date → Quick Add or custom label.

## Merch (future)
`products` table is ready. Add Stripe when needed.
