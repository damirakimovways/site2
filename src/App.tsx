import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, ShoppingCart, Menu, X, ChevronRight, Lock, Edit3, Plus, Trash2,
  Image as ImageIcon, Check, Loader2, Sparkles, ShieldCheck, Truck, Headphones,
  MessageCircle, Upload, Instagram, Phone,
} from 'lucide-react';
import {
  supabase, uploadImage, saveContentSection,
  type Product, type HeroContent, type NavContent, type NavItem,
  type BrandingContent, type FooterContent, type FooterLink,
  type SocialContent, type ContactsContent, type CategoriesContent, type CategoryItem,
  DEFAULT_HERO, DEFAULT_NAV, DEFAULT_BRANDING, DEFAULT_FOOTER,
  DEFAULT_SOCIAL, DEFAULT_CONTACTS, DEFAULT_CATEGORIES,
} from '@/lib/supabase';
import {
  ProductModal, ContentModal, NavModal, FooterModal,
  SocialModal, ContactsModal, CategoriesModal,
} from '@/components/modals';

const FEATURES = [
  { icon: <ShieldCheck size={24} />, title: 'Страховка включена', text: 'Вся техника застрахована. Спокойствие на каждой съёмке.' },
  { icon: <Truck size={24} />, title: 'Доставка по городу', text: 'Привезём оборудование прямо на площадку в удобное время.' },
  { icon: <Headphones size={24} />, title: 'Поддержка 24/7', text: 'Поможем настроить и разобраться с любой единицей техники.' },
];

