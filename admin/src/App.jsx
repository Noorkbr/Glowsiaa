import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import AdminLayout from './components/layout/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import BannersPage from './pages/BannersPage';
import ContentPage from './pages/ContentPage';
import CouponsPage from './pages/CouponsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DeliveryPage from './pages/DeliveryPage';
import PaymentsPage from './pages/PaymentsPage';
import CategoriesPage from './pages/CategoriesPage';
import MediaPage from './pages/MediaPage';

function ProtectedRoute({ isAuthenticated, authReady }) {
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-midnight text-white">
        <div className="panel px-6 py-5 text-sm text-gray-300">Loading admin panel...</div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AuthLayout({ onLogout }) {
  return <AdminLayout onLogout={onLogout} />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('adminToken')));
    setAuthReady(true);
  }, []);

  const handleLogin = ({ token, user }) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminStoreSettings');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <AdminLoginPage onLogin={handleLogin} />
          )
        }
      />

      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} authReady={authReady} />}>
        <Route element={<AuthLayout onLogout={handleLogout} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/banners" element={<BannersPage />} />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
    </>
    </ThemeProvider>
  );
}
