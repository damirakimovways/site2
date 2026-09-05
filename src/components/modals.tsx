import { useState, useRef } from 'react';
import {
  X, Edit3, Plus, Trash2, Image as ImageIcon, Upload, Loader2, GripVertical,
} from 'lucide-react';
import {
  uploadImage,
  type Product, type HeroContent, type NavContent, type NavItem,
  type FooterContent, type FooterLink, type SocialContent,
  type ContactsContent, type CategoriesContent, type CategoryItem,
} from '@/lib/supabase';

/* ---------- Product Modal ---------- */

export function ProductModal({
  product, categories, onSave, onClose,
}: {
  product: Product | null;
  categories: CategoryItem[];
  onSave: (data: Partial<Product>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product?.name ?? '',
    category: product?.category ?? (categories[0]?.id ?? 'cameras'),
    price: product?.price ?? 0,
    image: product?.image ?? '',
    is_new: product?.is_new ?? false,
    description: product?.description ?? '',
    id: product?.id,
    created_at: product?.created_at,
  } as Partial<Product>);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadImage(file, 'products');
    setUploading(false);
    if (url) setFormData((prev) => ({ ...prev, image: url }));
  };

  return (
    <ModalShell title={product ? 'Настройки товара' : 'Добавить новинку'} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <Field label="Название техники">
          <input type="text" value={formData.name ?? ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputCls} placeholder="Например: Sony FX3" />
        </Field>
        <Field label="Раздел каталога">
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputCls}>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </Field>
        <Field label="Цена аренды (за смену, ₸)">
          <input type="number" value={formData.price ?? 0} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="Описание товара">
          <textarea value={formData.description ?? ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4} className={`${inputCls} resize-none`} placeholder="Подробное описание, характеристики, комплектация..." />
        </Field>
        <Field label="Фотография товара">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
              {formData.image ? <img src={formData.image} alt="Превью" className="w-full h-full object-contain" /> : <ImageIcon size={24} className="text-gray-300" />}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex-1 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Загрузка...' : 'Загрузить с компьютера'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
          </div>
          <input type="text" value={formData.image ?? ''} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="или вставьте ссылку..."
            className={`${inputCls} mt-2 text-sm`} />
        </Field>
        <label className="flex items-center gap-3 cursor-pointer mt-4 p-3 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <input type="checkbox" checked={formData.is_new ?? false} onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
            className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500" />
          <span className="text-sm font-semibold text-gray-700">Пометить бейджиком «NEW»</span>
        </label>
      </div>
      <ModalActions onClose={onClose} onSave={() => onSave(formData)} saveLabel="Сохранить" />
    </ModalShell>
  );
}

/* ---------- Hero Content Modal ---------- */

export function ContentModal({ initialData, onSave, onClose }: {
  initialData: HeroContent; onSave: (d: HeroContent) => void; onClose: () => void;
}) {
  const [formData, setFormData] = useState<HeroContent>(initialData);
  return (
    <ModalShell title="Оформление баннера" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-4">
        <Field label="Надпись в бейдже (сверху)">
          <input type="text" value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Главный текст">
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Подзаголовок">
            <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="Описание техники">
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
        </Field>
        <Field label="Текст кнопки">
          <input type="text" value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })} className={inputCls} />
        </Field>
      </div>
      <ModalActions onClose={onClose} onSave={() => onSave(formData)} saveLabel="Применить изменения" />
    </ModalShell>
  );
}

/* ---------- Nav Modal ---------- */

export function NavModal({ initialData, onSave, onClose }: {
  initialData: NavContent; onSave: (d: NavContent) => void; onClose: () => void;
}) {
  const [items, setItems] = useState<NavItem[]>(initialData.items ?? []);
  const update = (i: number, field: keyof NavItem, v: string) => setItems((p) => p.map((it, idx) => idx === i ? { ...it, [field]: v } : it));
  return (
    <ModalShell title="Меню навигации" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <GripVertical size={18} className="text-gray-300 shrink-0" />
            <input type="text" value={item.id} onChange={(e) => update(i, 'id', e.target.value)} placeholder="ID страницы" className={`${inputCls} w-1/3`} />
            <input type="text" value={item.label} onChange={(e) => update(i, 'label', e.target.value)} placeholder="Название" className={inputCls} />
            <button onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shrink-0"><Trash2 size={18} /></button>
          </div>
        ))}
        <button onClick={() => setItems((p) => [...p, { id: `page-${Date.now()}`, label: 'Новый раздел' }])} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors font-semibold flex items-center justify-center gap-2"><Plus size={18} /> Добавить раздел</button>
      </div>
      <ModalActions onClose={onClose} onSave={() => onSave({ items })} />
    </ModalShell>
  );
}

