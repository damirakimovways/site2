-- 1. Add description column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS description text DEFAULT '';

-- 2. Seed social, contacts, and categories content sections
INSERT INTO site_content (section_id, data) VALUES
  ('social', '{"instagramUrl": "", "instagramLabel": "Instagram"}'::jsonb),
  ('contacts', '{"text": "Свяжитесь с нами для аренды техники.\\nТелефон: +7 705 852 57 80\\nEmail: info@waysrental.kz\\nАдрес: Алматы, Казахстан"}'::jsonb),
  ('categories', '{"items": [{"id": "cameras", "name": "Камеры"}, {"id": "lenses", "name": "Объективы"}, {"id": "light", "name": "Свет"}, {"id": "sound", "name": "Звук"}]}'::jsonb)
ON CONFLICT (section_id) DO NOTHING;
