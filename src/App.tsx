import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, ShoppingCart, Menu, X, ChevronRight, Lock, Edit3, Plus, Trash2,
  Image as ImageIcon, Check, Loader2, Sparkles, ShieldCheck, Truck, Headphones,
  MessageCircle, Upload, Instagram, Phone, Mail, MapPin, FileText,
  ArrowLeft, ArrowRight, Package, MoveVertical, Clock, Award,
} from 'lucide-react';
import {
  supabase, uploadImage, saveContentSection,
  type Product, type HeroContent, type NavContent,
  type BrandingContent, type FooterContent,
  type SocialContent, type ContactsContent, type CategoriesContent,
  type FeaturesContent, type SetsContent, type RentalRulesContent,
  DEFAULT_HERO, DEFAULT_NAV, DEFAULT_BRANDING, DEFAULT_FOOTER,
  DEFAULT_SOCIAL, DEFAULT_CONTACTS, DEFAULT_CATEGORIES,
  DEFAULT_FEATURES, DEFAULT_SETS, DEFAULT_RULES,
} from '@/lib/supabase';
import {
  ProductModal, ContentModal, NavModal, FooterModal,
  SocialModal, ContactsModal, CategoriesModal,
  AdminLoginModal, ConfirmModal, RentalRulesModal, ReorderProductsModal,
  SetsContentModal, FeaturesModal,
} from '@/components/modals';

function getFeatureIcon(icon: string) {
  switch (icon) {
    case 'shield': return <ShieldCheck size={24} />;
    case 'truck': return <Truck size={24} />;
    case 'headphones': return <Headphones size={24} />;
    case 'sparkles': return <Sparkles size={24} />;
    case 'clock': return <Clock size={24} />;
    case 'award': return <Award size={24} />;
    default: return <ShieldCheck size={24} />;
  }
}

