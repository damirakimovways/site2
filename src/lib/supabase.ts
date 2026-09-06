import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  typeof rawUrl === 'string' &&
  (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) &&
  rawKey &&
  typeof rawKey === 'string' &&
  rawKey.trim() !== ''
);

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

export type FeatureItem = {
  id: string;
  icon: 'shield' | 'truck' | 'headphones' | 'sparkles' | 'clock' | 'award';
  title: string;
  text: string;
};

export type FeaturesContent = {
  badge: string;
  title: string;
  subtitle: string;
  items: FeatureItem[];
};

export type SetsContent = {
  badge: string;
  title: string;
  subtitle: string;
};

export type RentalRuleItem = {
  num: string;
  title: string;
  desc: string;
};

export type RentalRulesContent = {
  title: string;
  subtitle: string;
  rules: RentalRuleItem[];
  whatsappText: string;
};

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
    { id: 'rules', label: 'Правила аренды' },
  ],
};

export const DEFAULT_FEATURES: FeaturesContent = {
  badge: 'Надёжный прокат',
  title: 'Преимущества сервиса WAYS Rental',
  subtitle: 'Мы делаем аренду съёмочной техники быстрой, прозрачной и безопасной для любого продакшна',
  items: [
    { id: '1', icon: 'shield', title: 'Страховка включена', text: 'Вся техника застрахована. Спокойствие на каждой съёмке.' },
    { id: '2', icon: 'truck', title: 'Доставка по городу', text: 'Привезём оборудование прямо на площадку в удобное время.' },
    { id: '3', icon: 'headphones', title: 'Поддержка 24/7', text: 'Поможем настроить и разобраться с любой единицей техники.' },
  ],
};

export const DEFAULT_SETS: SetsContent = {
  badge: 'Выгодные предложения',
  title: 'Готовые съёмочные наборы',
  subtitle: 'Комплекты техники «под ключ» — выгоднее и удобнее, чем брать по отдельности',
};

export const DEFAULT_RULES: RentalRulesContent = {
  title: 'Правила аренды',
  subtitle: 'Условия и порядок проката техники в WAYS Rental',
  rules: [
    {
      num: '01',
      title: 'Документы и оформление',
      desc: 'Для оформления договора аренды требуется оригинал удостоверения личности или паспорта Республики Казахстан. Оформление занимает не более 5 минут.',
    },
    {
      num: '02',
      title: 'Залог и экспресс-проверка',
      desc: 'Оборудование выдаётся под залог (денежный депозит или документ) либо после быстрой проверки данных постоянных клиентов без залога.',
    },
    {
      num: '03',
      title: 'Расчёт смены (24 часа)',
      desc: 'Одна смена аренды длится ровно 24 часа с момента фактической передачи техники. Время возврата фиксируется в акте приёма-передачи.',
    },
    {
      num: '04',
      title: 'Проверка и возврат',
      desc: 'Техника проверяется при выдаче (сенсор, линзы, органы управления, батареи). Возврат производится в исправном и чистом виде со всеми аксессуарами.',
    },
    {
      num: '05',
      title: 'Бронирование и оплата',
      desc: 'Бронь подтверждается через WhatsApp с фиксацией дат и комплектации съёмки. Оплата принимается наличными, банковской картой или Kaspi QR.',
    },
    {
      num: '06',
      title: 'Скидки на длительную аренду',
      desc: 'От 3-х суток — скидка 15%. От 7 суток — скидка 25%. Для постоянных съёмочных команд действуют специальные партнёрские тарифы.',
    },
  ],
  whatsappText: 'Здравствуйте! Хочу уточнить правила аренды техники.',
};

export const DEFAULT_BRANDING: BrandingContent = { logoUrl: null };

export const DEFAULT_FOOTER: FooterContent = {
  copyright: '© 2026 Вейс Рентал. Все права защищены.',
  links: [{ label: 'Контакты' }],
};

export const DEFAULT_SOCIAL: SocialContent = {
  instagramUrl: 'https://instagram.com/waysrental',
  instagramLabel: 'Instagram',
};

