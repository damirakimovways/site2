import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string | null;
  is_new: boolean;
  description: string;
  created_at: string;
};

export type HeroContent = {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
};

export type NavItem = { id: string; label: string };
export type NavContent = { items: NavItem[] };
export type BrandingContent = { logoUrl: string | null };
export type FooterLink = { label: string };
export type FooterContent = {
  copyright: string;
  links: FooterLink[];
};
export type SocialContent = {
  instagramUrl: string;
  instagramLabel: string;
};
export type ContactsContent = {
  text: string;
};
export type CategoryItem = { id: string; name: string };
export type CategoriesContent = { items: CategoryItem[] };

export const DEFAULT_HERO: HeroContent = {
  badge: 'Новинка в рентале',
  title: 'Amaran Ray',
  subtitle: '120C',
  description:
    'Мощный полноцветный точечный источник света. Идеально для создания атмосферы на съёмочной площадке.',
  buttonText: 'Арендовать сейчас',
};

export const DEFAULT_NAV: NavContent = {
  items: [
    { id: 'home', label: 'Главная' },
    { id: 'catalog', label: 'Каталог техники' },
    { id: 'contacts', label: 'Контакты' },
  ],
};

export const DEFAULT_BRANDING: BrandingContent = { logoUrl: null };

export const DEFAULT_FOOTER: FooterContent = {
  copyright: '© 2026 Вейс Рентал. Все права защищены.',
  links: [{ label: 'Правила аренды' }, { label: 'Контакты' }],
};

export const DEFAULT_SOCIAL: SocialContent = {
  instagramUrl: '',
  instagramLabel: 'Instagram',
};

export const DEFAULT_CONTACTS: ContactsContent = {
  text: 'Свяжитесь с нами для аренды техники.\nТелефон: +7 705 852 57 80\nEmail: info@waysrental.kz\nАдрес: Алматы, Казахстан',
};

export const DEFAULT_CATEGORIES: CategoriesContent = {
  items: [
    { id: 'cameras', name: 'Камеры' },
    { id: 'lenses', name: 'Объективы' },
    { id: 'light', name: 'Свет' },
    { id: 'sound', name: 'Звук' },
  ],
};

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('uploads').upload(fileName, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
  return data.publicUrl;
}

export async function saveContentSection<T>(sectionId: string, data: T): Promise<boolean> {
  const { error } = await supabase
    .from('site_content')
    .upsert({ section_id: sectionId, data, updated_at: new Date().toISOString() });
  return !error;
}
