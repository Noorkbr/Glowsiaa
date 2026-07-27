import { Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 25;

  useEffect(() => {
    const controller = new AbortController();
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/admin/users', {
          params: { search: search || undefined, page, limit },
          signal: controller.signal,
        });
        setUsers(data.users || []);
        setTotal(data.total || 0);
      } catch (requestError) {
        if (requestError.name !== 'CanceledError') {
          setError(requestError.response?.data?.message || 'Failed to load users.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    return () => controller.abort();
  }, [search, page]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
      ) : null}

      <div className="panel p-6 max-w-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Registered customers</p>
            <h2 className="mt-2 text-4xl font-bold text-white">{loading && !total ? '—' : total}</h2>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-magenta/20 to-glow-purple/20 text-glow-magenta">
            <Users className="h-7 w-7" />
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-400">All registered shoppers on the Glowsiaa platform.</p>
      </div>

      <div className="panel p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            className="input pl-11"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-200">
            <thead className="bg-white/5 text-gray-400">
              <tr>
                <th className="px-4 py-4 font-medium">#</th>
                <th className="px-4 py-4 font-medium">Name</th>
                <th className="px-4 py-4 font-medium">Email</th>
                <th className="px-4 py-4 font-medium">Phone</th>
                <th className="px-4 py-4 font-medium">Role</th>
                <th className="px-4 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-400" colSpan={6}>
                    Loading users…
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, i) => (
                  <tr key={user._id} className="border-t border-white/10 hover:bg-white/[0.02]">
                    <td className="px-4 py-4 text-gray-500">{(page - 1) * limit + i + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-glow-magenta/30 to-glow-purple/30 text-sm font-bold text-white">
                          {user.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-300">{user.email}</td>
                    <td className="px-4 py-4 text-gray-300">
                      {user.phone || <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full border border-glow-magenta/20 bg-glow-magenta/10 px-3 py-1 text-xs font-semibold capitalize text-glow-magenta">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-400">{formatDate(user.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-400" colSpan={6}>
                    No users found{search ? ` for "${search}"` : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
            <p className="text-sm text-gray-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
