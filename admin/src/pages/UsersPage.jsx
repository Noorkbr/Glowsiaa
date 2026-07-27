import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function UsersPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/admin/stats');
        setTotalUsers(data.stats?.totalUsers || 0);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Failed to load user summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Registered customers</p>
              <h2 className="mt-2 text-4xl font-bold text-white">{loading ? '—' : totalUsers}</h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-magenta/20 to-glow-purple/20 text-glow-magenta">
              <Users className="h-7 w-7" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-400">This count reflects all shopper accounts currently stored in the Glowsiaa platform.</p>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">User Directory Status</h3>
            <p className="mt-1 text-sm text-gray-400">The full searchable user table will be introduced in a dedicated customer management release.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Metric</th>
                  <th className="px-6 py-4 font-medium">Current Value</th>
                  <th className="px-6 py-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/10 text-gray-200">
                  <td className="px-6 py-4 font-medium text-white">Total Customers</td>
                  <td className="px-6 py-4">{loading ? 'Loading...' : totalUsers}</td>
                  <td className="px-6 py-4 text-gray-400">Customer list view is coming soon while analytics and operations are already available.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
