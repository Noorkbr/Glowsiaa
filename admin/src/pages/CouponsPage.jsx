import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Tag, Pencil, Trash2, X, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const emptyForm = {
  code: '', description: '', type: 'percentage', value: '',
  minOrderAmount: 0, maxDiscountAmount: '', usageLimit: '',
  isActive: true, expiresAt: '',
};

const statusBadge = (coupon) => {
  if (!coupon.isActive) return { text: 'Inactive', cls: 'bg-gray-500/15 text-gray-400' };
  if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) return { text: 'Expired', cls: 'bg-red-500/15 text-red-300' };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { text: 'Used Up', cls: 'bg-orange-500/15 text-orange-300' };
  return { text: 'Active', cls: 'bg-emerald-500/15 text-emerald-300' };
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testAmount, setTestAmount] = useState('');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons || []);
    } catch { toast.error('Failed to load coupons'); }
    setLoading(false);
  };

  const openCreate = () => {
    setEditingCoupon(null);
    setForm({ ...emptyForm, code: Math.random().toString(36).substring(2, 8).toUpperCase() });
    setShowModal(true);
  };
  const openEdit = (c) => { setEditingCoupon(c); setForm({ ...emptyForm, ...c, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '', value: String(c.value), usageLimit: c.usageLimit ?? '', maxDiscountAmount: c.maxDiscountAmount ?? '' }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingCoupon(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      code: form.code.toUpperCase(),
      description: form.description,
      type: form.type,
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      isActive: form.isActive,
      expiresAt: form.expiresAt || undefined,
    };
    try {
      if (editingCoupon) {
        const { data } = await api.put(`/coupons/${editingCoupon._id}`, payload);
        setCoupons(p => p.map(c => c._id === editingCoupon._id ? data.coupon : c));
        toast.success('Coupon updated!');
      } else {
        const { data } = await api.post('/coupons', payload);
        setCoupons(p => [data.coupon, ...p]);
        toast.success('Coupon created!');
      }
      closeModal();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    setSubmitting(false);
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await api.delete(`/coupons/${id}`); setCoupons(p => p.filter(c => c._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const testCoupon = async () => {
    if (!testCode) return;
    try {
      const { data } = await api.post('/coupons/validate', { code: testCode, orderTotal: Number(testAmount) || 0 });
      setTestResult({ success: true, ...data });
    } catch (e) { setTestResult({ success: false, message: e.response?.data?.message || 'Invalid coupon' }); }
  };

  const copyCoupon = (code) => { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Coupons</h2>
          <p className="text-sm text-gray-400 mt-1">{coupons.length} coupons · {coupons.filter(c => c.isActive).length} active</p>
        </div>
        <button type="button" className="btn-primary gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </div>

      {/* Coupon tester */}
      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-white mb-3">🧪 Test a Coupon</h3>
        <div className="flex flex-wrap gap-3">
          <input className="input flex-1 min-w-[140px]" placeholder="COUPON CODE" value={testCode} onChange={e => setTestCode(e.target.value.toUpperCase())} />
          <input className="input w-36" type="number" placeholder="Order ৳" value={testAmount} onChange={e => setTestAmount(e.target.value)} />
          <button type="button" className="btn-primary px-5" onClick={testCoupon}>Test</button>
        </div>
        {testResult && (
          <div className={`mt-3 rounded-xl border px-4 py-3 text-sm ${testResult.success ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-red-500/20 bg-red-500/10 text-red-200'}`}>
            {testResult.success
              ? `✅ Valid! Discount: ৳${testResult.discountAmount} | Final: ৳${testResult.finalTotal}`
              : `❌ ${testResult.message}`}
          </div>
        )}
      </div>

      {loading ? <div className="panel p-6 text-gray-400">Loading coupons...</div> : (
        <div className="panel overflow-hidden">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400">
              <tr>
                <th className="px-4 py-4 font-medium">Code</th>
                <th className="px-4 py-4 font-medium">Discount</th>
                <th className="px-4 py-4 font-medium">Min Order</th>
                <th className="px-4 py-4 font-medium">Usage</th>
                <th className="px-4 py-4 font-medium">Expires</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length > 0 ? coupons.map(coupon => {
                const badge = statusBadge(coupon);
                return (
                  <tr key={coupon._id} className="border-t border-white/10 hover:bg-white/[0.02]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-glow-magenta">{coupon.code}</span>
                        <button type="button" onClick={() => copyCoupon(coupon.code)} className="text-gray-500 hover:text-white"><Copy className="h-3 w-3" /></button>
                      </div>
                      {coupon.description && <p className="text-xs text-gray-400 mt-0.5">{coupon.description}</p>}
                    </td>
                    <td className="px-4 py-4 font-semibold text-white">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `৳${coupon.value}`}
                      {coupon.maxDiscountAmount ? <span className="ml-1 text-xs text-gray-400">(max ৳{coupon.maxDiscountAmount})</span> : null}
                    </td>
                    <td className="px-4 py-4 text-gray-300">৳{coupon.minOrderAmount}</td>
                    <td className="px-4 py-4 text-gray-300">
                      {coupon.usedCount}/{coupon.usageLimit ?? '∞'}
                    </td>
                    <td className="px-4 py-4 text-gray-400">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.cls}`}>{badge.text}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openEdit(coupon)} className="btn-secondary gap-1.5 px-3 py-2 text-xs"><Pencil className="h-3 w-3" /> Edit</button>
                        <button type="button" onClick={() => deleteCoupon(coupon._id)} className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-300 hover:bg-red-500/20"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No coupons yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="panel w-full max-w-lg p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Coupon Code *</span>
                    <input className="input font-mono uppercase" name="code" value={form.code} onChange={handleChange} required />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Type</span>
                    <select className="input" name="type" value={form.type} onChange={handleChange}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (৳)</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Value *</span>
                    <input className="input" type="number" min="0" name="value" value={form.value} onChange={handleChange} required placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 100'} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Min Order (৳)</span>
                    <input className="input" type="number" min="0" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Max Discount (৳)</span>
                    <input className="input" type="number" min="0" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange} placeholder="Leave empty = no cap" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Usage Limit</span>
                    <input className="input" type="number" min="1" name="usageLimit" value={form.usageLimit} onChange={handleChange} placeholder="Leave empty = unlimited" />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Expires On</span>
                    <input className="input" type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange} />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Description (shown to customers)</span>
                    <input className="input" name="description" value={form.description} onChange={handleChange} placeholder="e.g. Welcome offer for new customers" />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium cursor-pointer md:col-span-2">
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="h-4 w-4 accent-glow-magenta" />
                    <span className="text-white">Active</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
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

