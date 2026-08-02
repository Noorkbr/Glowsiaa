import { AnimatePresence, motion } from 'framer-motion';
import { Image, Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const TYPES = ['hero', 'promo', 'announcement'];
const GRADIENTS = [
  'from-[#D5106E] via-[#9B2FD0] to-[#6E3992]',
  'from-[#D5106E] to-[#FF6B35]',
  'from-[#6E3992] to-[#3B82F6]',
  'from-[#059669] to-[#0891B2]',
  'from-[#F59E0B] to-[#EF4444]',
  'from-[#1E1B4B] to-[#4C1D95]',
];

const emptyForm = {
  title: '', subtitle: '', badgeText: '', buttonText: 'Shop Now',
  buttonLink: '/products', secondaryButtonText: '', secondaryButtonLink: '',
  imageUrl: '', gradient: GRADIENTS[0], overlayColor: 'rgba(11,11,18,0.55)',
  type: 'hero', isActive: true, order: 0,
};

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/banners/all');
      setBanners(data.banners || []);
    } catch (e) { toast.error('Failed to load banners'); }
    setLoading(false);
  };

  const openCreate = () => { setEditingBanner(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b) => {
    setEditingBanner(b);
    // Spread only the known form fields — never include _id, __v, createdAt
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      badgeText: b.badgeText || '',
      buttonText: b.buttonText || 'Shop Now',
      buttonLink: b.buttonLink || '/products',
      secondaryButtonText: b.secondaryButtonText || '',
      secondaryButtonLink: b.secondaryButtonLink || '',
      imageUrl: b.imageUrl || '',
      gradient: b.gradient || GRADIENTS[0],
      overlayColor: b.overlayColor || 'rgba(11,11,18,0.55)',
      type: b.type || 'hero',
      isActive: b.isActive ?? true,
      order: b.order ?? 0,
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
      // Only send the single changed field — never spread the full MongoDB document
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Banner Manager</h2>
          <p className="text-sm text-gray-400 mt-1">Control hero banners, promotional banners and announcements</p>
        </div>
        <button type="button" className="btn-primary gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {['hero','promo','announcement'].map(type => (
          <div key={type} className="panel p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400">{type} banners</p>
            <p className="text-3xl font-bold text-white mt-1">{banners.filter(b => b.type === type).length}</p>
            <p className="text-xs text-emerald-300 mt-1">{banners.filter(b => b.type === type && b.isActive).length} active</p>
          </div>
        ))}
        <div className="panel p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400">Total</p>
          <p className="text-3xl font-bold text-white mt-1">{banners.length}</p>
          <p className="text-xs text-emerald-300 mt-1">{banners.filter(b => b.isActive).length} active</p>
        </div>
      </div>

      {loading ? (
        <div className="panel p-8 text-center text-gray-400">Loading banners...</div>
      ) : (
        <div className="space-y-4">
          {TYPES.map(type => {
            const typeBanners = banners.filter(b => b.type === type);
            if (typeBanners.length === 0) return null;
            return (
              <div key={type}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-glow-magenta">{type} Banners</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {typeBanners.map(banner => (
                    <motion.div
                      key={banner._id}
                      layout
                      className="panel overflow-hidden"
                    >
                      {/* Preview */}
                      <div
                        className={`relative h-32 bg-gradient-to-r ${banner.gradient} cursor-pointer`}
                        onClick={() => setPreview(banner)}
                      >
                        {banner.imageUrl && (
                          <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-60" />
                        )}
                        <div className="absolute inset-0 flex flex-col justify-center px-4" style={{ backgroundColor: banner.overlayColor }}>
                          {banner.badgeText && (
                            <span className="mb-1 inline-block max-w-max rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">{banner.badgeText}</span>
                          )}
                          <p className="text-lg font-bold text-white line-clamp-1">{banner.title}</p>
                          <p className="text-xs text-white/70 line-clamp-1">{banner.subtitle}</p>
                        </div>
                        <div className="absolute right-2 top-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${banner.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                            {banner.isActive ? 'LIVE' : 'OFF'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{banner.title}</p>
                          <p className="text-xs text-gray-400">Order: {banner.order} · {banner.type}</p>
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
                  ))}
                </div>
              </div>
            );
          })}

          {banners.length === 0 && (
            <div className="panel flex flex-col items-center py-16 text-center">
              <Image className="h-12 w-12 text-gray-600 mb-4" />
              <p className="text-gray-400">No banners yet. Create your first banner to get started.</p>
              <button type="button" className="btn-primary mt-4 gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Create Banner
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="panel w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{editingBanner ? 'Edit Banner' : 'Create Banner'}</h2>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              {/* Live preview */}
              <div className={`mb-6 h-32 rounded-2xl bg-gradient-to-r ${form.gradient} relative overflow-hidden`}>
                {form.imageUrl && <img src={form.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-60" />}
                <div className="absolute inset-0 flex flex-col justify-center px-6" style={{ backgroundColor: form.overlayColor }}>
                  {form.badgeText && <span className="mb-1 inline-block max-w-max rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">{form.badgeText}</span>}
                  <p className="text-xl font-bold text-white">{form.title || 'Banner Title'}</p>
                  <p className="text-sm text-white/70">{form.subtitle || 'Subtitle text here'}</p>
                  {form.buttonText && <div className="mt-3"><span className="rounded-full bg-glow-magenta px-4 py-1.5 text-xs font-semibold text-white">{form.buttonText}</span></div>}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Type</span>
                  <select className="input" name="type" value={form.type} onChange={handleChange}>
                    {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Button Text</span>
                  <input className="input" name="buttonText" value={form.buttonText} onChange={handleChange} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Button Link</span>
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
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Image URL (optional)</span>
                  <input className="input" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/banner.jpg" />
                </label>
                <div className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Gradient</span>
                  <div className="flex flex-wrap gap-2">
                    {GRADIENTS.map(g => (
                      <button key={g} type="button" onClick={() => setForm(p => ({ ...p, gradient: g }))}
                        className={`h-8 w-16 rounded-lg bg-gradient-to-r ${g} transition ${form.gradient === g ? 'ring-2 ring-glow-magenta ring-offset-2 ring-offset-midnight scale-110' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Display Order</span>
                  <input className="input" type="number" name="order" value={form.order} onChange={handleChange} />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium cursor-pointer">
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="h-4 w-4 accent-glow-magenta" />
                  <span className="text-white">Active (visible on site)</span>
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

