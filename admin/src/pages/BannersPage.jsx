import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Image, Info, Layers, Pencil, Plus, Trash2, X, Zap, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

// ─── Banner type metadata ────────────────────────────────────────────────────
const BANNER_TYPES = {
  hero: {
    label: 'Hero Slider',
    color: 'text-glow-magenta',
    bg: 'bg-glow-magenta/10 border-glow-magenta/30',
    where: 'Top of homepage — full-screen rotating slider',
    size: '1920 × 1080 px  (16:9)',
    tip: 'Use high-quality product or lifestyle photos. Keep text short.',
    icon: '🖼️',
  },
  promo: {
    label: 'Promo Card',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30',
    where: 'Homepage promo card section (BOGO, SALE, etc.)',
    size: '800 × 800 px  (1:1 square)',
    tip: 'Managed via Content → Promo Cards tab for full customisation.',
    icon: '🎁',
  },
  announcement: {
    label: 'Announcement Bar',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    where: 'Thin bar below the top ticker strip',
    size: 'No image needed — text only',
    tip: 'Managed via Content → Announcement tab.',
    icon: '📢',
  },
  slider: {
    label: 'Compact Slider',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/30',
    where: 'Horizontal card slider below promo cards',
    size: '800 × 400 px  (2:1)',
    tip: 'Good for category highlights or seasonal campaigns.',
    icon: '🎠',
  },
  flash: {
    label: 'Flash Sale Banner',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/30',
    where: 'Flash sale section — shows countdown + product',
    size: 'Controlled via Settings → Flash Sale tab',
    tip: 'Set the product and end time in Settings to control flash sale.',
    icon: '⚡',
  },
  popup: {
    label: 'Popup Banner',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/30',
    where: 'Appears as modal popup after page load delay',
    size: '600 × 400 px  (3:2)',
    tip: 'Use sparingly — one popup at a time.',
    icon: '💬',
  },
};

const ALL_TYPES = Object.keys(BANNER_TYPES);

const GRADIENTS = [
  'from-[#D5106E] via-[#9B2FD0] to-[#6E3992]',
  'from-[#D5106E] to-[#FF6B35]',
  'from-[#6E3992] to-[#3B82F6]',
  'from-[#059669] to-[#0891B2]',
  'from-[#F59E0B] to-[#EF4444]',
  'from-[#1E1B4B] to-[#4C1D95]',
  'from-[#ec4899] to-[#f97316]',
  'from-[#06b6d4] to-[#6366f1]',
];

const emptyForm = {
  title: '', subtitle: '', badgeText: '', buttonText: 'Shop Now',
  buttonLink: '/products', secondaryButtonText: '', secondaryButtonLink: '',
  imageUrl: '', gradient: GRADIENTS[0], overlayColor: 'rgba(11,11,18,0.55)',
  type: 'hero', isActive: true, order: 0,
};

