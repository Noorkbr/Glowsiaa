import {
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const pageTitles = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/products': 'Products',
  '/users': 'Users',
  '/settings': 'Settings',
};

export default function AdminLayout({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const currentTitle = pageTitles[location.pathname] || 'Admin Panel';

  const handleLogout = () => {
    onLogout?.();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-midnight text-white">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-midnight/95 px-4 py-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-magenta/25 to-glow-purple/25 text-glow-magenta">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-transparent bg-gradient-to-r from-glow-magenta to-glow-purple bg-clip-text">
              Glowsiaa
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Admin</p>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {navigation.map(({ name, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end={href === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-r-xl border-l-2 px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-glow-magenta bg-glow-magenta/20 text-glow-magenta'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-glow-magenta to-glow-purple text-sm font-bold text-white">
              {(adminUser?.name || 'Admin').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{adminUser?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="btn-secondary w-full gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <header className="fixed left-64 right-0 top-0 z-20 border-b border-white/10 bg-midnight/85 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Glowsiaa Control Center</p>
            <h1 className="mt-1 text-2xl font-bold text-white">{currentTitle}</h1>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">Admin</p>
              <p className="text-xs text-gray-400">{adminUser?.email || 'admin@glowsiaa.com'}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-glow-magenta to-glow-purple text-sm font-bold text-white">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="ml-64 min-h-screen bg-midnight px-6 pb-6 pt-24">
        <Outlet />
      </main>
    </div>
  );
}
