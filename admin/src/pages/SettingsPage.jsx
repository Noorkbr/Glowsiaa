import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, ShieldCheck, Store, Globe, Phone,
  Share2, Palette, Truck, CreditCard, Search, Sparkles,
  Check, X, Image, Link, ExternalLink, Zap, Eye, EyeOff, Copy,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

/* ─── helpers ─────────────────────────────────────────────── */
const TABS = [
  { key: 'identity',   label: 'Site Identity',    icon: Store },
  { key: 'contact',    label: 'Contact & Social',  icon: Globe },
  { key: 'delivery',   label: 'Delivery',          icon: Truck },
  { key: 'payments',   label: 'Payments',          icon: CreditCard },
  { key: 'appearance', label: 'Appearance',        icon: Palette },
  { key: 'seo',        label: 'SEO',               icon: Search },
  { key: 'pixels',     label: 'Pixels & Tracking', icon: Zap },
  { key: 'security',   label: 'Security',          icon: ShieldCheck },
];

const SOCIAL_FIELDS = [
  { key: 'social_facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/glowsiaa',  color: '#1877F2' },
  { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/glowsiaa', color: '#E1306C' },
  { key: 'social_tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@glowsiaa',   color: '#000000' },
  { key: 'social_youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@glowsiaa',  color: '#FF0000' },
  { key: 'social_twitter',   label: 'Twitter/X', placeholder: 'https://x.com/glowsiaa',        color: '#1DA1F2' },
  { key: 'social_pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/glowsiaa', color: '#E60023' },
  { key: 'social_linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/company/glowsiaa', color: '#0A66C2' },
];

const PAYMENT_METHODS = [
  { key: 'cod',    label: 'Cash on Delivery', emoji: '💵', merchantKey: null },
  { key: 'bkash',  label: 'bKash',            emoji: '💙', merchantKey: 'bkash_merchant_number' },
  { key: 'nagad',  label: 'Nagad',            emoji: '🟠', merchantKey: 'nagad_merchant_number' },
  { key: 'rocket', label: 'Rocket',           emoji: '🚀', merchantKey: 'rocket_merchant_number' },
];

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    {hint && <p className="text-xs text-gray-500">{hint}</p>}
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input className="input" {...props} />
);

