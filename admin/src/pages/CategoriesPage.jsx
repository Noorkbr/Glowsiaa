import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, FolderOpen, FolderPlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const GRADIENTS = [
  'from-[#6E3992] to-[#D5106E]',
  'from-[#ff4d8d] to-[#f04444]',
  'from-[#3d7cff] to-[#6E3992]',
  'from-[#00b894] to-[#00cec9]',
  'from-[#F59E0B] to-[#EF4444]',
  'from-[#8B5CF6] to-[#EC4899]',
  'from-[#06B6D4] to-[#3B82F6]',
  'from-[#10B981] to-[#059669]',
];

const EMOJIS = ['✨', '💄', '🌸', '💅', '🧴', '🌿', '💆', '🪷', '💎', '🌺', '🛍️', '🔮', '🌙', '☀️', '💫', '🎀'];

const emptyForm = {
  name: '', description: '', imageUrl: '', emoji: '✨',
  gradient: GRADIENTS[0], parent: '', isActive: true, order: 0,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});
  const [defaultParent, setDefaultParent] = useState(''); // pre-select parent when creating sub

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories/admin/all');
      setCategories(data.categories || []);
    } catch { toast.error('Failed to load categories'); }
    setLoading(false);
  };

  const topLevel = categories.filter(c => !c.parent);
  const subCats = (parentId) => categories.filter(c => c.parent && (c.parent._id || c.parent) === parentId);

  const openCreate = (parentId = '') => {
    setEditingCat(null);
    setForm({ ...emptyForm, parent: parentId });
    setDefaultParent(parentId);
    setShowModal(true);
  };
  const openEdit = (cat) => {
    setEditingCat(cat);
    setForm({
      name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '',
      emoji: cat.emoji || '✨', gradient: cat.gradient || GRADIENTS[0],
      parent: cat.parent?._id || cat.parent || '', isActive: cat.isActive, order: cat.order || 0,
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingCat(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      emoji: form.emoji,
      gradient: form.gradient,
      parent: form.parent || null,
      isActive: form.isActive,
      order: Number(form.order) || 0,
    };
    try {
      if (editingCat) {
        const { data } = await api.put(`/categories/${editingCat._id}`, payload);
        setCategories(p => p.map(c => c._id === editingCat._id ? { ...data.category, productCount: c.productCount } : c));
        toast.success('Category updated!');
      } else {
        const { data } = await api.post('/categories', payload);
        setCategories(p => [...p, { ...data.category, productCount: 0 }]);
        toast.success('Category created!');
      }
      closeModal();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    setSubmitting(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? All subcategories will also be deleted.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(p => p.filter(c => c._id !== id && (c.parent?._id || c.parent) !== id));
      toast.success('Category deleted');
    } catch { toast.error('Delete failed'); }
  };

  const toggleExpand = (id) => setExpandedCats(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Categories</h2>
          <p className="text-sm text-gray-400 mt-1">
            {topLevel.length} top-level · {categories.length - topLevel.length} subcategories
          </p>
        </div>
        <button type="button" className="btn-primary gap-2" onClick={() => openCreate('')}>
          <FolderPlus className="h-4 w-4" /> New Category
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-4 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Top-Level</p>
          <p className="text-3xl font-bold text-white mt-1">{topLevel.length}</p>
        </div>
        <div className="panel p-4 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Subcategories</p>
          <p className="text-3xl font-bold text-white mt-1">{categories.length - topLevel.length}</p>
        </div>
        <div className="panel p-4 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Active</p>
          <p className="text-3xl font-bold text-emerald-300 mt-1">{categories.filter(c => c.isActive).length}</p>
        </div>
      </div>

      {loading ? (
        <div className="panel p-8 text-center text-gray-400">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="panel flex flex-col items-center py-16 text-center">
          <FolderOpen className="h-14 w-14 text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">No categories yet. Create your first category!</p>
          <button type="button" className="btn-primary gap-2" onClick={() => openCreate('')}>
            <FolderPlus className="h-4 w-4" /> Create First Category
          </button>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="px-4 py-4 font-medium">Category</th>
                  <th className="px-4 py-4 font-medium">Slug</th>
                  <th className="px-4 py-4 font-medium">Products</th>
                  <th className="px-4 py-4 font-medium">Order</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topLevel.map(cat => {
                  const subs = subCats(cat._id);
                  const isExpanded = expandedCats[cat._id];
                  return (
                    <Fragment key={cat._id}>
                      <tr key={cat._id} className="border-t border-white/10 hover:bg-white/[0.02] bg-white/[0.01]">                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {subs.length > 0 && (
                              <button type="button" onClick={() => toggleExpand(cat._id)} className="text-gray-500 hover:text-white">
                                <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                            )}
                            {!subs.length && <div className="w-4" />}

                            {cat.imageUrl ? (
                              <img src={cat.imageUrl} alt={cat.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                            ) : (
                              <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-lg`}>
                                {cat.emoji}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white">{cat.name}</p>
                              {cat.description && <p className="text-xs text-gray-500 truncate max-w-[160px]">{cat.description}</p>}
                            </div>
                            {subs.length > 0 && (
                              <span className="rounded-full bg-glow-magenta/15 px-2 py-0.5 text-[10px] font-bold text-glow-magenta">
                                {subs.length} subs
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-gray-400">{cat.slug}</td>
                        <td className="px-4 py-4 text-gray-300">{cat.productCount ?? 0}</td>
                        <td className="px-4 py-4 text-gray-400">{cat.order}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cat.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1.5">
                            <button type="button" onClick={() => openCreate(cat._id)}
                              className="rounded-lg border border-glow-magenta/30 bg-glow-magenta/10 px-2.5 py-1.5 text-xs font-semibold text-glow-magenta hover:bg-glow-magenta/20 transition"
                              title="Add subcategory">
                              + Sub
                            </button>
                            <button type="button" onClick={() => openEdit(cat)} className="btn-secondary gap-1 px-2.5 py-1.5 text-xs">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button type="button" onClick={() => handleDelete(cat._id, cat.name)}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-red-300 hover:bg-red-500/20 transition">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Subcategories */}
                      <AnimatePresence>
                        {isExpanded && subs.map(sub => (
                          <motion.tr key={sub._id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-white/5 bg-white/[0.015]">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3 pl-10">
                                {sub.imageUrl ? (
                                  <img src={sub.imageUrl} alt={sub.name} className="h-8 w-8 rounded-lg object-cover shrink-0" />
                                ) : (
                                  <div className={`h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br ${sub.gradient} flex items-center justify-center text-sm`}>
                                    {sub.emoji}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-white/90">{sub.name}</p>
                                  <p className="text-[10px] text-gray-500">subcategory of {cat.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{sub.slug}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{sub.productCount ?? 0}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{sub.order}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sub.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {sub.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                <button type="button" onClick={() => openEdit(sub)} className="btn-secondary gap-1 px-2 py-1.5 text-xs">
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button type="button" onClick={() => handleDelete(sub._id, sub.name)}
                                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-red-300 hover:bg-red-500/20 transition">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
              initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingCat ? 'Edit Category' : form.parent ? 'Add Subcategory' : 'New Category'}
                  </h2>
                  {form.parent && !editingCat && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Under: {categories.find(c => c._id === form.parent)?.name}
                    </p>
                  )}
                </div>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              {/* Live preview */}
              <div className={`mb-5 flex h-20 items-center gap-4 rounded-2xl bg-gradient-to-r ${form.gradient} px-5`}>
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <span className="text-4xl">{form.emoji}</span>
                )}
                <div>
                  <p className="text-lg font-bold text-white">{form.name || 'Category Name'}</p>
                  {form.description && <p className="text-xs text-white/70">{form.description}</p>}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Name *</span>
                  <input className="input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Skincare" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Description</span>
                  <input className="input" name="description" value={form.description} onChange={handleChange} placeholder="Brief description" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Image URL (optional — overrides emoji)</span>
                  <input className="input" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
                </label>

                {/* Emoji picker */}
                <div>
                  <span className="mb-2 block text-sm font-medium text-gray-300">Emoji</span>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map(e => (
                      <button key={e} type="button" onClick={() => setForm(p => ({ ...p, emoji: e }))}
                        className={`rounded-lg p-2 text-xl transition ${form.emoji === e ? 'ring-2 ring-glow-magenta bg-glow-magenta/10' : 'hover:bg-white/5'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gradient picker */}
                <div>
                  <span className="mb-2 block text-sm font-medium text-gray-300">Gradient</span>
                  <div className="flex flex-wrap gap-2">
                    {GRADIENTS.map(g => (
                      <button key={g} type="button" onClick={() => setForm(p => ({ ...p, gradient: g }))}
                        className={`h-8 w-14 rounded-lg bg-gradient-to-r ${g} transition ${form.gradient === g ? 'ring-2 ring-white ring-offset-1 ring-offset-midnight scale-110' : ''}`} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Parent Category</span>
                    <select className="input" name="parent" value={form.parent} onChange={handleChange}>
                      <option value="">None (Top-level)</option>
                      {topLevel.filter(c => !editingCat || c._id !== editingCat._id).map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Display Order</span>
                    <input className="input" type="number" min="0" name="order" value={form.order} onChange={handleChange} />
                  </label>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium">
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="h-4 w-4 accent-glow-magenta" />
                  <span className="text-white">Active (visible on site)</span>
                </label>

                <div className="flex justify-end gap-3 pt-1">
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : editingCat ? 'Update' : 'Create'}
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

