/*
# Create products and site_content tables (single-tenant, no auth)

1. New Tables
- `products`
  - `id` (uuid, primary key)
  - `name` (text, not null) — equipment name
  - `category` (text, not null) — one of: cameras, lenses, light, sound
  - `price` (integer, not null) — rental price per 24h shift in tenge
  - `image` (text) — URL to product photo
  - `is_new` (boolean, default false) — show "New" badge
  - `created_at` (timestamptz, default now())
- `site_content`
  - `section_id` (text, primary key) — e.g. "hero"
  - `data` (jsonb, not null) — section content as JSON
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD because this is a single-tenant public catalog (no sign-in screen).
- `USING (true)` / `WITH CHECK (true)` is acceptable here because the catalog is intentionally public/shared.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  image text,
  is_new boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS site_content (
  section_id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_content" ON site_content;
CREATE POLICY "anon_select_content" ON site_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_content" ON site_content;
CREATE POLICY "anon_insert_content" ON site_content FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_content" ON site_content;
CREATE POLICY "anon_update_content" ON site_content FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_content" ON site_content;
CREATE POLICY "anon_delete_content" ON site_content FOR DELETE
  TO anon, authenticated USING (true);