export const DEFAULT_CONTACTS: ContactsContent = {
  text: 'Свяжитесь с нами для аренды техники.\nТелефон: +7 705 852 57 80\nEmail: info@waysrental.kz\nАдрес: Алматы, Казахстан',
};

export const DEFAULT_CATEGORIES: CategoriesContent = {
  items: [
    { id: 'sets', name: 'Наборы' },
    { id: 'cameras', name: 'Камеры' },
    { id: 'lenses', name: 'Объективы' },
    { id: 'light', name: 'Свет' },
    { id: 'sound', name: 'Звук' },
  ],
};

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'bundle-1',
    name: 'Кит «Sony FX3 Cinema»: FX3 + 24-70mm GM II + 3x АКБ + CFexpress 160GB',
    category: 'sets',
    price: 34000,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    is_new: true,
    description: 'Полный профессиональный комплект для кино и коммерческой рекламы.\n\nВ комплекте:\n• Кинокамера Sony FX3 Cinema Line\n• Светосильный зум Sony FE 24-70mm f/2.8 GM II\n• 3x оригинальных аккумулятора NP-FZ100\n• Скоростная карта памяти 160GB CFexpress Type A\n• Клетка SmallRig с верхней рукояткой\n• Зарядное устройство и защитный кейс\n\nВыгода в комплекте: экономия 8 000 ₸ за смену!',
    created_at: '2026-09-01T09:00:00Z',
  },
  {
    id: 'bundle-2',
    name: 'Кит «Интервью & YouTube»: Sony A7 IV + 24-70 Art + Свет Amaran + Микрофон Rode',
    category: 'sets',
    price: 29000,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    is_new: true,
    description: 'Готовое решение «под ключ» для качественной съёмки интервью, блогов и обучающих курсов.\n\nВ комплекте:\n• Камера Sony Alpha 7 IV 4K 60p\n• Объектив Sigma 24-70mm f/2.8 DG DN Art\n• Двухканальная радиосистема Rode Wireless PRO (2 петлички, 32-bit float)\n• Полноцветный светодиодный источник Amaran Ray 120C RGBWW со стойкой и софтбоксом\n• 2x аккумулятора и карта памяти 128GB\n\nВыгода в комплекте: экономия 6 000 ₸ за смену!',
    created_at: '2026-09-01T09:10:00Z',
  },
  {
    id: 'bundle-3',
    name: 'Кит «Студийный свет Pro»: Aputure 300d II + 2x Amaran 120C + Октобоксы',
    category: 'sets',
    price: 39000,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    is_new: false,
    description: 'Трёхточечный сетап профессионального постоянного света для фото- и видеостудий.\n\nВ комплекте:\n• Мощный рисующий моноблок Aputure LS 300d Mark II (300 Вт, 5500K)\n• 2x полноцветных прибора Amaran Ray 120C RGBWW (заполняющий и фоновый)\n• Глубокий октобокс Aputure Light Dome II с сотами\n• 3x усиленные стойки C-Stand с перекладинами и грузами\n\nВыгода в комплекте: экономия 9 000 ₸ за смену!',
    created_at: '2026-09-01T09:20:00Z',
  },
  {
    id: 'bundle-4',
    name: 'Кит «Чистый звук & Репортаж»: Sennheiser G4 + Zoom H6 + Наушники',
    category: 'sets',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    is_new: true,
    description: 'Надёжный звуковой тракт для репортажей, выездных съёмок и мероприятий.\n\nВ комплекте:\n• Профессиональный рекордер Zoom H6 (до 6 каналов одновременно)\n• Беспроводная радиосистема Sennheiser EW 100 G4 с петличкой ME 2-II\n• Закрытые мониторные наушники Audio-Technica ATH-M40x\n• Меховая ветрозащита, запас аккумуляторов AA и коммутация XLR\n\nВыгода в комплекте: экономия 4 000 ₸ за смену!',
    created_at: '2026-09-01T09:30:00Z',
  },
  {
    id: 'prod-1',
    name: 'Sony FX3 Cinema Line',
    category: 'cameras',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    is_new: true,
    description: 'Полнокадровая компактная кинокамера Cinema Line. Запись 4K до 120 к/с, 10-бит 4:2:2, профили S-Cinetone и S-Log3, активное охлаждение.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Sony Alpha 7 IV Body',
    category: 'cameras',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80',
    is_new: false,
    description: 'Универсальная камера 33 Мп. Запись 4K 60p, продвинутый фазовый автофокус в реальном времени, 5-осевая матричная стабилизация.',
    created_at: '2026-09-01T11:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Sony FE 24-70mm f/2.8 GM II',
    category: 'lenses',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=800&q=80',
    is_new: true,
    description: 'Топовый зум-объектив серии G Master второго поколения. Непревзойденная резкость, быстрый и бесшумный фокус, малый вес.',
    created_at: '2026-09-01T12:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'Sigma 24-70mm f/2.8 DG DN Art',
    category: 'lenses',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    is_new: false,
    description: 'Светосильный стандартный зум для байонета Sony E. Прекрасная резкость по всему полю кадра и мягкое боке.',
    created_at: '2026-09-01T13:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'Amaran Ray 120C RGBWW',
    category: 'light',
    price: 14000,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    is_new: true,
    description: 'Мощный полноцветный точечный LED-источник света. Полный спектр цветов RGBWW, управление со смартфона через приложение Sidus Link.',
    created_at: '2026-09-01T14:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Aputure LS 300d Mark II',
    category: 'light',
    price: 16000,
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    is_new: false,
    description: 'Мощный моноблок постоянного света 5500K с байонетом Bowens. Высокий индекс цветопередачи CRI/TLCI 96+.',
    created_at: '2026-09-01T15:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'Rode Wireless PRO',
    category: 'sound',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    is_new: true,
    description: 'Двухканальная цифровая радиосистема с записью 32-bit float на встроенную память, таймкодом и комплектом петличных микрофонов.',
    created_at: '2026-09-01T16:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'Sennheiser EW 100 G4-ME2',
    category: 'sound',
    price: 9000,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    is_new: false,
    description: 'Проверенная профессиональная радиосистема UHF-диапазона. Надежная передача сигнала, круговая петличка ME 2-II.',
    created_at: '2026-09-01T17:00:00Z',
  },
];