export default function BannersPage() {
  const [banners, setBanners]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab]   = useState('all');
  // Flash sale product picker
  const [products, setProducts]     = useState([]);
  const [flashSettings, setFlashSettings] = useState({});
  const [productSearch, setProductSearch] = useState('');
  const [savingFlash, setSavingFlash] = useState(false);

  useEffect(() => {
    fetchBanners();
    fetchProducts();
    fetchFlashSettings();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/banners/all');
      setBanners(data.banners || []);
    } catch { toast.error('Failed to load banners'); }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products || []);
    } catch { /* silent */ }
  };

  const fetchFlashSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      const s = data.settings || {};
      setFlashSettings({
        flash_sale_enabled: s.flash_sale_enabled || false,
        flash_sale_product_id: s.flash_sale_product_id || '',
        flash_sale_end_time: s.flash_sale_end_time || '',
        flash_sale_discount_text: s.flash_sale_discount_text || '40% OFF',
        flash_sale_title: s.flash_sale_title || 'Flash Sale — Today Only',
        flash_sale_subtitle: s.flash_sale_subtitle || 'Limited time, limited stock.',
      });
    } catch { /* silent */ }
  };

  const saveFlashSettings = async () => {
    setSavingFlash(true);
    try {
      await api.put('/settings', { settings: flashSettings });
      toast.success('Flash sale settings saved!');
    } catch { toast.error('Failed to save'); }
    setSavingFlash(false);
  };

  const openCreate = (defaultType = 'hero') => {
    setEditingBanner(null);
    setForm({ ...emptyForm, type: defaultType });
    setShowModal(true);
  };
  const openEdit = (b) => {
    setEditingBanner(b);
    setForm({
      title: b.title || '', subtitle: b.subtitle || '', badgeText: b.badgeText || '',
      buttonText: b.buttonText || 'Shop Now', buttonLink: b.buttonLink || '/products',
      secondaryButtonText: b.secondaryButtonText || '', secondaryButtonLink: b.secondaryButtonLink || '',
      imageUrl: b.imageUrl || '', gradient: b.gradient || GRADIENTS[0],
      overlayColor: b.overlayColor || 'rgba(11,11,18,0.55)',
      type: b.type || 'hero', isActive: b.isActive ?? true, order: b.order ?? 0,
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingBanner(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBanner) {
        const { data } = await api.put(`/banners/${editingBanner._id}`, form);
        setBanners(p => p.map(b => b._id === editingBanner._id ? data.banner : b));
        toast.success('Banner updated!');
      } else {
        const { data } = await api.post('/banners', form);
        setBanners(p => [data.banner, ...p]);
        toast.success('Banner created!');
      }
      closeModal();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save banner'); }
    setSubmitting(false);
  };

  const toggleActive = async (banner) => {
    try {
      const { data } = await api.put(`/banners/${banner._id}`, { isActive: !banner.isActive });
      setBanners(p => p.map(b => b._id === banner._id ? data.banner : b));
      toast.success(data.banner.isActive ? 'Banner activated' : 'Banner deactivated');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      setBanners(p => p.filter(b => b._id !== id));
      toast.success('Banner deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filteredBanners = activeTab === 'all' ? banners : banners.filter(b => b.type === activeTab);
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-glow-magenta" /> Banner Manager
          </h2>
          <p className="text-sm text-gray-400 mt-1">Control every banner on your site — where it appears, what it shows, and when</p>
        </div>
        <button type="button" className="btn-primary gap-2" onClick={() => openCreate()}>
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      {/* ─── Site Map ──────────────────────────────────────────────── */}
      <div className="panel p-5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
          <Info className="h-4 w-4" /> Where Each Banner Type Appears on Your Site
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(BANNER_TYPES).map(([type, meta]) => {
            const count = banners.filter(b => b.type === type).length;
            const active = banners.filter(b => b.type === type && b.isActive).length;
            return (
              <div key={type} className={`rounded-xl border p-4 ${meta.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.icon}</span>
                    <span className={`text-sm font-bold ${meta.color}`}>{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-emerald-400 font-semibold">{active} live</span>
                    <span className="text-xs text-gray-500">/ {count}</span>
                  </div>
                </div>
                <p className="text-xs text-white/70 mb-1">📍 {meta.where}</p>
                <p className="text-xs text-gray-500">📐 {meta.size}</p>
                <button type="button" onClick={() => openCreate(type)}
                  className="mt-2 text-xs text-glow-magenta hover:underline">
                  + Add {meta.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Flash Sale Manager ─────────────────────────────────────── */}
      <div className="panel p-5 border border-orange-500/20">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-orange-400" /> Flash Sale Manager
          <span className="text-xs font-normal text-gray-400 ml-1">— controls the countdown + product on the homepage flash sale section</span>
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Enable toggle */}
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 col-span-full sm:col-span-1">
            <div>
              <p className="text-sm font-medium text-white">Flash Sale Active</p>
              <p className="text-xs text-gray-400">Show flash sale section on homepage</p>
            </div>
            <input type="checkbox" className="sr-only" checked={!!flashSettings.flash_sale_enabled}
              onChange={e => setFlashSettings(p => ({ ...p, flash_sale_enabled: e.target.checked }))} />
            <div className={`relative h-6 w-11 rounded-full transition-colors ${flashSettings.flash_sale_enabled ? 'bg-orange-500' : 'bg-white/15'}`}>
              <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${flashSettings.flash_sale_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>

          {/* Title */}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Section Title</span>
            <input className="input" value={flashSettings.flash_sale_title || ''} onChange={e => setFlashSettings(p => ({ ...p, flash_sale_title: e.target.value }))} placeholder="Flash Sale — Today Only" />
          </label>

          {/* Discount text */}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Discount Badge Text</span>
            <input className="input" value={flashSettings.flash_sale_discount_text || ''} onChange={e => setFlashSettings(p => ({ ...p, flash_sale_discount_text: e.target.value }))} placeholder="40% OFF" />
          </label>

          {/* End time */}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Sale Ends At (Date & Time)</span>
            <input className="input" type="datetime-local" value={flashSettings.flash_sale_end_time ? flashSettings.flash_sale_end_time.slice(0,16) : ''}
              onChange={e => setFlashSettings(p => ({ ...p, flash_sale_end_time: e.target.value ? new Date(e.target.value).toISOString() : '' }))} />
          </label>

          {/* Product search */}
          <div className="col-span-full">
            <span className="mb-1 block text-xs font-medium text-gray-400">Flash Sale Product</span>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input className="input pl-8" placeholder="Search products by name or category..." value={productSearch}
                onChange={e => setProductSearch(e.target.value)} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-64 overflow-y-auto">
              {filteredProducts.slice(0, 18).map(p => {
                const selected = flashSettings.flash_sale_product_id === p._id;
                return (
                  <button key={p._id} type="button"
                    onClick={() => setFlashSettings(prev => ({ ...prev, flash_sale_product_id: p._id }))}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selected ? 'border-orange-500/60 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-gray-500">
                        <Image className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className={`truncate text-xs font-semibold ${selected ? 'text-orange-300' : 'text-white'}`}>{p.name}</p>
                      <p className="text-xs text-gray-400">৳{p.price}</p>
                    </div>
                    {selected && <span className="ml-auto text-orange-400 text-xs font-bold shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-span-full flex justify-end">
            <button type="button" className="btn-primary gap-2" onClick={saveFlashSettings} disabled={savingFlash}>
              <Zap className="h-4 w-4" /> {savingFlash ? 'Saving...' : 'Save Flash Sale Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Banner List ───────────────────────────────────────────── */}
      {/* Tab filter */}
      <div className="flex flex-wrap gap-1.5">
        {['all', ...ALL_TYPES].map(t => (
          <button key={t} type="button" onClick={() => setActiveTab(t)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition capitalize ${activeTab === t ? 'bg-glow-magenta text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
            {t === 'all' ? `All (${banners.length})` : `${BANNER_TYPES[t]?.icon} ${t} (${banners.filter(b => b.type === t).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="panel p-8 text-center text-gray-400">Loading banners...</div>
      ) : filteredBanners.length === 0 ? (
        <div className="panel flex flex-col items-center py-16 text-center">
          <Image className="h-12 w-12 text-gray-600 mb-4" />
          <p className="text-gray-400">No {activeTab === 'all' ? '' : activeTab} banners yet.</p>
          <button type="button" className="btn-primary mt-4 gap-2" onClick={() => openCreate(activeTab === 'all' ? 'hero' : activeTab)}>
            <Plus className="h-4 w-4" /> Create Banner
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBanners.map(banner => {
            const meta = BANNER_TYPES[banner.type];
            return (
              <motion.div key={banner._id} layout className="panel overflow-hidden">
                {/* Type badge */}
                <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between ${meta?.bg || 'bg-white/5'}`}>
                  <span className={meta?.color || 'text-gray-400'}>{meta?.icon} {banner.type} — {meta?.where?.split('—')[0].trim()}</span>
                  <span className={`rounded-full px-2 py-0.5 ${banner.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {banner.isActive ? 'LIVE' : 'OFF'}
                  </span>
                </div>

                {/* Preview */}
                <div className={`relative h-28 bg-gradient-to-r ${banner.gradient}`}>
                  {banner.imageUrl && (
                    <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-60" />
                  )}
                  <div className="absolute inset-0 flex flex-col justify-center px-4" style={{ backgroundColor: banner.overlayColor }}>
                    {banner.badgeText && <span className="mb-1 inline-block max-w-max rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">{banner.badgeText}</span>}
                    <p className="text-base font-bold text-white line-clamp-1">{banner.title}</p>
                    <p className="text-xs text-white/70 line-clamp-1">{banner.subtitle}</p>
                  </div>
                </div>

                {/* Size hint */}
                <div className="px-3 py-1 bg-white/[0.02] border-t border-white/5">
                  <p className="text-[10px] text-gray-500">📐 Recommended: {meta?.size}</p>
                </div>

                <div className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{banner.title}</p>
                    <p className="text-xs text-gray-400">Order: {banner.order}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => toggleActive(banner)}
                      className={`rounded-lg p-1.5 transition ${banner.isActive ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-500 hover:bg-white/5'}`}>
                      {banner.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={() => openEdit(banner)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(banner._id)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── Create / Edit Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="panel w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{editingBanner ? 'Edit Banner' : 'Create Banner'}</h2>
                  {form.type && BANNER_TYPES[form.type] && (
                    <p className="text-xs text-gray-400 mt-0.5">{BANNER_TYPES[form.type].icon} {BANNER_TYPES[form.type].where}</p>
                  )}
                </div>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              {/* Size guidance */}
              {form.type && BANNER_TYPES[form.type] && (
                <div className={`mb-4 rounded-xl border p-3 text-xs ${BANNER_TYPES[form.type].bg}`}>
                  <span className={`font-bold ${BANNER_TYPES[form.type].color}`}>📐 Image size: {BANNER_TYPES[form.type].size}</span>
                  <span className="text-gray-400 ml-2">— {BANNER_TYPES[form.type].tip}</span>
                </div>
              )}

              {/* Live preview */}
              <div className={`mb-5 h-28 rounded-2xl bg-gradient-to-r ${form.gradient} relative overflow-hidden`}>
                {form.imageUrl && <img src={form.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-60" />}
                <div className="absolute inset-0 flex flex-col justify-center px-6" style={{ backgroundColor: form.overlayColor }}>
                  {form.badgeText && <span className="mb-1 inline-block max-w-max rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">{form.badgeText}</span>}
                  <p className="text-xl font-bold text-white">{form.title || 'Banner Title'}</p>
                  <p className="text-sm text-white/70">{form.subtitle || 'Subtitle text here'}</p>
                  {form.buttonText && <div className="mt-2"><span className="rounded-full bg-glow-magenta px-4 py-1 text-xs font-semibold text-white">{form.buttonText}</span></div>}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                {/* Type */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Banner Type</span>
                  <select className="input" name="type" value={form.type} onChange={handleChange}>
                    {ALL_TYPES.map(t => (
                      <option key={t} value={t}>{BANNER_TYPES[t]?.icon} {BANNER_TYPES[t]?.label} — {BANNER_TYPES[t]?.where?.split('—')[0].trim()}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Display Order</span>
                  <input className="input" type="number" name="order" value={form.order} onChange={handleChange} />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Title *</span>
                  <input className="input" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Glow Sale — Up to 40% Off!" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Subtitle</span>
                  <input className="input" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="e.g. Limited time offer on all skincare" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Badge Text</span>
                  <input className="input" name="badgeText" value={form.badgeText} onChange={handleChange} placeholder="New Arrival" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Image URL <span className="text-gray-500 font-normal">(optional — use recommended size above)</span></span>
                  <input className="input" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/banner.jpg" />
                  {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-16 rounded-lg object-cover" onError={e => e.target.style.display='none'} />}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Primary Button Text</span>
                  <input className="input" name="buttonText" value={form.buttonText} onChange={handleChange} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Primary Button Link</span>
                  <input className="input" name="buttonLink" value={form.buttonLink} onChange={handleChange} placeholder="/products" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Secondary Button Text</span>
                  <input className="input" name="secondaryButtonText" value={form.secondaryButtonText} onChange={handleChange} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Secondary Button Link</span>
                  <input className="input" name="secondaryButtonLink" value={form.secondaryButtonLink} onChange={handleChange} />
                </label>
                <div className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Gradient Background</span>
                  <div className="flex flex-wrap gap-2">
                    {GRADIENTS.map(g => (
                      <button key={g} type="button" onClick={() => setForm(p => ({ ...p, gradient: g }))}
                        className={`h-8 w-16 rounded-lg bg-gradient-to-r ${g} transition ${form.gradient === g ? 'ring-2 ring-glow-magenta ring-offset-2 ring-offset-midnight scale-110' : ''}`} />
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium cursor-pointer md:col-span-2">
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="h-4 w-4 accent-glow-magenta" />
                  <span className="text-white">Active (visible on site immediately)</span>
                </label>
                <div className="flex justify-end gap-3 md:col-span-2 pt-2">
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

