import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Megaphone, MessageSquare, Plus, Pencil, Tag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CATEGORIES = ['skincare', 'makeup', 'fragrance', 'haircare', 'wellness'];
const EMOJIS = ['✨', '💄', '🌸', '💅', '🧴', '🌿', '💆', '🪷', '🌺', '💎'];
const CARD_EMOJIS = ['🎁', '💎', '✨', '🔥', '💫', '🛍️', '🎀', '💅', '🌟', '🎊'];
const BG_PRESETS = [
  { label: 'Hot Pink',  from: '#FF85B3', to: '#D5106E' },
  { label: 'Rose',      from: '#FF99C2', to: '#C0166E' },
  { label: 'Lavender',  from: '#FFADD3', to: '#A8166A' },
  { label: 'Coral',     from: '#FF80B0', to: '#CC0055' },
  { label: 'Purple',    from: '#E0AAFF', to: '#7C3AED' },
  { label: 'Ocean',     from: '#93C5FD', to: '#1D4ED8' },
];

const DEFAULT_PROMO_CARDS = [
  { id: 'bogo',       title: 'BOGO',       subtitle: 'Buy 1\nGet 1', emoji: '🎁', link: '/products', bgFrom: '#FF85B3', bgTo: '#D5106E', active: true },
  { id: 'combo',      title: 'COMBO',      subtitle: 'Bundle\nDeals', emoji: '💎', link: '/products', bgFrom: '#FF99C2', bgTo: '#C0166E', active: true },
  { id: 'exclusives', title: 'EXCLUSIVES', subtitle: 'Limited\nEdition', emoji: '✨', link: '/products', bgFrom: '#FFADD3', bgTo: '#A8166A', active: true },
  { id: 'sale',       title: 'SALE',       subtitle: 'Up to\n50% Off', emoji: '🔥', link: '/products', bgFrom: '#FF80B0', bgTo: '#CC0055', active: true },
];

const emptyTip = { title: '', content: '', category: 'skincare', imageUrl: '', emoji: '✨', readTime: 2, isPublished: true, order: 0, tags: [] };