const WHATSAPP_NUMBER = '77058525780';
type Toast = { id: number; message: string; type: 'success' | 'error' };

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('ways_is_admin') === 'true' : false));
  const [products, setProducts] = useState<Product[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO);
  const [navContent, setNavContent] = useState<NavContent>(DEFAULT_NAV);
  const [branding, setBranding] = useState<BrandingContent>(DEFAULT_BRANDING);
  const [footerContent, setFooterContent] = useState<FooterContent>(DEFAULT_FOOTER);
  const [socialContent, setSocialContent] = useState<SocialContent>(DEFAULT_SOCIAL);
  const [contactsContent, setContactsContent] = useState<ContactsContent>(DEFAULT_CONTACTS);
  const [categoriesContent, setCategoriesContent] = useState<CategoriesContent>(DEFAULT_CATEGORIES);
  const [featuresContent, setFeaturesContent] = useState<FeaturesContent>(DEFAULT_FEATURES);
  const [setsContent, setSetsContent] = useState<SetsContent>(DEFAULT_SETS);
  const [rulesContent, setRulesContent] = useState<RentalRulesContent>(DEFAULT_RULES);
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
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isSetsModalOpen, setIsSetsModalOpen] = useState(false);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
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

      let orderMap: string[] | null = null;
      try {
        const localOrder = localStorage.getItem('ways_product_order');
        if (localOrder) orderMap = JSON.parse(localOrder);
      } catch {
        // ignore
      }

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
          if (r.section_id === 'features') setFeaturesContent(r.data as FeaturesContent);
          if (r.section_id === 'sets_header') setSetsContent(r.data as SetsContent);
          if (r.section_id === 'rental_rules') setRulesContent(r.data as RentalRulesContent);
          if (r.section_id === 'product_order' && (r.data as { order?: string[] })?.order) {
            orderMap = (r.data as { order: string[] }).order;
          }
        }
      }

      if (productData) {
        let loaded = productData as Product[];
        if (orderMap && Array.isArray(orderMap) && orderMap.length > 0) {
          loaded = [...loaded].sort((a, b) => {
            const idxA = orderMap!.indexOf(a.id);
            const idxB = orderMap!.indexOf(b.id);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });
        }
        setProducts(loaded);
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
        if (row.section_id === 'features') setFeaturesContent(row.data as FeaturesContent);
        if (row.section_id === 'sets_header') setSetsContent(row.data as SetsContent);
        if (row.section_id === 'rental_rules') setRulesContent(row.data as RentalRulesContent);
      })
      .subscribe();
    return () => { supabase.removeChannel(productChannel); supabase.removeChannel(contentChannel); };
  }, []);

  const handleAdminLogin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.removeItem('ways_is_admin');
      showToast('Режим редактирования выключен');
      return;
    }
    setIsAdminLoginModalOpen(true);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('ways_is_admin', 'true');
    setIsAdminLoginModalOpen(false);
    showToast('Режим редактирования включён');
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

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete);
      if (error) throw error;
      showToast('Товар удалён');
    } catch {
      showToast('Ошибка удаления', 'error');
    } finally {
      setProductToDelete(null);
    }
  };

  const handleSaveProductOrder = async (reordered: Product[]) => {
    setProducts(reordered);
    const orderIds = reordered.map((p) => p.id);
    try {
      localStorage.setItem('ways_rental_products', JSON.stringify(reordered));
      localStorage.setItem('ways_product_order', JSON.stringify(orderIds));
      await saveContentSection('product_order', { order: orderIds });
      showToast('Порядок товаров сохранён');
    } catch {
      showToast('Порядок сохранён локально');
    }
  };

  const handleMoveProduct = (productId: string, direction: 'left' | 'right') => {
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;
    const next = [...products];
    const [removed] = next.splice(index, 1);
    next.splice(targetIndex, 0, removed);
    handleSaveProductOrder(next);
  };

  const saveSection = async (sectionId: string, data: unknown, msg: string) => {
    if (await saveContentSection(sectionId, data)) showToast(msg);
    else showToast('Ошибка сохранения', 'error');
  };

  const handleSaveFeatures = async (data: FeaturesContent) => {
    setFeaturesContent(data);
    await saveSection('features', data, 'Преимущества обновлены');
  };

  const handleSaveSets = async (data: SetsContent) => {
    setSetsContent(data);
    await saveSection('sets_header', data, 'Раздел наборов обновлён');
  };

  const handleSaveRules = async (data: RentalRulesContent) => {
    setRulesContent(data);
    await saveSection('rental_rules', data, 'Правила аренды обновлены');
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

  const bundleProducts = products.filter((p) => {
    const isSet = p.category === 'sets';
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isSet && matchesSearch;
  });

  const regularProductsFiltered = products.filter((p) => {
    const isNotSet = p.category !== 'sets';
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isNotSet && matchesCategory && matchesSearch;
  });

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
      {isAdmin && (
        <div className="bg-zinc-900 text-white px-4 py-2.5 text-xs font-medium border-b border-red-500/30 sticky top-0 z-[60] shadow-sm">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <Edit3 size={14} className="text-red-400 shrink-0" />
              <span>
                <strong className="text-red-400">Режим редактирования активен:</strong> нажимайте на иконки с карандашом у любого блока для настройки, добавляйте и удаляйте технику.
              </span>
            </div>
            <button
              onClick={() => {
                setIsAdmin(false);
                showToast('Режим редактирования выключен');
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap shrink-0"
            >
              Выйти
            </button>
          </div>
        </div>
      )}

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
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'rules' || item.label.toLowerCase().includes('правил')) {
                    setIsRulesModalOpen(true);
                  } else {
                    setCurrentPage(item.id);
                  }
                }}
                className={`px-5 py-2.5 rounded-full transition-all ${currentPage === item.id ? 'text-black bg-gray-100' : 'hover:text-black hover:bg-gray-50'}`}
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button onClick={() => setIsNavModalOpen(true)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700" title="Редактировать меню">
                <Edit3 size={16} />
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white hover:bg-zinc-800 transition-all text-xs font-bold shadow-sm active:scale-95 cursor-pointer"
              title={`Корзина (${cart.length})`}
            >
              <ShoppingCart size={15} />
              <span>Корзина</span>
              {cart.length > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden max-w-7xl mx-auto mt-2 bg-white rounded-3xl shadow-lg border border-gray-100 p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'rules' || item.label.toLowerCase().includes('правил')) {
                    setIsRulesModalOpen(true);
                  } else {
                    setCurrentPage(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`px-5 py-3 rounded-xl text-left font-semibold ${currentPage === item.id ? 'bg-gray-100 text-black' : 'text-gray-600'}`}
              >
                {item.label}
              </button>
            ))}
            {!navItems.some((i) => i.id === 'rules' || i.label.toLowerCase().includes('правил')) && (
              <button
                onClick={() => { setIsRulesModalOpen(true); setIsMobileMenuOpen(false); }}
                className="px-5 py-3 rounded-xl text-left font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <FileText size={18} /> Правила аренды
              </button>
            )}
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
                      className="absolute top-4 right-4 md:top-8 md:right-12 z-20 bg-white/95 backdrop-blur-md text-black border border-gray-200 px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-2 hover:bg-white transition-all text-xs sm:text-sm">
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
                  <div className="flex items-end justify-between mb-10">
                    <div>
                      <h2 className="text-4xl font-black text-gray-900 tracking-tight">Популярное</h2>
                      <p className="text-gray-500 mt-2 font-medium">Техника, которую арендуют чаще всего</p>
                    </div>
                    <button onClick={() => setCurrentPage('catalog')} className="hidden md:flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-wider">
                      Смотреть всё <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {products.slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} isAdmin={isAdmin} catName={catName(product.category)}
                        onEdit={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                        onDelete={() => handleDeleteProduct(product.id)}
                        onDetail={() => setDetailProduct(product)}
                        onAddToCart={() => addToCart(product.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* 3 Reassurance blocks (Features) - Moved down and fully editable */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-24">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                      {featuresContent.badge && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 bg-red-50 text-red-600 rounded-full text-xs font-bold tracking-wider uppercase">
                          <Sparkles size={12} /> {featuresContent.badge}
                        </div>
                      )}
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        {featuresContent.title}
                      </h2>
                      {featuresContent.subtitle && (
                        <p className="text-sm text-gray-500 mt-1 font-medium max-w-2xl">
                          {featuresContent.subtitle}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => setIsFeaturesModalOpen(true)}
                        className="self-start sm:self-end px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all border border-zinc-200 cursor-pointer shadow-sm shrink-0"
                        title="Редактировать блоки преимуществ"
                      >
                        <Edit3 size={14} /> Редактировать преимущества
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(featuresContent.items ?? DEFAULT_FEATURES.items).map((f) => (
                      <div key={f.id} className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
                          {getFeatureIcon(f.icon)}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{f.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </main>
            )}

            {currentPage === 'catalog' && (
              <main className="pb-20 max-w-7xl mx-auto px-4 md:px-8 mt-8 sm:mt-12 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div>
                      <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">Каталог техники</h1>
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        {products.length} позиций оборудования и готовых сетов
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск по названию..."
                        className="w-full bg-gray-100 border border-gray-200 rounded-full pl-11 pr-4 py-2.5 sm:py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                      />
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsReorderModalOpen(true)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
                          title="Изменить порядок отображения товаров"
                        >
                          <MoveVertical size={16} />
                          <span className="hidden sm:inline">Порядок</span>
                        </button>
                        <button
                          onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                          className="bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-red-700 transition-colors shadow-[0_4px_20px_rgba(220,38,38,0.3)] whitespace-nowrap"
                        >
                          <Plus size={18} />
                          <span>Добавить</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories Bar */}
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex overflow-x-auto gap-2.5 pb-2 no-scrollbar flex-1">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                        activeCategory === 'all'
                          ? 'bg-black text-white shadow-md'
                          : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Все товары
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          activeCategory === cat.id
                            ? cat.id === 'sets'
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-black text-white shadow-md'
                            : cat.id === 'sets'
                            ? 'bg-red-50 text-red-900 border border-red-200 hover:bg-red-100'
                            : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat.id === 'sets' && <Sparkles size={14} className="text-red-500" />}
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setIsCategoriesModalOpen(true)}
                      className="p-2.5 shrink-0 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700 border border-gray-200"
                      title="Редактировать разделы"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>

                {/* 1. Highlighted 4 Bundle Cards Section (Sets) */}
                {(activeCategory === 'all' || activeCategory === 'sets') && bundleProducts.length > 0 && (
                  <section className="mb-14 bg-black/75 backdrop-blur-3xl text-white rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] relative overflow-hidden">
                    {/* Creative Red Liquid Gradients in several places */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/25 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-600/30 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-red-500/20 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 relative z-10">
                      <div>
                        {(setsContent.badge || DEFAULT_SETS.badge) && (
                          <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 shadow-sm">
                            <Sparkles size={12} /> {setsContent.badge || DEFAULT_SETS.badge}
                          </div>
                        )}
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {setsContent.title || DEFAULT_SETS.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-300 mt-1 whitespace-pre-line">
                          {setsContent.subtitle || DEFAULT_SETS.subtitle}
                        </p>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsSetsModalOpen(true)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors border border-zinc-700 shadow-sm cursor-pointer"
                            title="Редактировать текст раздела «Наборы»"
                          >
                            <Edit3 size={14} /> Редактировать текст
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct({
                                id: '',
                                name: 'Новый комплект',
                                category: 'sets',
                                price: 35000,
                                description: 'Состав комплекта:\n• Камера\n• Объектив\n• Питание и кейс',
                                is_new: true,
                              });
                              setIsProductModalOpen(true);
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Plus size={14} /> Добавить набор
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 relative z-10">
                      {bundleProducts.map((bundle) => {
                        const globalIndex = products.findIndex((p) => p.id === bundle.id);
                        return (
                          <BundleCard
                            key={bundle.id}
                            product={bundle}
                            isAdmin={isAdmin}
                            onEdit={() => {
                              setEditingProduct(bundle);
                              setIsProductModalOpen(true);
                            }}
                            onDelete={() => handleDeleteProduct(bundle.id)}
                            onDetail={() => setDetailProduct(bundle)}
                            onAddToCart={() => addToCart(bundle.id)}
                            onMoveLeft={() => handleMoveProduct(bundle.id, 'left')}
                            onMoveRight={() => handleMoveProduct(bundle.id, 'right')}
                            canMoveLeft={globalIndex > 0}
                            canMoveRight={globalIndex < products.length - 1}
                          />
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* 2. Regular Equipment Catalog Grid */}
                {activeCategory !== 'sets' && (
                  <div>
                    {activeCategory === 'all' && (
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                          Всё оборудование
                        </h2>
                        <span className="text-xs font-bold text-gray-400">
                          {regularProductsFiltered.length} позиций
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                      {regularProductsFiltered.map((product) => {
                        const globalIndex = products.findIndex((p) => p.id === product.id);
                        return (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isAdmin={isAdmin}
                            catName={catName(product.category)}
                            onEdit={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            onDelete={() => handleDeleteProduct(product.id)}
                            onDetail={() => setDetailProduct(product)}
                            onAddToCart={() => addToCart(product.id)}
                            onMoveLeft={() => handleMoveProduct(product.id, 'left')}
                            onMoveRight={() => handleMoveProduct(product.id, 'right')}
                            canMoveLeft={globalIndex > 0}
                            canMoveRight={globalIndex < products.length - 1}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                  <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 px-4">
                    <ImageIcon size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ничего не найдено</h3>
                    <p className="text-gray-500 text-sm max-w-sm mb-4">
                      По вашему запросу «{searchQuery}» техника не найдена. Попробуйте изменить параметры поиска.
                    </p>
                    <button
                      onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                      className="text-xs font-bold uppercase tracking-wider bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                )}
              </main>
            )}

            {currentPage === 'contacts' && (
              <main className="pb-24 max-w-3xl mx-auto px-4 md:px-8 mt-6 sm:mt-10 animate-in fade-in duration-500">
                <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-10 shadow-sm relative">
                  <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <Phone size={20} className="sm:w-6 sm:h-6" />
                      </div>
                      <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">Контакты</h1>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => setIsContactsModalOpen(true)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-2 rounded-full font-semibold transition-all text-xs sm:text-sm flex items-center gap-1.5 shrink-0"
                      >
                        <Edit3 size={14} /> Редактировать
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-4 mb-6">
                    <div className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100">
                      <Phone size={18} className="text-red-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] text-gray-400 font-semibold mb-0.5">Телефон / WhatsApp</div>
                        <a href={`tel:+77058525780`} className="text-sm sm:text-base font-bold text-gray-900 hover:text-red-600 transition-colors block">
                          +7 (705) 852-57-80
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100">
                      <Mail size={18} className="text-red-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] text-gray-400 font-semibold mb-0.5">Email</div>
                        <a href="mailto:info@waysrental.kz" className="text-sm sm:text-base font-bold text-gray-900 hover:text-red-600 transition-colors block truncate">
                          info@waysrental.kz
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100">
                      <MapPin size={18} className="text-red-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] text-gray-400 font-semibold mb-0.5">Адрес</div>
                        <span className="text-sm sm:text-base font-bold text-gray-900 block">
                          Алматы, Казахстан
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Здравствуйте! Хочу уточнить информацию по аренде техники.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 sm:py-4 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.98]"
                    >
                      <MessageCircle size={20} /> Написать в WhatsApp
                    </a>
                  </div>

                  {contactsContent.text && (
                    <div className="mt-6 pt-6 border-t border-gray-100 text-xs sm:text-sm text-gray-500 leading-relaxed space-y-1">
                      {contactsContent.text.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              </main>
            )}

            {currentPage === 'rules' && (
              <main className="pb-24 max-w-3xl mx-auto px-4 md:px-8 mt-6 sm:mt-10 animate-in fade-in duration-500">
                <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-10 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <FileText size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">Правила аренды</h1>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Условия проката техники в WAYS Rental</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { num: '01', title: 'Документы', desc: 'Для оформления договора аренды требуется оригинал удостоверения личности или паспорта Республики Казахстан.' },
                      { num: '02', title: 'Залог и проверка', desc: 'Оборудование выдаётся под залог либо после экспресс-проверки данных арендатора.' },
                      { num: '03', title: 'Расчёт смены (24 часа)', desc: 'Одна смена аренды равна 24 часам с момента выдачи техники. Время возврата фиксируется в акте приёма-передачи.' },
                      { num: '04', title: 'Проверка и возврат', desc: 'Арендатор проверяет технику при получении. Возврат производится в исправном, чистом виде и полной комплектации.' },
                      { num: '05', title: 'Бронирование и оплата', desc: 'Бронирование подтверждается после согласования в WhatsApp. Оплата принимается наличными или переводом.' },
                    ].map((rule) => (
                      <div key={rule.num} className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3.5">
                        <span className="font-mono text-xs sm:text-sm font-black text-red-600 bg-red-100/60 px-2 py-1 rounded-lg shrink-0">
                          {rule.num}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1">{rule.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{rule.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400 text-center sm:text-left">
                      Остались вопросы по условиям аренды? Напишите нам!
                    </p>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Здравствуйте! У меня есть вопрос по правилам аренды техники.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 shrink-0"
                    >
                      <MessageCircle size={16} /> Написать в WhatsApp
                    </a>
                  </div>
                </div>
              </main>
            )}
          </>
        )}
      </div>

      <footer className="bg-white border-t border-gray-100 py-12 md:py-16 mt-auto relative pb-28 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="cursor-pointer" onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Логотип" className="h-8 w-auto max-w-[120px] object-contain mb-2" />
              ) : (
                <span className="text-xl font-black text-gray-900 tracking-tight">WAYS</span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">{footerContent.copyright}</p>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 font-semibold items-center justify-center text-xs sm:text-sm">
            {footerLinks
              .filter((link) => !link.label.toLowerCase().includes('правил'))
              .map((link, i) => (
              <button
                key={i}
                onClick={() => {
                  if (link.label.toLowerCase().includes('контакт')) {
                    setCurrentPage('contacts');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setCurrentPage('catalog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="hover:text-black transition-colors px-1 py-1 text-gray-600 cursor-pointer"
              >
                {link.label}
              </button>
            ))}

            {/* Instagram - logo only, without text */}
            {socialContent.instagramUrl ? (
              <a
                href={socialContent.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#962fbf] text-white flex items-center justify-center hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
                title="Instagram"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            ) : (
              <span
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#962fbf] text-white flex items-center justify-center opacity-70 shrink-0"
                title="Instagram"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </span>
            )}

            {isAdmin && (
              <div className="flex items-center gap-1">
                <button onClick={() => setIsSocialModalOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700" title="Редактировать Instagram">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => setIsFooterModalOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700" title="Редактировать подвал">
                  <Edit3 size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleAdminLogin}
          className={`absolute bottom-6 left-6 p-2.5 sm:p-3 rounded-full transition-all duration-300 shadow-sm border ${
            isAdmin
              ? 'bg-red-600 text-white border-red-500 shadow-red-500/30'
              : 'bg-white border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 hover:shadow-md'
          }`}
          title={isAdmin ? 'Выключить режим редактирования' : 'Режим редактирования'}
          aria-label="Режим редактирования"
        >
          {isAdmin ? <Edit3 size={16} /> : <Lock size={16} />}
        </button>
      </footer>

      {/* Floating cart button at bottom right */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-black text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:bg-gray-900 transition-all hover:scale-105 active:scale-95 flex items-center justify-center border-2 border-white/20"
        title={`Корзина (${cart.length})`}
        aria-label="Корзина"
      >
        <ShoppingCart size={22} className="sm:w-6 sm:h-6" />
        {cart.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] sm:text-xs font-black min-w-[20px] sm:min-w-[22px] h-[20px] sm:h-[22px] px-1 rounded-full flex items-center justify-center shadow-md">
            {cart.length}
          </span>
        )}
      </button>

      {isCartOpen && <CartDrawer products={cartProducts} total={cartTotal} onClose={() => setIsCartOpen(false)} onRemove={removeFromCart} onCheckout={handleCheckout} />}
      {isProductModalOpen && <ProductModal product={editingProduct} categories={categories} onSave={handleSaveProduct} onClose={() => setIsProductModalOpen(false)} />}
      {isContentModalOpen && <ContentModal initialData={heroContent} onSave={(d) => { saveSection('hero', d, 'Баннер обновлён'); setIsContentModalOpen(false); }} onClose={() => setIsContentModalOpen(false)} />}
      {isNavModalOpen && <NavModal initialData={navContent} onSave={(d) => { saveSection('nav', d, 'Меню обновлено'); setIsNavModalOpen(false); }} onClose={() => setIsNavModalOpen(false)} />}
      {isFooterModalOpen && <FooterModal initialData={footerContent} onSave={(d) => { saveSection('footer', d, 'Подвал обновлён'); setIsFooterModalOpen(false); }} onClose={() => setIsFooterModalOpen(false)} />}
      {isSocialModalOpen && <SocialModal initialData={socialContent} onSave={(d) => { saveSection('social', d, 'Instagram обновлён'); setIsSocialModalOpen(false); }} onClose={() => setIsSocialModalOpen(false)} />}
      {isContactsModalOpen && <ContactsModal initialData={contactsContent} onSave={(d) => { saveSection('contacts', d, 'Контакты обновлены'); setIsContactsModalOpen(false); }} onClose={() => setIsContactsModalOpen(false)} />}
      {isCategoriesModalOpen && <CategoriesModal initialData={categoriesContent} onSave={(d) => { saveSection('categories', d, 'Разделы обновлены'); setIsCategoriesModalOpen(false); }} onClose={() => setIsCategoriesModalOpen(false)} />}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLogin={handleAdminLoginSuccess}
      />
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Удаление товара"
        message="Вы уверены, что хотите безвозвратно удалить этот товар из каталога?"
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDeleteProduct}
      />
      <RentalRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        whatsappNumber={WHATSAPP_NUMBER}
        isAdmin={isAdmin}
        content={rulesContent}
        onSaveRules={handleSaveRules}
      />
      <SetsContentModal
        isOpen={isSetsModalOpen}
        content={setsContent}
        onSave={(d) => { handleSaveSets(d); setIsSetsModalOpen(false); }}
        onClose={() => setIsSetsModalOpen(false)}
      />
      <FeaturesModal
        isOpen={isFeaturesModalOpen}
        content={featuresContent}
        onSave={(d) => { handleSaveFeatures(d); setIsFeaturesModalOpen(false); }}
        onClose={() => setIsFeaturesModalOpen(false)}
      />
      <ReorderProductsModal
        isOpen={isReorderModalOpen}
        products={products}
        onClose={() => setIsReorderModalOpen(false)}
        onSaveOrder={handleSaveProductOrder}
      />
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          allProducts={products}
          catName={catName(detailProduct.category)}
          onClose={() => setDetailProduct(null)}
          onAddToCart={() => {
            addToCart(detailProduct.id);
            setDetailProduct(null);
          }}
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

function ProductCard({
  product, isAdmin, catName, onEdit, onDelete, onDetail, onMoveLeft, onMoveRight, canMoveLeft, canMoveRight,
}: {
  product: Product; isAdmin: boolean; catName: string;
  onEdit: () => void; onDelete: () => void; onDetail: () => void; onAddToCart?: () => void;
  onMoveLeft?: () => void; onMoveRight?: () => void;
  canMoveLeft?: boolean; canMoveRight?: boolean;
}) {
  return (
    <div className="group flex flex-col bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative cursor-pointer" onClick={onDetail}>
      {isAdmin && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center gap-1 bg-white/95 backdrop-blur rounded-full p-1 border border-gray-200 shadow-md" onClick={(e) => e.stopPropagation()}>
          {onMoveLeft && (
            <button
              onClick={onMoveLeft}
              disabled={!canMoveLeft}
              className={`p-1 rounded-full transition-colors ${canMoveLeft ? 'text-gray-600 hover:bg-gray-100 hover:text-black' : 'text-gray-300 cursor-not-allowed'}`}
              title="Переместить назад"
            >
              <ArrowLeft size={13} />
            </button>
          )}
          {onMoveRight && (
            <button
              onClick={onMoveRight}
              disabled={!canMoveRight}
              className={`p-1 rounded-full transition-colors ${canMoveRight ? 'text-gray-600 hover:bg-gray-100 hover:text-black' : 'text-gray-300 cursor-not-allowed'}`}
              title="Переместить вперёд"
            >
              <ArrowRight size={13} />
            </button>
          )}
          <button onClick={onEdit} className="p-1 hover:bg-blue-50 text-blue-600 rounded-full transition-colors" title="Редактировать">
            <Edit3 size={13} />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-red-50 text-red-600 rounded-full transition-colors" title="Удалить">
            <Trash2 size={13} />
          </button>
        </div>
      )}
      <div className="relative aspect-square bg-gray-50/50 p-2.5 sm:p-6 flex items-center justify-center overflow-hidden">
        {product.is_new && <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-500 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-wider z-10">Новинка</span>}
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=Нет+фото'; }} />
        ) : (
          <div className="text-gray-300 flex flex-col items-center"><ImageIcon size={28} className="sm:w-12 sm:h-12" /><span className="text-[10px] sm:text-xs mt-1 sm:mt-2">Нет фото</span></div>
        )}
      </div>
      <div className="p-2.5 sm:p-6 flex flex-col flex-grow bg-white border-t border-gray-50">
        <div className="text-[9px] sm:text-[11px] text-gray-400 mb-0.5 sm:mb-2 font-bold uppercase tracking-widest truncate">{catName}</div>
        <h3 className="text-xs sm:text-xl font-bold text-gray-900 mb-2 sm:mb-6 leading-snug line-clamp-2 hover:text-red-600 transition-colors">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between gap-1">
          <div className="min-w-0">
            <div className="text-[8px] sm:text-[11px] text-gray-500 mb-0.5 sm:mb-1 font-semibold">Смена (24ч)</div>
            <div className="text-xs sm:text-2xl font-black text-gray-900 truncate">{product.price?.toLocaleString('ru-RU')} ₸</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetail();
            }}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-black hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95 shrink-0"
            title="Подробнее и аренда"
          >
            <Plus size={15} className="sm:hidden" />
            <Plus size={20} className="hidden sm:block" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Highlighted Bundle Card ---------- */

function BundleCard({
  product, isAdmin, onEdit, onDelete, onDetail, onMoveLeft, onMoveRight, canMoveLeft, canMoveRight,
}: {
  product: Product; isAdmin: boolean;
  onEdit: () => void; onDelete: () => void; onDetail: () => void; onAddToCart?: () => void;
  onMoveLeft?: () => void; onMoveRight?: () => void;
  canMoveLeft?: boolean; canMoveRight?: boolean;
}) {
  return (
    <div
      className="group relative flex flex-col bg-white/[0.03] backdrop-blur-md text-white rounded-2xl sm:rounded-[2rem] border border-white/10 hover:border-red-500/50 hover:bg-white/[0.07] shadow-lg hover:shadow-2xl hover:shadow-red-950/20 transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onDetail}
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-2xl pointer-events-none group-hover:bg-red-600/25 transition-all" />

      {/* Admin actions */}
      {isAdmin && (
        <div
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-full border border-zinc-700 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {onMoveLeft && (
            <button
              onClick={onMoveLeft}
              disabled={!canMoveLeft}
              className={`p-1 rounded-full transition-colors ${canMoveLeft ? 'hover:bg-zinc-800 text-gray-300 hover:text-white' : 'opacity-30 cursor-not-allowed text-gray-600'}`}
              title="Переместить назад"
            >
              <ArrowLeft size={13} />
            </button>
          )}
          {onMoveRight && (
            <button
              onClick={onMoveRight}
              disabled={!canMoveRight}
              className={`p-1 rounded-full transition-colors ${canMoveRight ? 'hover:bg-zinc-800 text-gray-300 hover:text-white' : 'opacity-30 cursor-not-allowed text-gray-600'}`}
              title="Переместить вперёд"
            >
              <ArrowRight size={13} />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1 rounded-full hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 transition-colors"
            title="Редактировать набор"
          >
            <Edit3 size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-full hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-colors"
            title="Удалить набор"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {/* Badge */}
      <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20 flex flex-wrap gap-1">
        {product.is_new && (
          <span className="bg-zinc-800/90 text-zinc-300 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Хит
          </span>
        )}
      </div>

      {/* Image container */}
      <div className="relative aspect-square sm:aspect-[4/3] bg-white/[0.02] p-3.5 sm:p-6 flex items-center justify-center overflow-hidden border-b border-white/5">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 filter drop-shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/18181b/ffffff?text=Комплект';
            }}
          />
        ) : (
          <div className="text-zinc-600 flex flex-col items-center">
            <Package size={36} className="sm:w-12 sm:h-12 text-zinc-500" />
            <span className="text-[10px] sm:text-xs mt-2 text-zinc-400">Техника</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow bg-transparent">
        <h3 className="text-xs sm:text-lg font-black text-white mb-2 leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="hidden sm:line-clamp-2 text-xs text-zinc-300 mb-4 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-2 sm:pt-3 border-t border-white/10 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[8px] sm:text-[10px] text-zinc-300 font-medium">Смена (24ч)</div>
            <div className="text-xs sm:text-xl font-black text-white truncate">
              {product.price?.toLocaleString('ru-RU')} ₸
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetail();
            }}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1 transition-all shadow-md active:scale-95 shrink-0"
            title="Подробнее и аренда"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">В корзину</span>
          </button>
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
