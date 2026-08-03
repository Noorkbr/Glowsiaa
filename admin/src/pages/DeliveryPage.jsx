import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, RefreshCw, Package, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const COMPANIES = [
  { key: 'steadfast', label: 'Steadfast', color: 'from-emerald-500 to-teal-600', trackUrl: (n) => `https://steadfast.com.bd/track/${n}` },
  { key: 'pathao',    label: 'Pathao',    color: 'from-violet-500 to-purple-600', trackUrl: (n) => `https://merchant.pathao.com/track/${n}` },
  { key: 'redx',      label: 'RedX',      color: 'from-red-500 to-rose-600',     trackUrl: (n) => `https://redx.com.bd/track/?trackingId=${n}` },
];

const fmt = (v) => `৳${Number(v || 0).toLocaleString('en-BD')}`;

export default function DeliveryPage() {
  const [orders, setOrders]               = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkCompany, setBulkCompany]     = useState('steadfast');
  const [useRealApi, setUseRealApi]       = useState(false);
  const [loading, setLoading]             = useState(true);
  const [pushing, setPushing]             = useState('');
  const [balance, setBalance]             = useState(null);
  const [tab, setTab]                     = useState('pending');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data.orders || []);
      try {
        const bRes = await api.get('/admin/delivery/balance');
        if (bRes.data.success) setBalance(bRes.data.balance);
      } catch { /* balance check optional */ }
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  };

  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status));
  const shippedOrders = orders.filter(o => o.status === 'shipped');

  const toggleSelect = (id) => setSelectedOrders(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const selectAll    = () => setSelectedOrders(p => p.length === pendingOrders.length ? [] : pendingOrders.map(o => o.orderId));

  const pushSingle = async (order, company) => {
    setPushing(order.orderId);
    try {
      const { data } = await api.post('/admin/push-delivery', {
        orderId: order.orderId,
        company,
        useRealApi,
      });
      setOrders(p => p.map(o => o._id === order._id ? data.order : o));
      toast.success(`${order.orderId} → ${company.toUpperCase()} ✓ Tracking: ${data.trackingNumber}`);
    } catch (e) {
      toast.error(e.response?.data?.message || `Failed to push to ${company}`);
    }
    setPushing('');
  };

  const pushBulk = async () => {
    if (selectedOrders.length === 0) { toast.error('Select at least one order'); return; }
    for (const orderId of selectedOrders) {
      const order = orders.find(o => o.orderId === orderId);
      if (order) await pushSingle(order, bulkCompany);
    }
    setSelectedOrders([]);
  };

  const displayOrders = tab === 'pending' ? pendingOrders : shippedOrders;

  const getTrackUrl = (order) => {
    const company = COMPANIES.find(c => c.key === order.trackingCompany);
    return company ? company.trackUrl(order.trackingNumber) : `#`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="h-6 w-6 text-glow-magenta" /> Delivery Partners
          </h2>
          <p className="text-sm text-gray-400 mt-1">Push orders to Steadfast, Pathao, or RedX — real API or simulation mode</p>
        </div>
        <button type="button" onClick={fetchData} className="btn-secondary gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Partner cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {COMPANIES.map(c => {
          const count = orders.filter(o => o.trackingCompany === c.key).length;
          return (
            <div key={c.key} className="panel p-5">
              <div className={`mb-3 h-1.5 w-full rounded-full bg-gradient-to-r ${c.color}`} />
              <h3 className="font-bold text-white text-lg">{c.label}</h3>
              <p className="mt-1 text-xs text-gray-400">{count} shipment{count !== 1 ? 's' : ''} total</p>
              {c.key === 'steadfast' && balance && (
                <p className="mt-2 text-sm text-emerald-300 font-semibold">Balance: ৳{balance.current_balance ?? '—'}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* API mode toggle */}
      <div className="panel p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-white">API Mode</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {useRealApi
              ? '🟢 Using real delivery partner APIs (requires API keys in .env)'
              : '🔵 Simulation mode — generates fake tracking numbers (no real API calls)'
            }
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input type="checkbox" className="sr-only" checked={useRealApi} onChange={e => setUseRealApi(e.target.checked)} />
          <div className={`h-6 w-11 rounded-full transition-colors ${useRealApi ? 'bg-glow-magenta' : 'bg-white/20'}`}>
            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${useRealApi ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </label>
      </div>

      {/* Bulk push bar */}
      {tab === 'pending' && selectedOrders.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="panel flex flex-wrap items-center gap-4 p-4 border border-glow-magenta/30">
          <span className="text-sm text-white font-medium">{selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected</span>
          <select className="input max-w-[160px] py-2 text-sm" value={bulkCompany} onChange={e => setBulkCompany(e.target.value)}>
            {COMPANIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <button type="button" className="btn-primary gap-2 text-sm" onClick={pushBulk}>
            <Truck className="h-4 w-4" /> Push All to {COMPANIES.find(c => c.key === bulkCompany)?.label}
          </button>
          <button type="button" className="btn-secondary text-sm" onClick={() => setSelectedOrders([])}>Clear</button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'pending', label: `Ready to Ship (${pendingOrders.length})` },
          { key: 'shipped', label: `Shipped (${shippedOrders.length})` },
        ]).map(t => (
          <button key={t.key} type="button"
            onClick={() => { setTab(t.key); setSelectedOrders([]); }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${t.key === tab ? 'bg-glow-magenta text-white' : 'btn-secondary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm" style={{ minWidth: '720px' }}>
            <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
              <tr>
                {tab === 'pending' && (
                  <th className="px-4 py-3">
                    <input type="checkbox"
                      checked={selectedOrders.length === pendingOrders.length && pendingOrders.length > 0}
                      onChange={selectAll}
                      className="accent-glow-magenta" />
                  </th>
                )}
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">COD</th>
                <th className="px-4 py-3">Status</th>
                {tab === 'shipped' && <th className="px-4 py-3">Tracking</th>}
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">Loading orders...</td></tr>
              ) : displayOrders.length > 0 ? displayOrders.map(order => (
                <tr key={order._id} className="border-t border-white/10 hover:bg-white/[0.02]">
                  {tab === 'pending' && (
                    <td className="px-4 py-4">
                      <input type="checkbox"
                        checked={selectedOrders.includes(order.orderId)}
                        onChange={() => toggleSelect(order.orderId)}
                        className="accent-glow-magenta" />
                    </td>
                  )}
                  <td className="px-4 py-4 font-bold text-glow-magenta text-xs">{order.orderId}</td>
                  <td className="px-4 py-4 text-white font-medium">{order.customer?.name}</td>
                  <td className="px-4 py-4 text-gray-300">{order.customer?.phone}</td>
                  <td className="px-4 py-4 text-gray-300 max-w-[200px]">
                    <p className="truncate">{order.customer?.address}</p>
                    <p className="text-xs text-gray-500 capitalize">{order.customer?.location?.replace('_', ' ')}</p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-white">{fmt(order.total)}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-yellow-500/15 px-2.5 py-1 text-xs font-semibold capitalize text-yellow-300">
                      {order.status}
                    </span>
                  </td>
                  {tab === 'shipped' && (
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-gray-300 capitalize">{order.trackingCompany}</p>
                      <p className="text-xs font-mono text-glow-magenta">{order.trackingNumber}</p>
                    </td>
                  )}
                  <td className="px-4 py-4">
                    {tab === 'pending' ? (
                      <div className="flex flex-wrap gap-1">
                        {COMPANIES.map(c => (
                          <button key={c.key} type="button"
                            onClick={() => pushSingle(order, c.key)}
                            disabled={pushing === order.orderId}
                            title={`Push to ${c.label}`}
                            className={`rounded-lg bg-gradient-to-r ${c.color} px-2.5 py-1.5 text-xs font-bold text-white transition hover:scale-105 disabled:opacity-40`}>
                            {pushing === order.orderId ? '...' : c.label.slice(0, 5)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <a href={getTrackUrl(order)} target="_blank" rel="noreferrer"
                          className="text-xs text-glow-magenta hover:underline font-medium">
                          Track on {COMPANIES.find(c => c.key === order.trackingCompany)?.label || 'site'} →
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Package className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No {tab === 'pending' ? 'orders ready to ship' : 'shipped orders'} yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