export default function ContentPage() {
  const [tab, setTab] = useState('tips');
  const [tips, setTips] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [form, setForm] = useState(emptyTip);
  const [submitting, setSubmitting] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  // Promo cards
  const [promoCards, setPromoCards] = useState(DEFAULT_PROMO_CARDS);
  const [savingPromo, setSavingPromo] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardForm, setCardForm] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tipsRes, settingsRes] = await Promise.all([
        api.get('/tips/all'),
        api.get('/settings'),
      ]);
      setTips(tipsRes.data.tips || []);
      const s = settingsRes.data.settings;
      setMessages(Array.isArray(s.top_banner_messages) ? s.top_banner_messages : []);
      setAnnouncement(s.announcement || '');
      setAnnouncementActive(s.announcement_active || false);
      if (Array.isArray(s.promo_cards) && s.promo_cards.length > 0) setPromoCards(s.promo_cards);
    } catch { toast.error('Failed to load content'); }
    setLoading(false);
  };

  // ─── Tips ────────────────────────────────────────────────────
  const openCreate = () => { setEditingTip(null); setForm(emptyTip); setShowModal(true); };
  const openEdit = (t) => { setEditingTip(t); setForm({ ...emptyTip, ...t, tags: t.tags || [] }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingTip(null); };
  const handleChange = (e) => { const { name, value, type, checked } = e.target; setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value })); };
  const handleTipSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, tags: form.tags };
      if (editingTip) {
        const { data } = await api.put(`/tips/${editingTip._id}`, payload);
        setTips(p => p.map(t => t._id === editingTip._id ? data.tip : t));
        toast.success('Tip updated!');
      } else {
        const { data } = await api.post('/tips', payload);
        setTips(p => [data.tip, ...p]);
        toast.success('Tip created!');
      }
      closeModal();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    setSubmitting(false);
  };
  const deleteTip = async (id) => {
    if (!confirm('Delete this tip?')) return;
    try { await api.delete(`/tips/${id}`); setTips(p => p.filter(t => t._id !== id)); toast.success('Tip deleted'); }
    catch { toast.error('Delete failed'); }
  };

  // ─── Banner Messages ─────────────────────────────────────────
  const addMessage = () => { if (!newMessage.trim()) return; setMessages(p => [...p, newMessage.trim()]); setNewMessage(''); };
  const removeMessage = (i) => setMessages(p => p.filter((_, idx) => idx !== i));
  const saveMessages = async () => {
    setSavingSettings(true);
    try {
      await api.put('/settings', { settings: { top_banner_messages: messages, announcement, announcement_active: announcementActive } });
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    setSavingSettings(false);
  };

  // ─── Promo Cards ─────────────────────────────────────────────
  const openEditCard = (card) => { setEditingCard(card); setCardForm({ ...card }); };
  const closeEditCard = () => { setEditingCard(null); setCardForm({}); };
  const handleCardChange = (e) => { const { name, value, type, checked } = e.target; setCardForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value })); };
  const saveCardEdit = () => { setPromoCards(p => p.map(c => c.id === editingCard.id ? { ...c, ...cardForm } : c)); closeEditCard(); toast.success('Card updated — click Save All to persist!'); };
  const toggleCard = (id) => setPromoCards(p => p.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const savePromoCards = async () => {
    setSavingPromo(true);
    try { await api.put('/settings', { settings: { promo_cards: promoCards } }); toast.success('Promo cards saved!'); }
    catch { toast.error('Failed to save promo cards'); }
    setSavingPromo(false);
  };

  const TABS = [
    { key: 'tips', label: 'Beauty Tips', icon: BookOpen },
    { key: 'promo', label: 'Promo Cards', icon: Tag },
    { key: 'banner', label: 'Top Banner', icon: MessageSquare },
    { key: 'announcement', label: 'Announcement', icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${tab === key ? 'bg-glow-magenta text-white' : 'text-gray-400 hover:text-white'}`}>
            <Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ─── Tips ─── */}
      {tab === 'tips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{tips.length} tips · {tips.filter(t => t.isPublished).length} published</p>
            <button type="button" className="btn-primary gap-2 text-sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Tip</button>
          </div>
          {loading ? <div className="panel p-6 text-gray-400">Loading...</div> : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tips.map(tip => (
                <div key={tip._id} className="panel overflow-hidden">
                  {tip.imageUrl && <img src={tip.imageUrl} alt={tip.title} className="h-36 w-full object-cover" />}
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tip.isPublished ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gray-500/15 text-gray-400'}`}>{tip.isPublished ? 'Published' : 'Draft'}</span>
                      <span className="text-xs text-glow-magenta capitalize">{tip.category}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{tip.emoji}</span>
                      <div><h3 className="font-semibold text-white line-clamp-1">{tip.title}</h3><p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{tip.content}</p></div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button type="button" className="btn-secondary flex-1 gap-2 py-2 text-xs" onClick={() => openEdit(tip)}><Pencil className="h-3 w-3" /> Edit</button>
                      <button type="button" onClick={() => deleteTip(tip._id)} className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-300 hover:bg-red-500/20"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {tips.length === 0 && <div className="panel flex flex-col items-center py-12 text-center sm:col-span-2 xl:col-span-3"><BookOpen className="h-10 w-10 text-gray-600 mb-3" /><p className="text-gray-400">No beauty tips yet.</p></div>}
            </div>
          )}
        </div>
      )}

      {/* ─── Promo Cards ─── */}
      {tab === 'promo' && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Promotional Cards</h3>
              <p className="text-sm text-gray-400 mt-0.5">Edit the BOGO, COMBO, EXCLUSIVES, SALE banner cards</p>
            </div>
            <button type="button" className="btn-primary gap-2 text-sm self-start" onClick={savePromoCards} disabled={savingPromo}>
              {savingPromo ? 'Saving...' : 'Save All Cards'}
            </button>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {promoCards.map((card) => (
              <div key={card.id} className="panel overflow-hidden">
                <div className="relative h-28 flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(145deg, ${card.bgFrom}, ${card.bgTo})` }}>
                  <div className="text-center px-2">
                    <p className="font-heading font-black text-white text-2xl leading-none" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                      {card.emoji} {Array.isArray(card.title) ? card.title.join(' ') : card.title}
                    </p>
                    <p className="text-white/80 text-xs mt-1">{(card.subtitle || '').replace('\n', ' ')}</p>
                  </div>
                  <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${card.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {card.active ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="p-3 flex gap-2">
                  <button type="button" className="btn-secondary flex-1 gap-1.5 py-2 text-xs" onClick={() => openEditCard(card)}><Pencil className="h-3 w-3" /> Edit</button>
                  <button type="button" onClick={() => toggleCard(card.id)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${card.active ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-red-500/20 bg-red-500/10 text-red-300'}`}>
                    {card.active ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Top Banner ─── */}
      {tab === 'banner' && (
        <div className="panel p-6 space-y-5 max-w-2xl">
          <div><h3 className="text-lg font-semibold text-white">Top Banner Messages</h3><p className="text-sm text-gray-400 mt-1">Scrolling ticker at the very top of the site</p></div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex-1 text-sm text-white">{msg}</span>
                <button type="button" onClick={() => removeMessage(i)} className="text-gray-500 hover:text-red-400"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMessage()} placeholder="🎉 New message (press Enter)" />
            <button type="button" className="btn-primary px-4 text-sm" onClick={addMessage}>Add</button>
          </div>
          <button type="button" className="btn-primary text-sm" onClick={saveMessages} disabled={savingSettings}>{savingSettings ? 'Saving...' : 'Save Messages'}</button>
        </div>
      )}

      {/* ─── Announcement ─── */}
      {tab === 'announcement' && (
        <div className="panel p-6 space-y-5 max-w-2xl">
          <div><h3 className="text-lg font-semibold text-white">Site Announcement</h3><p className="text-sm text-gray-400 mt-1">Banner shown below the ticker</p></div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">Announcement Text</span>
            <textarea className="input min-h-[80px]" value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="🎉 Mega Sale: 30% off this weekend! Use code GLOW30" />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm cursor-pointer">
            <input type="checkbox" checked={announcementActive} onChange={e => setAnnouncementActive(e.target.checked)} className="h-4 w-4 accent-glow-magenta" />
            <span className="text-white font-medium">Show announcement on site</span>
          </label>
          {announcement && <div className="rounded-xl border border-glow-magenta/20 bg-glow-magenta/10 px-4 py-3 text-sm text-white">Preview: {announcement}</div>}
          <button type="button" className="btn-primary text-sm" onClick={saveMessages} disabled={savingSettings}>{savingSettings ? 'Saving...' : 'Save Announcement'}</button>
        </div>
      )}

      {/* ─── Edit Card Modal ─── */}
      <AnimatePresence>
        {editingCard && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="panel w-full max-w-md p-6 my-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Edit Promo Card</h2>
                <button type="button" onClick={closeEditCard} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              {/* Live preview */}
              <div className="mb-5 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(145deg, ${cardForm.bgFrom || '#FF85B3'}, ${cardForm.bgTo || '#D5106E'})` }}>
                <p className="font-heading font-black text-white text-xl text-center px-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  {cardForm.emoji} {typeof cardForm.title === 'string' ? cardForm.title : (cardForm.title || []).join(' ')}
                </p>
              </div>
              <div className="space-y-4">
                <label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Title</span>
                  <input className="input" value={typeof cardForm.title === 'string' ? cardForm.title : (cardForm.title || []).join(' ')} onChange={e => setCardForm(p => ({ ...p, title: e.target.value }))} /></label>
                <label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Subtitle (use \n for line break)</span>
                  <input className="input" name="subtitle" value={cardForm.subtitle || ''} onChange={handleCardChange} /></label>
                <label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Link</span>
                  <input className="input" name="link" value={cardForm.link || ''} onChange={handleCardChange} placeholder="/products" /></label>
                <div><span className="mb-2 block text-sm font-medium text-gray-300">Emoji</span>
                  <div className="flex flex-wrap gap-1.5">{CARD_EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setCardForm(p => ({ ...p, emoji: e }))}
                      className={`rounded-lg p-1.5 text-lg transition ${cardForm.emoji === e ? 'ring-2 ring-glow-magenta bg-glow-magenta/10' : 'hover:bg-white/5'}`}>{e}</button>
                  ))}</div>
                </div>
                <div><span className="mb-2 block text-sm font-medium text-gray-300">Color Preset</span>
                  <div className="flex flex-wrap gap-2">{BG_PRESETS.map(p => (
                    <button key={p.label} type="button" onClick={() => setCardForm(prev => ({ ...prev, bgFrom: p.from, bgTo: p.to }))}
                      className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition border ${cardForm.bgTo === p.to ? 'border-white/50 bg-white/10' : 'border-white/10 hover:border-white/25'}`}>
                      <span className="h-3.5 w-3.5 rounded-full flex-shrink-0" style={{ background: `linear-gradient(to right, ${p.from}, ${p.to})` }} />{p.label}
                    </button>
                  ))}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><span className="mb-1 block text-xs text-gray-400">From color</span>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={cardForm.bgFrom || '#FF85B3'} onChange={e => setCardForm(p => ({ ...p, bgFrom: e.target.value }))} className="h-8 w-10 rounded cursor-pointer border-0 bg-transparent" />
                      <input className="input text-xs py-2" value={cardForm.bgFrom || ''} onChange={e => setCardForm(p => ({ ...p, bgFrom: e.target.value }))} />
                    </div>
                  </label>
                  <label className="block"><span className="mb-1 block text-xs text-gray-400">To color</span>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={cardForm.bgTo || '#D5106E'} onChange={e => setCardForm(p => ({ ...p, bgTo: e.target.value }))} className="h-8 w-10 rounded cursor-pointer border-0 bg-transparent" />
                      <input className="input text-xs py-2" value={cardForm.bgTo || ''} onChange={e => setCardForm(p => ({ ...p, bgTo: e.target.value }))} />
                    </div>
                  </label>
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm cursor-pointer">
                  <input type="checkbox" name="active" checked={!!cardForm.active} onChange={handleCardChange} className="h-4 w-4 accent-glow-magenta" />
                  <span className="text-white font-medium">Show this card on site</span>
                </label>
              </div>
              <div className="mt-5 flex gap-3 justify-end">
                <button type="button" className="btn-secondary" onClick={closeEditCard}>Cancel</button>
                <button type="button" className="btn-primary" onClick={saveCardEdit}>Apply Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Tip Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm pt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="panel w-full max-w-2xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{editingTip ? 'Edit Tip' : 'Create Beauty Tip'}</h2>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleTipSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-medium text-gray-300">Title *</span>
                    <input className="input" name="title" value={form.title} onChange={handleChange} required /></label>
                  <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-medium text-gray-300">Content *</span>
                    <textarea className="input min-h-[100px]" name="content" value={form.content} onChange={handleChange} required /></label>
                  <label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Category</span>
                    <select className="input" name="category" value={form.category} onChange={handleChange}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select></label>
                  <div><span className="mb-2 block text-sm font-medium text-gray-300">Emoji</span>
                    <div className="flex flex-wrap gap-1.5">{EMOJIS.map(e => (
                      <button key={e} type="button" onClick={() => setForm(p => ({ ...p, emoji: e }))}
                        className={`rounded-lg p-1.5 text-xl transition ${form.emoji === e ? 'ring-2 ring-glow-magenta bg-glow-magenta/10' : 'hover:bg-white/5'}`}>{e}</button>
                    ))}</div>
                  </div>
                  <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-medium text-gray-300">Image URL</span>
                    <input className="input" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." /></label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm cursor-pointer sm:col-span-2">
                    <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} className="h-4 w-4 accent-glow-magenta" />
                    <span className="text-white">Published</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editingTip ? 'Update Tip' : 'Create Tip'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}