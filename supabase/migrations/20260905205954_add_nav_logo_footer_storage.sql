/*
# Add nav_items, logo, footer to site_content + storage bucket for images

1. Data Changes
- Seed site_content with sections: "nav" (editable nav links), "branding" (logo URL), "footer" (footer text + links)
- All stored as jsonb in existing site_content table (no schema changes needed)

2. Storage
- Create public storage bucket "uploads" for product images and logo
- Public read allowed, anon upload allowed (single-tenant app, no auth)
*/

INSERT INTO site_content (section_id, data) VALUES
  ('nav', '{"items": [{"id": "home", "label": "Главная"}, {"id": "catalog", "label": "Каталог техники"}]}'::jsonb),
  ('branding', '{"logoUrl": null}'::jsonb),
  ('footer', '{"copyright": "© 2026 Вейс Рентал. Все права защищены.", "links": [{"label": "Правила аренды"}, {"label": "Контакты"}]}'::jsonb)
ON CONFLICT (section_id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_upload_uploads" ON storage.objects;
CREATE POLICY "anon_upload_uploads" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "anon_read_uploads" ON storage.objects;
CREATE POLICY "anon_read_uploads" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "anon_delete_uploads" ON storage.objects;
CREATE POLICY "anon_delete_uploads" ON storage.objects FOR DELETE
  TO anon, authenticated USING (bucket_id = 'uploads');
