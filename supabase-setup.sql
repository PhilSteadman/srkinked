-- ============================================================
-- SRJ INKED – SUPABASE SETUP SCRIPT
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- TABLES
create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  title text, style text, description text,
  image_url text not null,
  created_at timestamptz default now()
);

create table if not exists booking_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  label text not null,
  session_type text,
  price_hint text,
  is_available boolean default true,
  created_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid references booking_slots(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  tattoo_style text,
  description text,
  reference_info text,
  status text default 'pending' check (status in ('pending','confirmed','cancelled')),
  notes text,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  location text, description text, booking_link text,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text,
  cover_image_url text,
  tags text[] default '{}',
  published boolean default false,
  created_at timestamptz default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text, email text, subject text, message text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text,
  price_pence integer, image_url text,
  stripe_price_id text,
  active boolean default false,
  created_at timestamptz default now()
);

-- STORAGE BUCKET (run separately if this errors)
insert into storage.buckets (id, name, public)
values ('tattoos', 'tattoos', true)
on conflict (id) do nothing;

-- STORAGE POLICIES
create policy "Public read tattoos" on storage.objects
  for select using (bucket_id = 'tattoos');
create policy "Auth upload tattoos" on storage.objects
  for insert with check (bucket_id = 'tattoos' and auth.role() = 'authenticated');
create policy "Auth delete tattoos" on storage.objects
  for delete using (bucket_id = 'tattoos' and auth.role() = 'authenticated');

-- ENABLE RLS
alter table gallery enable row level security;
alter table booking_slots enable row level security;
alter table bookings enable row level security;
alter table events enable row level security;
alter table posts enable row level security;
alter table contact_messages enable row level security;
alter table products enable row level security;

-- RLS POLICIES
create policy "gallery_public_read" on gallery for select using (true);
create policy "gallery_auth_write" on gallery for all using (auth.role() = 'authenticated');

create policy "slots_public_read" on booking_slots for select using (is_available = true);
create policy "slots_auth_all" on booking_slots for all using (auth.role() = 'authenticated');

create policy "bookings_public_insert" on bookings for insert with check (true);
create policy "bookings_auth_all" on bookings for all using (auth.role() = 'authenticated');

create policy "events_public_read" on events for select using (true);
create policy "events_auth_all" on events for all using (auth.role() = 'authenticated');

create policy "posts_public_read" on posts for select using (published = true);
create policy "posts_auth_all" on posts for all using (auth.role() = 'authenticated');

create policy "contact_public_insert" on contact_messages for insert with check (true);
create policy "contact_auth_read" on contact_messages for select using (auth.role() = 'authenticated');

create policy "products_public_read" on products for select using (active = true);
create policy "products_auth_all" on products for all using (auth.role() = 'authenticated');

-- ADMIN USER
-- After running this script go to:
-- Supabase Dashboard > Authentication > Users > Invite User
-- Enter your email to create the admin account.
-- Sign in at srj-inked.netlify.app/admin
