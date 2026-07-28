import {
  BarChart3,
  CreditCard,
  FolderTree,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Sun,
  Tag,
  Truck,
  Upload,
  Users,
  FileText,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const navigation = [
  { name: 'Dashboard',   href: '/',           icon: LayoutDashboard },
  { name: 'Orders',      href: '/orders',     icon: ShoppingCart },
  { name: 'Products',    href: '/products',   icon: Package },
  { name: 'Categories',  href: '/categories', icon: FolderTree },
  { name: 'Banners',     href: '/banners',    icon: Image },
  { name: 'Content',     href: '/content',    icon: FileText },
  { name: 'Media',       href: '/media',      icon: Upload },
  { name: 'Coupons',     href: '/coupons',    icon: Tag },
  { name: 'Analytics',   href: '/analytics',  icon: BarChart3 },
  { name: 'Delivery',    href: '/delivery',   icon: Truck },
  { name: 'Payments',    href: '/payments',   icon: CreditCard },
  { name: 'Users',       href: '/users',      icon: Users },
  { name: 'Settings',    href: '/settings',   icon: Settings },
];

const pageTitles = {
  '/': 'Dashboard', '/orders': 'Orders', '/products': 'Products',
  '/categories': 'Categories', '/banners': 'Banner Manager',
  '/content': 'Content & Tips', '/media': 'Media & Logo',
  '/coupons': 'Coupons', '/analytics': 'Analytics',
  '/delivery': 'Delivery Partners', '/payments': 'Payment Gateways',
  '/users': 'Users', '/settings': 'Settings',
};

export default function AdminLayout({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const currentTitle = pageTitles[location.pathname] || 'Admin Panel';

  const handleLogout = () => { onLogout?.(); navigate('/login', { replace: true }); };
  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-magenta/25 to-glow-purple/25 text-glow-magenta">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-transparent bg-gradient-to-r from-glow-magenta to-glow-purple bg-clip-text">Glowsiaa</p>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Admin</p>
          </div>
        </div>
        {/* Close button mobile */}
        <button type="button" onClick={closeSidebar} className="lg:hidden rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/10">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-8 space-y-1 flex-1 overflow-y-auto">
        {navigation.map(({ name, href, icon: Icon }) => (
          <NavLink key={href} to={href} end={href === '/'} onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl border-l-2 px-4 py-2.5 text-sm font-medium transition ${
                isActive ? 'border-glow-magenta bg-glow-magenta/20 text-glow-magenta' : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }>
            <Icon className="h-4 w-4 shrink-0" />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-glow-magenta to-glow-purple text-sm font-bold text-white">
            {(adminUser?.name || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{adminUser?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate">{adminUser?.email || 'admin@glowsiaa.com'}</p>
          </div>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary w-full gap-2 text-sm py-2">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-midnight text-white">
      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={closeSidebar} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-midnight/98 px-4 py-5 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* ── Top header ── */}
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-midnight/85 px-4 py-3 backdrop-blur-xl lg:left-64 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-white lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="hidden text-xs uppercase tracking-[0.3em] text-gray-500 sm:block">Glowsiaa Control Center</p>
              <h1 className="text-lg font-bold text-white sm:text-2xl">{currentTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <button type="button" onClick={toggleTheme} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white" aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">Admin</p>
              <p className="text-xs text-gray-400 truncate max-w-[120px]">{adminUser?.email || 'admin@glowsiaa.com'}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-glow-magenta to-glow-purple text-sm font-bold text-white">
              {(adminUser?.name || 'A').slice(0,1).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="min-h-screen bg-midnight px-4 pb-6 pt-20 sm:px-6 lg:ml-64 lg:px-6 lg:pt-24">
        <Outlet />
      </main>
    </div>
  );
}
