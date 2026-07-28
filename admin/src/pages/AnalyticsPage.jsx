import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../api/axios';

const COLORS = ['#D5106E', '#7C3AED', '#059669', '#F59E0B', '#3B82F6', '#EF4444'];

const currFmt = (v) => `৳${Number(v || 0).toLocaleString('en-BD')}`;

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [sRes, rRes, oRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/revenue'),
          api.get('/admin/orders'),
        ]);
        setStats(sRes.data.stats);
        setRevenue(rRes.data.revenue || []);
        setOrders(oRes.data.orders || []);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const statusDistribution = useMemo(() => {
    if (!orders.length) return [];
    const counts = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [orders]);

  const categoryRevenue = useMemo(() => {
    const cats = {};
    orders.forEach(o => {
      if (!['cancelled'].includes(o.status)) {
        o.items?.forEach(item => {
          const cat = item.product?.category || 'Other';
          cats[cat] = (cats[cat] || 0) + item.price * item.quantity;
        });
      }
    });
    return Object.entries(cats).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [orders]);

  const paymentMethods = useMemo(() => {
    const pm = {};
    orders.forEach(o => { pm[o.paymentMethod] = (pm[o.paymentMethod] || 0) + 1; });
    return Object.entries(pm).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  }, [orders]);

  const weeklyRevenue = useMemo(() => {
    // Last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    const map = {};
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
      const day = o.createdAt?.slice(0, 10);
      if (day && days.includes(day)) map[day] = (map[day] || 0) + o.total;
    });
    return days.map(d => ({ date: d.slice(5), revenue: map[d] || 0 }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const prods = {};
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
      o.items?.forEach(item => {
        const name = item.name?.split(' ').slice(0, 3).join(' ');
        if (!prods[name]) prods[name] = { name, qty: 0, revenue: 0 };
        prods[name].qty += item.quantity;
        prods[name].revenue += item.price * item.quantity;
      });
    });
    return Object.values(prods).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [orders]);

  if (loading) return <div className="panel p-6 text-sm text-gray-300">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Revenue', value: currFmt(stats?.totalRevenue), sub: 'excl. cancelled', color: 'text-emerald-300' },
          { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString(), sub: `${stats?.pendingOrders} pending`, color: 'text-blue-300' },
          { label: 'Avg Order Value', value: currFmt(stats?.totalOrders ? stats.totalRevenue / stats.totalOrders : 0), sub: 'per order', color: 'text-glow-magenta' },
          { label: 'Customers', value: stats?.totalUsers?.toLocaleString(), sub: 'registered accounts', color: 'text-purple-300' },
        ].map(k => (
          <div key={k.label} className="panel p-5">
            <p className="text-xs text-gray-400">{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* 30-day revenue */}
      <div className="panel p-5">
        <h3 className="text-lg font-semibold text-white mb-4">30-Day Revenue</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D5106E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D5106E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} tickFormatter={v => `৳${v}`} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} formatter={v => [currFmt(v), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#D5106E" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Weekly trend */}
        <div className="panel p-5">
          <h3 className="font-semibold text-white mb-4">This Week</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenue}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={10} />
                <YAxis stroke="#6B7280" fontSize={10} tickFormatter={v => `৳${v}`} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} formatter={v => [currFmt(v), 'Revenue']} />
                <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status distribution */}
        <div className="panel p-5">
          <h3 className="font-semibold text-white mb-4">Order Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {statusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment methods */}
        <div className="panel p-5">
          <h3 className="font-semibold text-white mb-4">Payment Methods</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {paymentMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="panel p-5">
        <h3 className="font-semibold text-white mb-4">Top Products by Revenue</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="#6B7280" fontSize={11} tickFormatter={v => `৳${v}`} />
              <YAxis type="category" dataKey="name" stroke="#6B7280" fontSize={10} width={130} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} formatter={v => [currFmt(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#D5106E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category revenue */}
      {categoryRevenue.length > 0 && (
        <div className="panel p-5">
          <h3 className="font-semibold text-white mb-4">Revenue by Category</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {categoryRevenue.map((c, i) => (
              <div key={c.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="h-1.5 w-full rounded-full bg-white/10 mb-3">
                  <div className="h-full rounded-full" style={{ width: `${(c.value / Math.max(...categoryRevenue.map(x => x.value))) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                </div>
                <p className="text-xs text-gray-400">{c.name}</p>
                <p className="text-lg font-bold text-white mt-0.5">{currFmt(c.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