/* ---------- Footer Modal ---------- */

export function FooterModal({ initialData, onSave, onClose }: {
  initialData: FooterContent; onSave: (d: FooterContent) => void; onClose: () => void;
}) {
  const [copyright, setCopyright] = useState(initialData.copyright);
  const [links, setLinks] = useState<FooterLink[]>(initialData.links ?? []);
  return (
    <ModalShell title="Подвал сайта" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-4">
        <Field label="Текст копирайта">
          <input type="text" value={copyright} onChange={(e) => setCopyright(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Ссылки">
          <div className="space-y-2">
            {links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={link.label} onChange={(e) => setLinks((p) => p.map((l, idx) => idx === i ? { label: e.target.value } : l))} className={inputCls} />
                <button onClick={() => setLinks((p) => p.filter((_, idx) => idx !== i))} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shrink-0"><Trash2 size={18} /></button>
              </div>
            ))}
            <button onClick={() => setLinks((p) => [...p, { label: 'Новая ссылка' }])} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors font-semibold flex items-center justify-center gap-2"><Plus size={18} /> Добавить ссылку</button>
          </div>
        </Field>
      </div>
      <ModalActions onClose={onClose} onSave={() => onSave({ copyright, links })} />
    </ModalShell>
  );
}

/* ---------- Social Modal ---------- */

export function SocialModal({ initialData, onSave, onClose }: {
  initialData: SocialContent; onSave: (d: SocialContent) => void; onClose: () => void;
}) {
  const [formData, setFormData] = useState<SocialContent>(initialData);
  return (
    <ModalShell title="Instagram" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <Field label="Ссылка на Instagram">
          <input type="text" value={formData.instagramUrl} onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })} className={inputCls} placeholder="https://instagram.com/..." />
        </Field>
        <Field label="Текст кнопки">
          <input type="text" value={formData.instagramLabel} onChange={(e) => setFormData({ ...formData, instagramLabel: e.target.value })} className={inputCls} placeholder="Instagram" />
        </Field>
      </div>
      <ModalActions onClose={onClose} onSave={() => onSave(formData)} />
    </ModalShell>
  );
}

/* ---------- Contacts Modal ---------- */

export function ContactsModal({ initialData, onSave, onClose }: {
  initialData: ContactsContent; onSave: (d: ContactsContent) => void; onClose: () => void;
}) {
  const [text, setText] = useState(initialData.text);
  return (
    <ModalShell title="Контакты" onClose={onClose} maxWidth="max-w-md">
      <Field label="Текст контактов">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className={`${inputCls} resize-none`} placeholder="Телефон, email, адрес..." />
      </Field>
      <ModalActions onClose={onClose} onSave={() => onSave({ text })} />
    </ModalShell>
  );
}

/* ---------- Categories Modal ---------- */

export function CategoriesModal({ initialData, onSave, onClose }: {
  initialData: CategoriesContent; onSave: (d: CategoriesContent) => void; onClose: () => void;
}) {
  const [items, setItems] = useState<CategoryItem[]>(initialData.items ?? []);
  return (
    <ModalShell title="Разделы каталога" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="text" value={item.id} onChange={(e) => setItems((p) => p.map((it, idx) => idx === i ? { ...it, id: e.target.value } : it))} placeholder="ID" className={`${inputCls} w-1/3`} />
            <input type="text" value={item.name} onChange={(e) => setItems((p) => p.map((it, idx) => idx === i ? { ...it, name: e.target.value } : it))} placeholder="Название" className={inputCls} />
            <button onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shrink-0"><Trash2 size={18} /></button>
          </div>
        ))}
        <button onClick={() => setItems((p) => [...p, { id: `cat-${Date.now()}`, name: 'Новый раздел' }])} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors font-semibold flex items-center justify-center gap-2"><Plus size={18} /> Добавить раздел</button>
      </div>
      <ModalActions onClose={onClose} onSave={() => onSave({ items })} />
    </ModalShell>
  );
}

/* ---------- Shared UI helpers ---------- */

const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ModalShell({ title, onClose, children, maxWidth = 'max-w-lg' }: {
  title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl p-6 w-full ${maxWidth} shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onClose, onSave, saveLabel = 'Сохранить' }: {
  onClose: () => void; onSave: () => void; saveLabel?: string;
}) {
  return (
    <div className="flex gap-3 mt-8">
      <button onClick={onClose} className="flex-1 py-3.5 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Отмена</button>
      <button onClick={onSave} className="flex-1 py-3.5 rounded-xl font-bold bg-black text-white hover:bg-gray-900 transition-colors shadow-lg">{saveLabel}</button>
    </div>
  );
}
