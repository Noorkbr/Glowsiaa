import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AdminLoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);

      if (data?.user?.role !== 'admin') {
        setError('You do not have permission to access the admin panel.');
        return;
      }

      onLogin?.({ token: data.token, user: data.user });
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in with those credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-midnight px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(213,16,110,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_28%)]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel relative z-10 w-full max-w-md p-8 shadow-glow"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-glow-magenta/20 to-glow-purple/20 text-glow-magenta">
            <Sparkles className="h-8 w-8" />
          </div>
          <p className="font-display text-3xl font-bold text-transparent bg-gradient-to-r from-glow-magenta to-glow-purple bg-clip-text">
            Glowsiaa
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Admin Panel</h1>
          <p className="mt-2 text-sm text-gray-400">Secure access for store operations, order flow, and catalog management.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Mail className="h-4 w-4" /> Email address
            </span>
            <input
              className="input"
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@glowsiaa.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Lock className="h-4 w-4" /> Password
            </span>
            <input
              className="input"
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary w-full gap-2">
            <ShieldCheck className="h-4 w-4" />
            {loading ? 'Signing in...' : 'Login to Admin'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