const SaveBar = ({ saving, dirty, onSave }) => (
  <AnimatePresence>
    {dirty && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-2xl border border-white/15 bg-midnight/95 px-6 py-3.5 shadow-2xl backdrop-blur-2xl"
        style={{ boxShadow: '0 0 40px rgba(213,16,110,0.25)' }}
      >
        <span className="text-sm text-white/70">You have unsaved changes</span>
        <button type="button" onClick={onSave} disabled={saving}
          className="btn-primary gap-2 py-2 text-sm disabled:opacity-60">
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Main Component ──────────────────────────────────────── */
export default function SettingsPage() {
  const [tab, setTab] = useState('identity');
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  // Pixel ID visibility toggle
  const [showPixelId, setShowPixelId] = useState(false);

  /* fetch all settings on mount */
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/settings');
        setForm(data.settings || {});
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Re-fetch from DB to keep form in sync (avoids stale/mismatch on refresh)
  const reloadSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setForm(data.settings || {});
    } catch { /* silent */ }
  };

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { settings: form });
      toast.success('Settings saved successfully!');
      setDirty(false);
      // Re-sync form with DB so displayed values always match MongoDB
      await reloadSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    if (pwForm.newPassword.length < 6) { setPwErr('New password must be at least 6 characters.'); return; }
    if (pwForm.currentPassword === pwForm.newPassword) { setPwErr('New password must differ from current.'); return; }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', pwForm);
      setPwMsg('Password updated successfully! ✅');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwErr(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-glow-magenta border-t-transparent" />
          <p className="text-sm text-gray-400">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === key ? 'bg-glow-magenta text-white shadow-[0_0_16px_rgba(213,16,110,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Site Identity ────────────────────────────────────── */}
      {tab === 'identity' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glow-magenta/15 text-glow-magenta">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Store Identity</h2>
                <p className="text-xs text-gray-400">Branding shown across the site</p>
              </div>
            </div>

            <Field label="Store Name">
              <Input name="store_name" value={form.store_name || ''} onChange={handleChange} placeholder="Glowsiaa" />
            </Field>
            <Field label="Tagline" hint="Shown as hero subtitle">
              <Input name="store_tagline" value={form.store_tagline || ''} onChange={handleChange} placeholder="Glow Like Never Before" />
            </Field>
            <Field label="Store Description">
              <textarea className="input min-h-[80px] resize-none" name="store_description" value={form.store_description || ''} onChange={handleChange} placeholder="Bangladesh's premier destination…" />
            </Field>
            <Field label="Footer Copyright">
              <Input name="footer_copyright" value={form.footer_copyright || ''} onChange={handleChange} placeholder="© 2026 Glowsiaa. All rights reserved." />
            </Field>
          </div>

          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glow-magenta/15 text-glow-magenta">
                <Image className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Logo & Media</h2>
                <p className="text-xs text-gray-400">Logo image URL and favicon</p>
              </div>
            </div>

            <Field label="Logo Image URL" hint="Leave blank to use text logo">
              <Input name="logo_url" value={form.logo_url || ''} onChange={handleChange} placeholder="https://cdn.example.com/logo.png" />
            </Field>

            {form.logo_url && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                <img src={form.logo_url} alt="Logo preview" className="h-10 max-w-[140px] object-contain" onError={e => { e.target.style.display='none'; }} />
                <span className="text-xs text-gray-400">Logo preview</span>
              </div>
            )}

            <Field label="Favicon URL" hint="32×32 or 64×64 .ico / .png">
              <Input name="favicon_url" value={form.favicon_url || ''} onChange={handleChange} placeholder="https://cdn.example.com/favicon.ico" />
            </Field>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400 space-y-1">
              <p className="text-white font-medium text-xs uppercase tracking-widest mb-2">Live Preview</p>
              <div className="flex items-center gap-3">
                {form.logo_url
                  ? <img src={form.logo_url} alt="logo" className="h-8 object-contain" onError={e => { e.target.style.display='none'; }} />
                  : <span className="font-heading text-2xl font-black tracking-[0.28em]" style={{ background: 'linear-gradient(135deg,#D5106E,#6E3992)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                      {form.store_name || 'GLOWSIAA'}
                    </span>
                }
              </div>
              <p className="text-xs">{form.store_tagline || 'Glow Like Never Before'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact & Social ────────────────────────────────── */}
      {tab === 'contact' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glow-magenta/15 text-glow-magenta">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Contact Details</h2>
                <p className="text-xs text-gray-400">Shown in footer and contact sections</p>
              </div>
            </div>
            <Field label="Support Email">
              <Input type="email" name="support_email" value={form.support_email || ''} onChange={handleChange} placeholder="hello@glowsiaa.com" />
            </Field>
            <Field label="Support Phone">
              <Input name="support_phone" value={form.support_phone || ''} onChange={handleChange} placeholder="+880 1711-000000" />
            </Field>
            <Field label="WhatsApp Number" hint="Include country code e.g. +8801711000000">
              <Input name="whatsapp_number" value={form.whatsapp_number || ''} onChange={handleChange} placeholder="+8801711000000" />
            </Field>
            <Field label="Store Address">
              <textarea className="input min-h-[70px] resize-none" name="store_address" value={form.store_address || ''} onChange={handleChange} placeholder="Dhaka, Bangladesh" />
            </Field>
          </div>

          <div className="panel p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glow-magenta/15 text-glow-magenta">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Social Media</h2>
                <p className="text-xs text-gray-400">Empty = icon hidden in footer</p>
              </div>
            </div>
            {SOCIAL_FIELDS.map(({ key, label, placeholder, color }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
                  <Link className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-400">{label}</label>
                  <Input name={key} value={form[key] || ''} onChange={handleChange} placeholder={placeholder} />
                </div>
                {form[key] && (
                  <a href={form[key]} target="_blank" rel="noreferrer" className="mt-5 text-gray-500 hover:text-white">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Delivery ────────────────────────────────────────── */}
      {tab === 'delivery' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glow-magenta/15 text-glow-magenta">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Delivery Fee Settings</h2>
                <p className="text-xs text-gray-400">Charged at checkout, stored in database</p>
              </div>
            </div>
            <Field label="Inside Dhaka Delivery Fee (৳)">
              <Input type="number" min="0" name="delivery_fee_inside" value={form.delivery_fee_inside ?? 60} onChange={handleChange} />
            </Field>
            <Field label="Outside Dhaka Delivery Fee (৳)">
              <Input type="number" min="0" name="delivery_fee_outside" value={form.delivery_fee_outside ?? 120} onChange={handleChange} />
            </Field>
            <Field label="Free Delivery Threshold (৳)" hint="Set 0 to disable free delivery">
              <Input type="number" min="0" name="free_delivery_above" value={form.free_delivery_above ?? 999} onChange={handleChange} />
            </Field>

            <div className="rounded-xl border border-glow-magenta/20 bg-glow-magenta/5 p-4 space-y-1.5 text-sm">
              <p className="font-semibold text-white">Live Preview</p>
              <div className="flex justify-between text-gray-300">
                <span>Inside Dhaka</span><span className="font-semibold text-white">৳{form.delivery_fee_inside ?? 60}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Outside Dhaka</span><span className="font-semibold text-white">৳{form.delivery_fee_outside ?? 120}</span>
              </div>
              {Number(form.free_delivery_above) > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span>Free delivery above</span><span className="font-semibold">৳{form.free_delivery_above}</span>
                </div>
              )}
            </div>
          </div>

          <div className="panel p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Delivery Partners</h2>
            <p className="text-sm text-gray-400">Use the Delivery page to push orders to Pathao, Steadfast, or RedX.</p>
            {['Pathao', 'Steadfast', 'RedX'].map(d => (
              <div key={d} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-white">{d}</span>
                <span className="ml-auto text-xs text-gray-400">Configured via server .env</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Payments ────────────────────────────────────────── */}
      {tab === 'payments' && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
          {PAYMENT_METHODS.map(({ key, label, emoji, merchantKey }) => {
            const enabled = form[`${key}_enabled`] ?? (key === 'cod');
            return (
              <div key={key} className="panel overflow-hidden">
                <div className={`h-1.5 w-full`} style={{ background: enabled ? 'linear-gradient(90deg,#D5106E,#6E3992)' : 'rgba(255,255,255,0.1)' }} />
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{emoji}</span>
                      <div>
                        <h3 className="font-bold text-white">{label}</h3>
                        <p className="text-xs text-gray-400">{key === 'cod' ? 'No setup required' : 'Requires server .env config'}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="sr-only" name={`${key}_enabled`} checked={!!enabled} onChange={handleChange} />
                      <div className={`h-6 w-11 rounded-full transition-colors duration-300 ${enabled ? 'bg-glow-magenta' : 'bg-white/15'}`}>
                        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </div>
                    </label>
                  </div>

                  <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${enabled ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-gray-500'}`}>
                    {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    {enabled ? 'Shown at checkout' : 'Hidden from checkout'}
                  </div>

                  {merchantKey && (
                    <Field label={`${label} Merchant Number`} hint="Displayed in payment instructions">
                      <Input name={merchantKey} value={form[merchantKey] || ''} onChange={handleChange} placeholder={`01XXXXXXXXX`} />
                    </Field>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Appearance ──────────────────────────────────────── */}
      {tab === 'appearance' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glow-magenta/15 text-glow-magenta">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Brand Colors</h2>
                <p className="text-xs text-gray-400">Applied as Tailwind CSS variables</p>
              </div>
            </div>

            <Field label="Primary Glow Color (Magenta)" hint="Default #D5106E">
              <div className="flex items-center gap-3">
                <input type="color" name="primary_color" value={form.primary_color || '#D5106E'} onChange={handleChange}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5" />
                <Input name="primary_color" value={form.primary_color || '#D5106E'} onChange={handleChange} placeholder="#D5106E" className="flex-1" />
              </div>
            </Field>
            <Field label="Secondary Glow Color (Purple)" hint="Default #6E3992">
              <div className="flex items-center gap-3">
                <input type="color" name="secondary_color" value={form.secondary_color || '#6E3992'} onChange={handleChange}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5" />
                <Input name="secondary_color" value={form.secondary_color || '#6E3992'} onChange={handleChange} placeholder="#6E3992" className="flex-1" />
              </div>
            </Field>

            {/* Preview */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
              <p className="text-xs uppercase tracking-widest text-gray-400">Color Preview</p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl shadow-lg" style={{ background: form.primary_color || '#D5106E', boxShadow: `0 0 20px ${form.primary_color || '#D5106E'}60` }} />
                <div className="h-12 w-12 rounded-xl shadow-lg" style={{ background: form.secondary_color || '#6E3992', boxShadow: `0 0 20px ${form.secondary_color || '#6E3992'}60` }} />
                <div className="h-12 flex-1 rounded-xl" style={{ background: `linear-gradient(135deg, ${form.primary_color || '#D5106E'}, ${form.secondary_color || '#6E3992'})` }} />
              </div>
              <div className="rounded-xl py-2.5 px-5 text-sm font-bold text-white text-center"
                style={{ background: form.primary_color || '#D5106E', boxShadow: `0 0 20px ${form.primary_color || '#D5106E'}50` }}>
                Sample Button
              </div>
            </div>
          </div>

          <div className="panel p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">Site-Wide Settings</h2>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-white">Maintenance Mode</p>
                <p className="text-xs text-gray-400">Displays a coming soon page to visitors</p>
              </div>
              <div>
                <input type="checkbox" className="sr-only" name="maintenance_mode" checked={!!form.maintenance_mode} onChange={handleChange} />
                <div className={`relative h-6 w-11 rounded-full transition-colors ${form.maintenance_mode ? 'bg-red-500' : 'bg-white/15'}`}>
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.maintenance_mode ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </div>
            </label>

            <div className="rounded-xl border border-glow-magenta/20 bg-glow-magenta/5 p-4 text-sm text-white/70 space-y-2">
              <p className="font-semibold text-white flex items-center gap-2"><Sparkles className="h-4 w-4 text-glow-magenta" /> Pro Tips</p>
              <ul className="space-y-1.5 list-disc list-inside text-xs">
                <li>Colors update instantly for new visitors after saving</li>
                <li>CSS variable changes don't require rebuilding the app</li>
                <li>Test colors using the preview box on the left</li>
                <li>Maintenance mode is useful before major launches</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── SEO ─────────────────────────────────────────────── */}
      {tab === 'seo' && (
        <div className="panel p-6 space-y-5 max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glow-magenta/15 text-glow-magenta">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">SEO Settings</h2>
              <p className="text-xs text-gray-400">Meta tags used for search engines and social sharing</p>
            </div>
          </div>

          <Field label="SEO Title" hint="Shown in browser tab and Google results (50–60 chars)">
            <Input name="seo_title" value={form.seo_title || ''} onChange={handleChange} placeholder="Glowsiaa — Premium Beauty in Bangladesh" />
            <p className="mt-1 text-xs text-right text-gray-500">{(form.seo_title || '').length} / 60</p>
          </Field>

          <Field label="SEO Description" hint="Shown in Google snippets (150–160 chars)">
            <textarea className="input min-h-[80px] resize-none" name="seo_description" value={form.seo_description || ''} onChange={handleChange} placeholder="Premium cosmetics curated for the modern Bangladeshi woman…" />
            <p className="mt-1 text-xs text-right text-gray-500">{(form.seo_description || '').length} / 160</p>
          </Field>

          {/* Google Preview */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Google Preview</p>
            <p className="text-lg text-blue-400 font-medium truncate">{form.seo_title || 'Glowsiaa — Premium Beauty in Bangladesh'}</p>
            <p className="text-xs text-green-400">glowsiaa.com</p>
            <p className="text-sm text-gray-300 line-clamp-2">{form.seo_description || 'Premium cosmetics curated for the modern Bangladeshi woman.'}</p>
          </div>
        </div>
      )}

      {/* ── Pixels & Tracking ───────────────────────────────── */}
      {tab === 'pixels' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Facebook Pixel Card */}
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(24,119,242,0.15)', border: '1px solid rgba(24,119,242,0.3)' }}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97H15.83c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Facebook Pixel</h2>
                <p className="text-xs text-gray-400">Track ad conversions & audience behavior</p>
              </div>
            </div>

            {/* Enable Toggle */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-white">Enable Facebook Pixel</p>
                <p className="text-xs text-gray-400">Injects the pixel script on every page load</p>
              </div>
              <div>
                <input type="checkbox" className="sr-only" name="facebook_pixel_enabled" checked={!!form.facebook_pixel_enabled} onChange={handleChange} />
                <div className={`relative h-6 w-11 rounded-full transition-colors ${form.facebook_pixel_enabled ? 'bg-[#1877F2]' : 'bg-white/15'}`}>
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.facebook_pixel_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </div>
            </label>

            {/* Pixel ID */}
            <Field label="Pixel ID" hint="Found in Facebook Events Manager → your Pixel → Settings">
              <div className="relative flex items-center">
                <input
                  type={showPixelId ? 'text' : 'password'}
                  name="facebook_pixel_id"
                  value={form.facebook_pixel_id || ''}
                  onChange={handleChange}
                  placeholder="e.g. 1234567890123456"
                  className="input pr-20"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button type="button" onClick={() => setShowPixelId(v => !v)}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition" title={showPixelId ? 'Hide' : 'Show'}>
                    {showPixelId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {form.facebook_pixel_id && (
                    <button type="button" onClick={() => { navigator.clipboard.writeText(form.facebook_pixel_id || ''); }}
                      className="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition" title="Copy Pixel ID">
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Field>

            {/* Status Badge */}
            <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${
              form.facebook_pixel_enabled && form.facebook_pixel_id
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                : form.facebook_pixel_enabled && !form.facebook_pixel_id
                ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300'
                : 'border-white/10 bg-white/5 text-gray-500'
            }`}>
              {form.facebook_pixel_enabled && form.facebook_pixel_id ? (
                <><Check className="h-4 w-4" /> Pixel active — tracking all page views</>
              ) : form.facebook_pixel_enabled && !form.facebook_pixel_id ? (
                <><Sparkles className="h-4 w-4" /> Enabled but Pixel ID is missing</>
              ) : (
                <><X className="h-4 w-4" /> Pixel is disabled</>
              )}
            </div>

            {/* Code Preview */}
            {form.facebook_pixel_id && (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
                <p className="text-xs uppercase tracking-widest text-gray-400">Injected Script Preview</p>
                <pre className="text-[11px] text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{`<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=
  function(){n.callMethod?n.callMethod.apply(n,arguments)
  :n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;
  n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);
  t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${form.facebook_pixel_id}');
  fbq('track', 'PageView');
</script>`}</pre>
              </div>
            )}
          </div>

          {/* How-to Guide */}
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glow-magenta/15 text-glow-magenta">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Setup Guide</h2>
                <p className="text-xs text-gray-400">Step-by-step: find your Pixel ID</p>
              </div>
            </div>

            <ol className="space-y-4 text-sm text-gray-300">
              {[
                { step: 1, title: 'Go to Meta Business Suite', desc: 'Visit business.facebook.com and log in with your Facebook account.' },
                { step: 2, title: 'Open Events Manager', desc: 'In the left sidebar click "Events Manager" (or go to facebook.com/events_manager2).' },
                { step: 3, title: 'Select your Pixel', desc: 'Click on "Data Sources" and select your existing Pixel, or click "+ Add" to create a new one.' },
                { step: 4, title: 'Copy the Pixel ID', desc: 'In the Pixel Overview page, copy the 16-digit number shown below the Pixel name — that\'s your Pixel ID.' },
                { step: 5, title: 'Paste it here', desc: 'Paste the ID in the "Pixel ID" field on the left, enable the toggle, then click Save Settings.' },
              ].map(({ step, title, desc }) => (
                <li key={step} className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-glow-magenta/20 text-glow-magenta text-xs font-bold">
                    {step}
                  </div>
                  <div>
                    <p className="font-medium text-white">{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <a
              href="https://www.facebook.com/events_manager2"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-2.5 text-sm text-[#1877F2] hover:bg-[#1877F2]/20 transition"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97H15.83c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              Open Facebook Events Manager
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {/* What gets tracked */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Automatically Tracked Events</p>
              {[
                { event: 'PageView', desc: 'Every page load / route change' },
                { event: 'ViewContent', desc: 'Product detail page visits' },
                { event: 'AddToCart', desc: 'Add to cart button clicks' },
                { event: 'InitiateCheckout', desc: 'Checkout drawer opens' },
                { event: 'Purchase', desc: 'Successful order placement' },
              ].map(({ event, desc }) => (
                <div key={event} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-[#1877F2]" />
                  <span className="font-mono text-white text-xs">{event}</span>
                  <span className="text-gray-400 text-xs">— {desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Security ────────────────────────────────────────── */}
      {tab === 'security' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glow-magenta/15 text-glow-magenta">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Profile</h2>
                <p className="text-xs text-gray-400">Current authenticated administrator</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-gray-500">Name</p>
                <p className="mt-2 text-lg font-semibold text-white">{adminUser.name || 'Admin'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-gray-500">Email</p>
                <p className="mt-2 text-lg font-semibold text-white truncate">{adminUser.email || 'admin@glowsiaa.com'}</p>
              </div>
            </div>
          </div>

          <div className="panel p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">Change Password</h2>
            <p className="text-sm text-gray-400">Protect admin access with regular updates.</p>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Field label="Current Password">
                <Input type="password" name="currentPassword" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
              </Field>
              <Field label="New Password">
                <Input type="password" name="newPassword" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required />
              </Field>
              {pwErr && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{pwErr}</div>}
              {pwMsg && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{pwMsg}</div>}
              <button type="submit" disabled={pwLoading} className="btn-primary gap-2 disabled:opacity-60">
                <Save className="h-4 w-4" />
                {pwLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating save bar */}
      {tab !== 'security' && (
        <div className="flex justify-end gap-3 pb-2">
          <button type="button" onClick={handleSave} disabled={saving || !dirty}
            className="btn-primary gap-2 disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      )}

      <SaveBar saving={saving} dirty={dirty && tab !== 'security'} onSave={handleSave} />
    </div>
  );
}