const LOCAL_STORAGE_PRODUCTS_KEY = 'ways_rental_products';
const LOCAL_STORAGE_CONTENT_KEY = 'ways_rental_site_content';

function getInitialLocalContent() {
  return [
    { section_id: 'hero', data: DEFAULT_HERO },
    { section_id: 'nav', data: DEFAULT_NAV },
    { section_id: 'branding', data: DEFAULT_BRANDING },
    { section_id: 'footer', data: DEFAULT_FOOTER },
    { section_id: 'social', data: DEFAULT_SOCIAL },
    { section_id: 'contacts', data: DEFAULT_CONTACTS },
    { section_id: 'categories', data: DEFAULT_CATEGORIES },
    { section_id: 'features', data: DEFAULT_FEATURES },
    { section_id: 'sets_header', data: DEFAULT_SETS },
    { section_id: 'rental_rules', data: DEFAULT_RULES },
  ];
}

type ChannelCallback = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: unknown;
  old: unknown;
}) => void;

class LocalSupabaseClient {
  private channelListeners: Map<string, ChannelCallback[]> = new Map();

  private getStoredProducts(): Product[] {
    try {
      const item = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (item) {
        const parsed: Product[] = JSON.parse(item);
        // Ensure bundle products exist if they were added later
        const hasSets = parsed.some((p) => p.category === 'sets');
        if (!hasSets) {
          const sets = DEFAULT_PRODUCTS.filter((p) => p.category === 'sets');
          const merged = [...sets, ...parsed];
          this.saveStoredProducts(merged);
          return merged;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    this.saveStoredProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }

  private saveStoredProducts(products: Product[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }
  }

  private getStoredContent(): Array<{ section_id: string; data: unknown }> {
    try {
      const item = localStorage.getItem(LOCAL_STORAGE_CONTENT_KEY);
      if (item) {
        const parsed: Array<{ section_id: string; data: Record<string, unknown> }> = JSON.parse(item);
        let changed = false;

        const catRow = parsed.find((r) => r.section_id === 'categories');
        if (catRow && Array.isArray(catRow.data?.items) && !(catRow.data.items as Array<{ id: string }>).some((i) => i.id === 'sets')) {
          (catRow.data.items as Array<{ id: string; name: string }>).unshift({ id: 'sets', name: 'Наборы' });
          changed = true;
        }

        const navRow = parsed.find((r) => r.section_id === 'nav');
        if (navRow && Array.isArray(navRow.data?.items)) {
          const items = navRow.data.items as Array<{ id: string; label: string }>;
          // Ensure catalog label is 'Каталог техники'
          const catItem = items.find((i) => i.id === 'catalog');
          if (catItem && catItem.label === 'Каталог') {
            catItem.label = 'Каталог техники';
            changed = true;
          }
          // Ensure rules is in nav after contacts
          if (!items.some((i) => i.id === 'rules')) {
            items.push({ id: 'rules', label: 'Правила аренды' });
            changed = true;
          }
        }

        const footerRow = parsed.find((r) => r.section_id === 'footer');
        if (footerRow && Array.isArray(footerRow.data?.links)) {
          const links = footerRow.data.links as Array<{ label: string }>;
          const filteredLinks = links.filter((l) => {
            const name = l.label.toLowerCase();
            return !name.includes('instagram') && !name.includes('инстаграм') && !name.includes('новая ссылка');
          });
          if (filteredLinks.length !== links.length) {
            footerRow.data.links = filteredLinks;
            changed = true;
          }
        }
        if (!parsed.some((r) => r.section_id === 'features')) {
          parsed.push({ section_id: 'features', data: DEFAULT_FEATURES as unknown as Record<string, unknown> });
          changed = true;
        }
        if (!parsed.some((r) => r.section_id === 'sets_header')) {
          parsed.push({ section_id: 'sets_header', data: DEFAULT_SETS as unknown as Record<string, unknown> });
          changed = true;
        }
        if (!parsed.some((r) => r.section_id === 'rental_rules')) {
          parsed.push({ section_id: 'rental_rules', data: DEFAULT_RULES as unknown as Record<string, unknown> });
          changed = true;
        }

        if (changed) {
          this.saveStoredContent(parsed);
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    const initial = getInitialLocalContent();
    this.saveStoredContent(initial);
    return initial;
  }

  private saveStoredContent(content: Array<{ section_id: string; data: unknown }>) {
    try {
      localStorage.setItem(LOCAL_STORAGE_CONTENT_KEY, JSON.stringify(content));
    } catch {
      // ignore
    }
  }

  private emitChange(table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', newRecord: unknown, oldRecord: unknown) {
    const listeners = this.channelListeners.get(table) || [];
    for (const listener of listeners) {
      try {
        listener({ eventType, new: newRecord, old: oldRecord });
      } catch {
        // ignore
      }
    }
  }

  from(table: string) {
    if (table === 'products') {
      return {
        select: () => {
          const list = [...this.getStoredProducts()];
          const promise = Promise.resolve({ data: list, error: null });
          return Object.assign(promise, {
            order: (col: string, options?: { ascending?: boolean }) => {
              const asc = options?.ascending !== false;
              list.sort((a, b) => {
                const valA = (a as Record<string, unknown>)[col];
                const valB = (b as Record<string, unknown>)[col];
                if (valA === valB) return 0;
                if (valA == null) return 1;
                if (valB == null) return -1;
                return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
              });
              return Promise.resolve({ data: list, error: null });
            },
          });
        },
        insert: (item: Partial<Product>) => {
          const products = this.getStoredProducts();
          const newProduct: Product = {
            id: item.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: item.name || '',
            category: item.category || 'cameras',
            price: Number(item.price) || 0,
            image: item.image || null,
            is_new: Boolean(item.is_new),
            description: item.description || '',
            created_at: item.created_at || new Date().toISOString(),
          };
          const updated = [newProduct, ...products];
          this.saveStoredProducts(updated);
          this.emitChange('products', 'INSERT', newProduct, null);
          return Promise.resolve({ data: [newProduct], error: null });
        },
        update: (updates: Partial<Product>) => {
          return {
            eq: (col: string, val: unknown) => {
              const products = this.getStoredProducts();
              let updatedItem: Product | null = null;
              let oldItem: Product | null = null;
              const updated = products.map((p) => {
                if ((p as Record<string, unknown>)[col] === val) {
                  oldItem = p;
                  updatedItem = { ...p, ...updates };
                  return updatedItem;
                }
                return p;
              });
              this.saveStoredProducts(updated);
              if (updatedItem) {
                this.emitChange('products', 'UPDATE', updatedItem, oldItem);
              }
              return Promise.resolve({ data: updatedItem, error: null });
            },
          };
        },
        delete: () => {
          return {
            eq: (col: string, val: unknown) => {
              const products = this.getStoredProducts();
              const oldItem = products.find((p) => (p as Record<string, unknown>)[col] === val);
              const updated = products.filter((p) => (p as Record<string, unknown>)[col] !== val);
              this.saveStoredProducts(updated);
              if (oldItem) {
                this.emitChange('products', 'DELETE', null, oldItem);
              }
              return Promise.resolve({ data: null, error: null });
            },
          };
        },
      };
    }

    if (table === 'site_content') {
      return {
        select: () => {
          const list = this.getStoredContent();
          return Promise.resolve({ data: list, error: null });
        },
        upsert: (record: { section_id: string; data: unknown; updated_at?: string }) => {
          const content = this.getStoredContent();
          const existingIndex = content.findIndex((c) => c.section_id === record.section_id);
          let newContent: Array<{ section_id: string; data: unknown }>;
          if (existingIndex >= 0) {
            newContent = content.map((c, idx) => (idx === existingIndex ? { section_id: record.section_id, data: record.data } : c));
          } else {
            newContent = [...content, { section_id: record.section_id, data: record.data }];
          }
          this.saveStoredContent(newContent);
          this.emitChange('site_content', 'UPDATE', { section_id: record.section_id, data: record.data }, null);
          return Promise.resolve({ data: record, error: null });
        },
      };
    }

    return {
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      upsert: () => Promise.resolve({ data: null, error: null }),
    };
  }

  channel(channelName: string) {
    const table = channelName.includes('product') ? 'products' : 'site_content';
    let registeredCallback: ChannelCallback | null = null;

    const channelObj = {
      on: (_event: string, _filter: unknown, callback: ChannelCallback) => {
        registeredCallback = callback;
        return channelObj;
      },
      subscribe: () => {
        if (registeredCallback) {
          const listeners = this.channelListeners.get(table) || [];
          this.channelListeners.set(table, [...listeners, registeredCallback]);
        }
        return channelObj;
      },
    };
    return channelObj;
  }

  removeChannel() {
    // No-op for local memory channels
  }

  storage = {
    from: () => ({
      upload: async (fileName: string) => {
        return { data: { path: fileName }, error: null };
      },
      getPublicUrl: (fileName: string) => {
        return { data: { publicUrl: fileName } };
      },
    }),
  };
}

export type SupabaseClientShape = SupabaseClient | LocalSupabaseClient;

// Export Supabase client: live if credentials are valid, otherwise local fallback
export const supabase: SupabaseClientShape = (
  isSupabaseConfigured
    ? (createClient(rawUrl, rawKey) as SupabaseClientShape)
    : (new LocalSupabaseClient() as SupabaseClientShape)
);

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  if (isSupabaseConfigured) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('uploads').upload(fileName, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch {
      // fallback to data URL
    }
  }

  // Local fallback: read file as Base64 Data URL so uploaded image displays immediately
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export async function saveContentSection<T>(sectionId: string, data: T): Promise<boolean> {
  try {
    const { error } = await (supabase as LocalSupabaseClient)
      .from('site_content')
      .upsert({ section_id: sectionId, data, updated_at: new Date().toISOString() });
    return !error;
  } catch {
    return false;
  }
}