const WHATSAPP_NUMBER = '77058525780';
type Toast = { id: number; message: string; type: 'success' | 'error' };

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO);
  const [navContent, setNavContent] = useState<NavContent>(DEFAULT_NAV);
  const [branding, setBranding] = useState<BrandingContent>(DEFAULT_BRANDING);
  const [footerContent, setFooterContent] = useState<FooterContent>(DEFAULT_FOOTER);
  const [socialContent, setSocialContent] = useState<SocialContent>(DEFAULT_SOCIAL);
  const [contactsContent, setContactsContent] = useState<ContactsContent>(DEFAULT_CONTACTS);
  const [categoriesContent, setCategoriesContent] = useState<CategoriesContent>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState('home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [isFooterModalOpen, setIsFooterModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [{ data: productData }, { data: contentRows }] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('site_content').select('*'),
      ]);
      if (cancelled) return;
      if (productData) setProducts(productData as Product[]);
      if (contentRows) {
        for (const row of contentRows) {
          const r = row as { section_id: string; data: unknown };
          if (r.section_id === 'hero') setHeroContent(r.data as HeroContent);
          if (r.section_id === 'nav') setNavContent(r.data as NavContent);
          if (r.section_id === 'branding') setBranding(r.data as BrandingContent);
          if (r.section_id === 'footer') setFooterContent(r.data as FooterContent);
          if (r.section_id === 'social') setSocialContent(r.data as SocialContent);
          if (r.section_id === 'contacts') setContactsContent(r.data as ContactsContent);
          if (r.section_id === 'categories') setCategoriesContent(r.data as CategoriesContent);
        }
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const productChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'INSERT') setProducts((prev) => [payload.new as Product, ...prev]);
        else if (payload.eventType === 'UPDATE') setProducts((prev) => prev.map((p) => (p.id === (payload.new as Product).id ? (payload.new as Product) : p)));
        else if (payload.eventType === 'DELETE') setProducts((prev) => prev.filter((p) => p.id !== (payload.old as Product).id));
      })
      .subscribe();
    const contentChannel = supabase
      .channel('content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, (payload) => {
        const row = payload.new as { section_id: string; data: unknown };
        if (row.section_id === 'hero') setHeroContent(row.data as HeroContent);
        if (row.section_id === 'nav') setNavContent(row.data as NavContent);
        if (row.section_id === 'branding') setBranding(row.data as BrandingContent);
        if (row.section_id === 'footer') setFooterContent(row.data as FooterContent);
        if (row.section_id === 'social') setSocialContent(row.data as SocialContent);
        if (row.section_id === 'contacts') setContactsContent(row.data as ContactsContent);
        if (row.section_id === 'categories') setCategoriesContent(row.data as CategoriesContent);
      })
      .subscribe();
    return () => { supabase.removeChannel(productChannel); supabase.removeChannel(contentChannel); };
  }, []);

  const handleAdminLogin = () => {
    if (isAdmin) { setIsAdmin(false); showToast('Режим редактирования выключен'); return; }
    const password = prompt('Режим редактирования.\nПароль: admin');
    if (password === 'admin') { setIsAdmin(true); showToast('Режим редактирования включён'); }
    else if (password !== null) showToast('Неверный пароль', 'error');
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (productData.id) {
        const { id, ...updates } = productData;
        const { error } = await supabase.from('products').update(updates).eq('id', id);
        if (error) throw error;
        showToast('Товар обновлён');
      } else {
        const { error } = await supabase.from('products').insert({
          name: productData.name, category: productData.category, price: productData.price,
          image: productData.image, is_new: productData.is_new ?? false,
          description: productData.description ?? '',
        });
        if (error) throw error;
        showToast('Товар добавлен');
      }
      setIsProductModalOpen(false);
    } catch { showToast('Ошибка сохранения', 'error'); }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Удалить этот товар навсегда?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      showToast('Товар удалён');
    } catch { showToast('Ошибка удаления', 'error'); }
  };

  const saveSection = async (sectionId: string, data: unknown, msg: string) => {
    if (await saveContentSection(sectionId, data)) showToast(msg);
    else showToast('Ошибка сохранения', 'error');
  };

  const handleLogoUpload = async (file: File) => {
    const url = await uploadImage(file, 'logo');
    if (url) { const nb = { logoUrl: url }; setBranding(nb); await saveContentSection('branding', nb); showToast('Логотип обновлён'); }
    else showToast('Ошибка загрузки логотипа', 'error');
  };

  const addToCart = (productId: string) => { setCart((prev) => [...prev, productId]); showToast('Добавлено в корзину'); };
  const removeFromCart = (index: number) => setCart((prev) => prev.filter((_, i) => i !== index));

  const handleCheckout = () => {
    const lines = cartProducts.map((p, i) => `${i + 1}. ${p.name} — ${p.price.toLocaleString('ru-RU')} ₸`);
    const message = `Здравствуйте! Хочу арендовать технику:\n\n${lines.join('\n')}\n\nИтого: ${cartTotal.toLocaleString('ru-RU')} ₸`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const categories = categoriesContent.items ?? DEFAULT_CATEGORIES.items;
  const navItems = navContent.items ?? DEFAULT_NAV.items;
  const footerLinks = footerContent.links ?? DEFAULT_FOOTER.links;

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartProducts = cart.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];
  const cartTotal = cartProducts.reduce((sum, p) => sum + p.price, 0);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || 'Категория';

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-red-500 selection:text-white flex flex-col">
      <header className="sticky top-4 z-50 px-4 md:px-8 w-full mt-4">
        <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-full shadow-sm border border-gray-100 flex items-center justify-between px-6 py-3 transition-all">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setCurrentPage('home')}>
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Логотип" className="h-10 w-auto max-w-[160px] object-contain" />
            ) : (
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none">WAYS</span>
                <span className="text-[9px] font-bold tracking-[0.3em] text-red-600 uppercase">Rental</span>
              </div>
            )}
            {isAdmin && <LogoUploadButton onUpload={handleLogoUpload} />}
          </div>

          <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-500">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setCurrentPage(item.id)}
                className={`px-5 py-2.5 rounded-full transition-all ${currentPage === item.id ? 'text-black bg-gray-100' : 'hover:text-black hover:bg-gray-50'}`}>
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button onClick={() => setIsNavModalOpen(true)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700" title="Редактировать меню">
                <Edit3 size={16} />
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setIsCartOpen(true)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingCart size={20} className="text-gray-700" />
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{cart.length}</span>}
            </button>
          </div>
          <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden max-w-7xl mx-auto mt-2 bg-white rounded-3xl shadow-lg border border-gray-100 p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setCurrentPage(item.id); setIsMobileMenuOpen(false); }}
                className={`px-5 py-3 rounded-xl text-left font-semibold ${currentPage === item.id ? 'bg-gray-100 text-black' : 'text-gray-600'}`}>
                {item.label}
              </button>
            ))}
            <button onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }} className="px-5 py-3 rounded-xl text-left font-semibold text-gray-600 flex items-center gap-2">
              <ShoppingCart size={18} /> Корзина ({cart.length})
            </button>
          </div>
        )}
      </header>

      <div className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-gray-300" /></div>
        ) : (
          <>
            {currentPage === 'home' && (
              <main className="pb-20 animate-in fade-in duration-700">
                <div className="px-4 md:px-8 mt-6 relative group">
                  {isAdmin && (
                    <button onClick={() => setIsContentModalOpen(true)}
                      className="absolute top-4 right-8 md:top-8 md:right-12 z-20 bg-white/10 backdrop-blur-md text-white border border-white/20 px-5 py-2.5 rounded-full font-semibold shadow-lg flex items-center gap-2 hover:bg-white hover:text-black transition-all md:opacity-0 group-hover:opacity-100">
                      <Edit3 size={16} /> Настроить баннер
                    </button>
                  )}
                  <div className="max-w-7xl mx-auto bg-black rounded-[2rem] overflow-hidden relative min-h-[500px] flex items-center shadow-2xl border border-zinc-800">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-red-600/30 blur-[120px] rounded-full pointer-events-none" />
                    <div className="relative z-10 w-full grid md:grid-cols-2 gap-8 p-8 md:p-16 items-center">
                      <div className="text-white flex flex-col items-start text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border border-red-500/30 bg-red-500/10 rounded-full text-red-400 text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
                          <Sparkles size={14} /> {heroContent.badge}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-1 tracking-tight text-white">{heroContent.title}</h1>
                        <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-600 mb-6">{heroContent.subtitle}</h2>
                        <p className="text-gray-400 mb-8 max-w-md text-sm md:text-base leading-relaxed">{heroContent.description}</p>
                        <button onClick={() => setCurrentPage('catalog')} className="bg-white text-black font-bold py-4 px-10 rounded-full transition-all hover:scale-105 hover:bg-gray-100 flex items-center gap-2">
                          {heroContent.buttonText} <ChevronRight size={20} />
                        </button>
                      </div>
                      <div className="hidden md:flex justify-center relative">
                        <div className="w-80 h-80 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-full border border-zinc-700 shadow-2xl relative flex items-center justify-center p-8">
                          <div className="w-full h-full bg-black rounded-full border-[8px] border-zinc-800 flex items-center justify-center shadow-inner overflow-hidden relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent" />
                            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-white rounded-full opacity-95 blur-[2px] shadow-[0_0_60px_rgba(255,255,255,1)] z-10 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURES.map((f) => (
                      <div key={f.title} className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-lg transition-shadow duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5">{f.icon}</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{f.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-24">
                  <div className="flex items-end justify-between mb-10">
                    <div>
                      <h2 className="text-4xl font-black text-gray-900 tracking-tight">Популярное</h2>
                      <p className="text-gray-500 mt-2 font-medium">Техника, которую арендуют чаще всего</p>
                    </div>
                    <button onClick={() => setCurrentPage('catalog')} className="hidden md:flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-wider">
                      Смотреть всё <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} isAdmin={isAdmin} catName={catName(product.category)}
                        onAddToCart={() => addToCart(product.id)}
                        onEdit={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                        onDelete={() => handleDeleteProduct(product.id)}
                        onDetail={() => setDetailProduct(product)}
                      />
                    ))}
                  </div>
                </div>
              </main>
            )}

            {currentPage === 'catalog' && (
              <main className="pb-20 max-w-7xl mx-auto px-4 md:px-8 mt-12 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Каталог</h1>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск..."
                        className="w-full bg-gray-100 border border-gray-200 rounded-full pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                    </div>
                    {isAdmin && (
                      <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                        className="bg-red-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-[0_4px_20px_rgba(220,38,38,0.3)] whitespace-nowrap">
                        <Plus size={18} /> Добавить
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar flex-1">
                    <button onClick={() => setActiveCategory('all')}
                      className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-black text-white shadow-md' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'}`}>
                      Все
                    </button>
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-black text-white shadow-md' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'}`}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  {isAdmin && (
                    <button onClick={() => setIsCategoriesModalOpen(true)} className="p-3 shrink-0 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700" title="Редактировать разделы">
                      <Edit3 size={18} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} isAdmin={isAdmin} catName={catName(product.category)}
                      onAddToCart={() => addToCart(product.id)}
                      onEdit={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                      onDelete={() => handleDeleteProduct(product.id)}
                      onDetail={() => setDetailProduct(product)}
                    />
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                      <ImageIcon size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Пусто</h3>
                      <p className="text-gray-500">В этой категории пока нет техники.</p>
                    </div>
                  )}
                </div>
              </main>
            )}

            {currentPage === 'contacts' && (
              <main className="pb-20 max-w-3xl mx-auto px-4 md:px-8 mt-12 animate-in fade-in duration-500">
                <div className="relative group">
                  {isAdmin && (
                    <button onClick={() => setIsContactsModalOpen(true)}
                      className="absolute top-0 right-0 bg-white border border-gray-200 px-5 py-2.5 rounded-full font-semibold shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-all text-sm">
                      <Edit3 size={16} /> Редактировать
                    </button>
                  )}
                  <div className="bg-white border border-gray-100 rounded-[2rem] p-8 md:p-12 shadow-sm mt-16">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center"><Phone size={24} /></div>
                      <h1 className="text-4xl font-black text-gray-900 tracking-tight">Контакты</h1>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {contactsContent.text.split('\n').map((line, i) => (
                        <p key={i} className="text-gray-600 leading-relaxed mb-2">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </main>
            )}
          </>
        )}
      </div>

      <footer className="bg-white border-t border-gray-100 py-16 mt-auto relative group">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
          <div className="flex flex-col items-center md:items-start">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Логотип" className="h-8 w-auto max-w-[120px] object-contain mb-2" />
            ) : (
              <span className="text-xl font-black text-gray-900 tracking-tight">WAYS</span>
            )}
            <p className="mt-2 font-medium">{footerContent.copyright}</p>
          </div>
          <div className="flex gap-6 font-semibold items-center">
            {footerLinks.map((link, i) => (
              <button key={i} className="hover:text-black transition-colors">{link.label}</button>
            ))}
            {/* Instagram button */}
            {socialContent.instagramUrl ? (
              <a href={socialContent.instagramUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#962fbf] text-white font-bold hover:opacity-90 transition-opacity">
                <Instagram size={16} /> {socialContent.instagramLabel}
              </a>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-400 font-bold">
                <Instagram size={16} /> {socialContent.instagramLabel}
              </span>
            )}
            {isAdmin && (
              <button onClick={() => setIsSocialModalOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-300 hover:text-gray-600" title="Редактировать Instagram">
                <Edit3 size={16} />
              </button>
            )}
            {isAdmin && (
              <button onClick={() => setIsFooterModalOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-300 hover:text-gray-600" title="Редактировать подвал">
                <Edit3 size={16} />
              </button>
            )}
          </div>
        </div>
        <button onClick={handleAdminLogin}
          className={`absolute bottom-6 right-6 p-4 rounded-full transition-all duration-300 ${isAdmin ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-transparent text-gray-300 hover:bg-gray-50 hover:text-gray-600'}`}
          title="Режим редактирования">
          {isAdmin ? <Edit3 size={18} /> : <Lock size={18} />}
        </button>
      </footer>

      {isCartOpen && <CartDrawer products={cartProducts} total={cartTotal} onClose={() => setIsCartOpen(false)} onRemove={removeFromCart} onCheckout={handleCheckout} />}
      {isProductModalOpen && <ProductModal product={editingProduct} categories={categories} onSave={handleSaveProduct} onClose={() => setIsProductModalOpen(false)} />}
      {isContentModalOpen && <ContentModal initialData={heroContent} onSave={(d) => { saveSection('hero', d, 'Баннер обновлён'); setIsContentModalOpen(false); }} onClose={() => setIsContentModalOpen(false)} />}
      {isNavModalOpen && <NavModal initialData={navContent} onSave={(d) => { saveSection('nav', d, 'Меню обновлено'); setIsNavModalOpen(false); }} onClose={() => setIsNavModalOpen(false)} />}
      {isFooterModalOpen && <FooterModal initialData={footerContent} onSave={(d) => { saveSection('footer', d, 'Подвал обновлён'); setIsFooterModalOpen(false); }} onClose={() => setIsFooterModalOpen(false)} />}
      {isSocialModalOpen && <SocialModal initialData={socialContent} onSave={(d) => { saveSection('social', d, 'Instagram обновлён'); setIsSocialModalOpen(false); }} onClose={() => setIsSocialModalOpen(false)} />}
      {isContactsModalOpen && <ContactsModal initialData={contactsContent} onSave={(d) => { saveSection('contacts', d, 'Контакты обновлены'); setIsContactsModalOpen(false); }} onClose={() => setIsContactsModalOpen(false)} />}
      {isCategoriesModalOpen && <CategoriesModal initialData={categoriesContent} onSave={(d) => { saveSection('categories', d, 'Разделы обновлены'); setIsCategoriesModalOpen(false); }} onClose={() => setIsCategoriesModalOpen(false)} />}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          allProducts={products}
          catName={catName(detailProduct.category)}
          onClose={() => setDetailProduct(null)}
          onAddToCart={() => { addToCart(detailProduct.id); setDetailProduct(null); }}
          onSelectProduct={(p) => setDetailProduct(p)}
        />
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg font-semibold text-sm animate-in fade-in slide-in-from-bottom-4 duration-300 ${t.type === 'error' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
            {t.type === 'success' ? <Check size={16} /> : <X size={16} />} {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Logo Upload Button ---------- */

function LogoUploadButton({ onUpload }: { onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button onClick={() => inputRef.current?.click()} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500" title="Загрузить логотип">
        <Upload size={14} />
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }} />
    </>
  );
}

/* ---------- Product Card ---------- */

function ProductCard({ product, isAdmin, catName, onAddToCart, onEdit, onDelete, onDetail }: {
  product: Product; isAdmin: boolean; catName: string;
  onAddToCart: () => void; onEdit: () => void; onDelete: () => void; onDetail: () => void;
}) {
  return (
    <div className="group flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative">
      {isAdmin && (
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2.5 bg-white/90 backdrop-blur rounded-full shadow-md hover:bg-blue-50 text-blue-600 border border-gray-100"><Edit3 size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2.5 bg-white/90 backdrop-blur rounded-full shadow-md hover:bg-red-50 text-red-600 border border-gray-100"><Trash2 size={16} /></button>
        </div>
      )}
      <div className="relative aspect-square bg-gray-50/50 p-6 flex items-center justify-center overflow-hidden cursor-pointer" onClick={onDetail}>
        {product.is_new && <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider z-10">Новинка</span>}
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=Нет+фото'; }} />
        ) : (
          <div className="text-gray-300 flex flex-col items-center"><ImageIcon size={48} /><span className="text-xs mt-2">Нет фото</span></div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow bg-white border-t border-gray-50">
        <div className="text-[11px] text-gray-400 mb-2 font-bold uppercase tracking-widest">{catName}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-6 leading-tight cursor-pointer hover:text-red-600 transition-colors" onClick={onDetail}>{product.name}</h3>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="text-[11px] text-gray-500 mb-1 font-semibold">Смена (24ч)</div>
            <div className="text-2xl font-black text-gray-900">{product.price?.toLocaleString('ru-RU')} ₸</div>
          </div>
          <button onClick={onDetail} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 group-hover:bg-black group-hover:text-white transition-colors shadow-sm hover:scale-110"><Plus size={20} /></button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Product Detail Modal ---------- */

function ProductDetailModal({ product, allProducts, catName, onClose, onAddToCart, onSelectProduct }: {
  product: Product; allProducts: Product[]; catName: string;
  onClose: () => void; onAddToCart: () => void; onSelectProduct: (p: Product) => void;
}) {
  const recommendations = allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative min-h-full flex items-start justify-center p-4 py-8">
        <div className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
          <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-md hover:bg-gray-100 transition-colors"><X size={22} /></button>

          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-square bg-gray-50 p-8 flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <div className="text-gray-300 flex flex-col items-center"><ImageIcon size={64} /><span className="text-sm mt-2">Нет фото</span></div>
              )}
              {product.is_new && <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider z-10">Новинка</span>}
            </div>
            <div className="p-8 md:p-10 flex flex-col">
              <div className="text-[11px] text-gray-400 mb-2 font-bold uppercase tracking-widest">{catName}</div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h2>
              <div className="text-3xl font-black text-red-600 mb-6">{product.price?.toLocaleString('ru-RU')} ₸<span className="text-sm font-medium text-gray-400 ml-2">/ смена</span></div>
              {product.description && (
                <div className="text-gray-600 leading-relaxed text-sm mb-8 whitespace-pre-line">{product.description}</div>
              )}
              <button onClick={onAddToCart} className="mt-auto w-full py-4 rounded-full bg-black text-white font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
                <Plus size={20} /> Добавить в корзину
              </button>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="border-t border-gray-100 p-8 md:p-10">
              <h3 className="text-xl font-black text-gray-900 mb-6">Рекомендуем также</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="group cursor-pointer" onClick={() => onSelectProduct(rec)}>
                    <div className="aspect-square bg-gray-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden mb-3">
                      {rec.image ? (
                        <img src={rec.image} alt={rec.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <ImageIcon size={32} className="text-gray-300" />
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 truncate mb-1">{rec.name}</h4>
                    <p className="text-red-600 font-black text-sm">{rec.price?.toLocaleString('ru-RU')} ₸</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Cart Drawer ---------- */

function CartDrawer({ products, total, onClose, onRemove, onCheckout }: {
  products: Product[]; total: number; onClose: () => void; onRemove: (i: number) => void; onCheckout: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">Корзина</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={22} /></button>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <ShoppingCart size={48} className="mb-4 text-gray-200" />
              <p className="font-semibold">Корзина пуста</p>
              <p className="text-sm mt-1">Добавьте технику из каталога</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p, i) => (
                <div key={`${p.id}-${i}`} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-3">
                  <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-contain" /> : <ImageIcon size={20} className="text-gray-300" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{p.name}</h4>
                    <p className="text-red-600 font-black text-sm">{p.price.toLocaleString('ru-RU')} ₸</p>
                  </div>
                  <button onClick={() => onRemove(i)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shrink-0"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        {products.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 font-semibold">Итого:</span>
              <span className="text-2xl font-black text-gray-900">{total.toLocaleString('ru-RU')} ₸</span>
            </div>
            <button onClick={onCheckout} className="w-full py-4 rounded-full bg-[#25D366] text-white font-bold hover:bg-[#1ebd5a] transition-colors flex items-center justify-center gap-2">
              <MessageCircle size={20} /> Оформить в WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
