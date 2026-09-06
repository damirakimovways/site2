import { useState, useRef, useEffect } from 'react';
import {
  X, Plus, Trash2, Image as ImageIcon, Upload, Loader2, GripVertical,
  FileText, MessageCircle, ArrowUp, ArrowDown, ArrowUpToLine,
  Edit3, Check,
} from 'lucide-react';
import {
  uploadImage,
  type Product, type HeroContent, type NavContent, type NavItem,
  type FooterContent, type FooterLink, type SocialContent,
  type ContactsContent, type CategoriesContent, type CategoryItem,
  type RentalRulesContent, type RentalRuleItem, DEFAULT_RULES,
  type SetsContent, DEFAULT_SETS,
  type FeaturesContent, type FeatureItem, DEFAULT_FEATURES,
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

/* ---------- Admin Login Modal ---------- */

export function AdminLoginModal({
  isOpen,
  onClose,
  onLogin,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = password.trim().toLowerCase();
    // Support English layout, Russian layout (фвьшт), default passwords
    if (clean === 'admin' || clean === 'фвьшт' || clean === '1234' || clean === 'password') {
      setError(false);
      setPassword('');
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <ModalShell title="Режим редактирования" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500">
          Введите пароль администратора для входа в режим редактирования сайта.
        </p>
        <Field label="Пароль">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(false);
            }}
            placeholder="Введите пароль"
            className={`${inputCls} ${error ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
          />
        </Field>
        {error && (
          <p className="text-xs text-red-600 font-medium">Неверный пароль</p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl font-bold bg-black text-white hover:bg-gray-900 transition-colors shadow-md"
          >
            Войти
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---------- Confirm Modal ---------- */

export function ConfirmModal({
  isOpen,
  title = 'Подтверждение',
  message,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <ModalShell title={title} onClose={onClose} maxWidth="max-w-sm">
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">{message}</p>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
          >
            Удалить
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------- Rental Rules Modal ---------- */

export function RentalRulesModal({
  isOpen,
  onClose,
  whatsappNumber,
  isAdmin = false,
  content,
  onSaveRules,
}: {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  isAdmin?: boolean;
  content?: RentalRulesContent;
  onSaveRules?: (content: RentalRulesContent) => void;
}) {
  const currentContent = content || DEFAULT_RULES;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<RentalRulesContent>(currentContent);

  useEffect(() => {
    if (content) {
      setDraft(content);
    }
  }, [content]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSaveRules) {
      onSaveRules(draft);
    }
    setIsEditing(false);
  };

  const handleAddRule = () => {
    const nextNum = String(draft.rules.length + 1).padStart(2, '0');
    setDraft({
      ...draft,
      rules: [
        ...draft.rules,
        {
          num: nextNum,
          title: 'Новое условие',
          desc: 'Описание регламента или условий проката техники...',
        },
      ],
    });
  };

  const handleRemoveRule = (index: number) => {
    setDraft({
      ...draft,
      rules: draft.rules.filter((_, i) => i !== index),
    });
  };

  const handleRuleChange = (index: number, field: keyof RentalRuleItem, value: string) => {
    const updated = [...draft.rules];
    updated[index] = { ...updated[index], [field]: value };
    setDraft({ ...draft, rules: updated });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {isEditing ? 'Редактирование правил' : draft.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {isEditing ? 'Настройте тексты и пункты условий проката' : draft.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-zinc-200 cursor-pointer shadow-sm"
              >
                <Edit3 size={13} /> Редактировать
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Заголовок окна
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Подзаголовок
                </label>
                <input
                  type="text"
                  value={draft.subtitle}
                  onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Текст обращения в WhatsApp
              </label>
              <input
                type="text"
                value={draft.whatsappText}
                onChange={(e) => setDraft({ ...draft, whatsappText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-gray-900">Пункты правил ({draft.rules.length})</span>
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-black text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Plus size={13} /> Добавить пункт
                </button>
              </div>

              <div className="space-y-3">
                {draft.rules.map((rule, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rule.num}
                        onChange={(e) => handleRuleChange(idx, 'num', e.target.value)}
                        className="w-14 px-2 py-1.5 rounded-lg border border-gray-200 bg-white font-mono font-bold text-xs text-center"
                        placeholder="01"
                      />
                      <input
                        type="text"
                        value={rule.title}
                        onChange={(e) => handleRuleChange(idx, 'title', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm font-bold"
                        placeholder="Название пункта (например: Документы и оформление)"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                        title="Удалить пункт"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <textarea
                      value={rule.desc}
                      onChange={(e) => handleRuleChange(idx, 'desc', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Подробное описание условия..."
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDraft(currentContent);
                  setIsEditing(false);
                }}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-xs sm:text-sm transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Check size={16} /> Сохранить правила
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {draft.rules.map((r, idx) => (
                <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3.5">
                  <span className="font-mono text-xs sm:text-sm font-black text-red-600 bg-red-100/70 px-2.5 py-1 rounded-xl shrink-0">
                    {r.num}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-0.5">{r.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(draft.whatsappText || 'Здравствуйте! Хочу уточнить правила аренды техники.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                <MessageCircle size={16} /> Написать в WhatsApp
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-black text-white hover:bg-gray-800 font-bold text-xs sm:text-sm transition-all shadow-md"
              >
                Понятно, закрыть
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Sets Content Modal (Editing Sets Section text) ---------- */

export function SetsContentModal({
  isOpen,
  content,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  content: SetsContent;
  onSave: (data: SetsContent) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<SetsContent>(content || DEFAULT_SETS);

  useEffect(() => {
    if (content) setFormData(content);
  }, [content]);

  if (!isOpen) return null;

  return (
    <ModalShell title="Редактировать раздел «Наборы»" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <Field label="Бейдж / метка (сверху)">
          <input
            type="text"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            className={inputCls}
            placeholder="Например: Выгодные предложения"
          />
        </Field>
        <Field label="Главный заголовок">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={inputCls}
            placeholder="Например: Готовые съёмочные наборы"
          />
        </Field>
        <Field label="Подзаголовок / описание">
          <textarea
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="Краткое пояснение о наборах..."
          />
        </Field>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-xs sm:text-sm transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(formData);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-xs sm:text-sm transition-colors shadow-lg"
          >
            Сохранить
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------- Features Modal (Editing 3 reassurance blocks) ---------- */

export function FeaturesModal({
  isOpen,
  content,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  content: FeaturesContent;
  onSave: (data: FeaturesContent) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<FeaturesContent>(content || DEFAULT_FEATURES);

  useEffect(() => {
    if (content) setFormData(content);
  }, [content]);

  if (!isOpen) return null;

  const updateItem = (index: number, field: keyof FeatureItem, value: string) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, items: updated });
  };

  const iconOptions: Array<{ id: FeatureItem['icon']; label: string }> = [
    { id: 'shield', label: 'Щит (Страховка)' },
    { id: 'truck', label: 'Грузовик (Доставка)' },
    { id: 'headphones', label: 'Наушники (Поддержка 24/7)' },
    { id: 'sparkles', label: 'Искры (Премиум)' },
    { id: 'clock', label: 'Часы (Оперативность)' },
    { id: 'award', label: 'Награда (Качество)' },
  ];

  return (
    <ModalShell title="Редактировать блоки преимуществ" onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <Field label="Бейдж секции">
          <input
            type="text"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            className={inputCls}
            placeholder="Надёжный прокат"
          />
        </Field>
        <Field label="Главный заголовок секции">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={inputCls}
            placeholder="Преимущества сервиса WAYS Rental"
          />
        </Field>
        <Field label="Подзаголовок секции">
          <textarea
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            rows={2}
            className={`${inputCls} resize-none`}
            placeholder="Описание преимуществ..."
          />
        </Field>

        <div className="pt-2 border-t border-gray-100">
          <h3 className="font-bold text-sm text-gray-900 mb-3">3 блока преимуществ</h3>
          <div className="space-y-4">
            {formData.items.map((item, idx) => (
              <div key={item.id || idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-500 uppercase">Блок #{idx + 1}</span>
                  <select
                    value={item.icon}
                    onChange={(e) => updateItem(idx, 'icon', e.target.value)}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(idx, 'title', e.target.value)}
                  className={inputCls}
                  placeholder="Заголовок карточки"
                />
                <textarea
                  value={item.text}
                  onChange={(e) => updateItem(idx, 'text', e.target.value)}
                  rows={2}
                  className={`${inputCls} resize-none`}
                  placeholder="Описание карточки..."
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-xs sm:text-sm transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(formData);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-xs sm:text-sm transition-colors shadow-lg"
          >
            Сохранить блоки
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------- Reorder Products Modal ---------- */

export function ReorderProductsModal({
  isOpen,
  products,
  onClose,
  onSaveOrder,
}: {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSaveOrder: (reordered: Product[]) => void;
}) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      setItems([...products]);
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    const [removed] = next.splice(index, 1);
    next.splice(targetIndex, 0, removed);
    setItems(next);
  };

  const moveToTop = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    const [removed] = next.splice(index, 1);
    next.unshift(removed);
    setItems(next);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-7 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Порядок товаров в каталоге</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Используйте стрелки, чтобы поднять или опустить товар
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-2 pr-1">
          {items.map((prod, index) => (
            <div
              key={prod.id}
              className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100/60 transition-all"
            >
              <span className="w-6 text-center font-mono font-bold text-xs text-gray-400 shrink-0">
                #{index + 1}
              </span>
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
                {prod.image ? (
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-contain mix-blend-multiply" />
                ) : (
                  <ImageIcon size={18} className="text-gray-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs sm:text-sm text-gray-900 truncate">{prod.name}</div>
                <div className="text-[11px] text-gray-500 font-semibold">{prod.price?.toLocaleString('ru-RU')} ₸ / смена</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, 'up')}
                  className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                  title="Переместить выше"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 'down')}
                  className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                  title="Переместить ниже"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveToTop(index)}
                  className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all hidden sm:block"
                  title="В самый верх"
                >
                  <ArrowUpToLine size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-xs sm:text-sm transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveOrder(items);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-xs sm:text-sm transition-colors shadow-lg"
          >
            Сохранить порядок
          </button>
        </div>
      </div>
    </div>
  );
}

