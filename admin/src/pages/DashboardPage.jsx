import { motion } from 'framer-motion';
import { AlertCircle, Package, ShoppingCart, Sparkles, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../api/axios';

const currencyFormatter = new Intl.NumberFormat('en-BD');

const statusStyles = {
  pending: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  processing: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  shipped: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/20',
};

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [statsResponse, revenueResponse] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/revenue'),
        ]);

        setStats(statsResponse.data.stats);
        setRevenue(revenueResponse.data.revenue || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const statCards = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      {
        label: 'Total Orders',
        value: currencyFormatter.format(stats.totalOrders || 0),
        icon: ShoppingCart,
        note: `${stats.recentOrders?.length || 0} recent orders in focus`,
      },
      {
        label: 'Total Revenue',
        value: `৳${currencyFormatter.format(stats.totalRevenue || 0)}`,
        icon: Wallet,
        note: `${stats.pendingOrders || 0} orders still pending`,
      },
      {
        label: 'Total Products',
        value: currencyFormatter.format(stats.totalProducts || 0),
        icon: Package,
        note: 'Catalog sync is live',
      },
      {
        label: 'Pending Orders',
        value: currencyFormatter.format(stats.pendingOrders || 0),
        icon: AlertCircle,
        note: stats.pendingOrders ? 'Needs fulfillment attention' : 'Queue is clear',
      },
    ];
  }, [stats]);

  if (loading) {
    return <div className="panel p-6 text-sm text-gray-300">Loading dashboard insights...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="grid gap-4 grid-cols-2 xl:grid-cols-4"
      >
        {statCards.map(({ label, value, icon: Icon, note }) => (
          <motion.div key={label} variants={statVariants} className="panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{label}</p>
                <h2 className="mt-2 text-3xl font-bold text-white">{value}</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-magenta/20 to-glow-purple/20 text-glow-magenta">
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-emerald-300">↗ {note}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="panel p-4">
          <div className="mb-4 flex items-center justify-between px-2">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
              <p className="text-sm text-gray-400">Daily revenue for the last 30 days</p>
            </div>
            <div className="rounded-xl border border-glow-magenta/20 bg-glow-magenta/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-glow-magenta">
              Live
            </div>
          </div>

          <div className="h-[300px] rounded-xl bg-white/5 p-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenue} margin={{ top: 12, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `৳${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value) => [`৳${currencyFormatter.format(value)}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#D5106E" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              <p className="text-sm text-gray-400">Latest five customer checkouts</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-glow-magenta">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-3 pr-4 font-medium">Order ID</th>
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Total</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentOrders || []).map((order) => (
                  <tr key={order._id} className="border-b border-white/5 text-gray-200 last:border-none">
                    <td className="py-3 pr-4 font-medium text-white">{order.orderId}</td>
                    <td className="py-3 pr-4">{order.customer?.name}</td>
                    <td className="py-3 pr-4">৳{currencyFormatter.format(order.total || 0)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.status] || statusStyles.pending}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
