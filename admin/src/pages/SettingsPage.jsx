import { Save, ShieldCheck, Store } from 'lucide-react';
import { useMemo, useState } from 'react';

const defaultStoreSettings = {
  storeName: 'Glowsiaa',
  supportEmail: 'support@glowsiaa.com',
  supportPhone: '01700000000',
  defaultDeliveryInsideDhaka: '60',
  defaultDeliveryOutsideDhaka: '120',
  cashOnDeliveryEnabled: true,
};

export default function SettingsPage() {
  const adminUser = useMemo(() => JSON.parse(localStorage.getItem('adminUser') || '{}'), []);
  const savedSettings = useMemo(() => {
    const stored = localStorage.getItem('adminStoreSettings');
    return stored ? JSON.parse(stored) : defaultStoreSettings;
  }, []);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [storeSettings, setStoreSettings] = useState(savedSettings);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (event) => {
    const { name, value, type, checked } = event.target;
    setStoreSettings((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const submitPasswordChange = (event) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('Choose a new password that is different from the current one.');
      return;
    }

    setPasswordMessage(
      'Password form submitted successfully. This page currently confirms the change locally because the API does not expose an admin password update route.'
    );
    setPasswordForm({ currentPassword: '', newPassword: '' });
  };

  const saveStoreSettings = (event) => {
    event.preventDefault();
    localStorage.setItem('adminStoreSettings', JSON.stringify(storeSettings));
    setSettingsMessage('Store preferences saved for this admin browser session.');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-6">
        <div className="panel p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-magenta/20 to-glow-purple/20 text-glow-magenta">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Profile</h2>
              <p className="text-sm text-gray-400">Current authenticated administrator details.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Name</p>
              <p className="mt-2 text-lg font-semibold text-white">{adminUser.name || 'Admin'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Email</p>
              <p className="mt-2 text-lg font-semibold text-white">{adminUser.email || 'admin@glowsiaa.com'}</p>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <h3 className="text-xl font-bold text-white">Change Password</h3>
          <p className="mt-1 text-sm text-gray-400">Protect admin access with regular credential updates.</p>

          <form onSubmit={submitPasswordChange} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Current password</span>
              <input
                className="input"
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">New password</span>
              <input
                className="input"
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </label>

            {passwordError ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{passwordError}</div>
            ) : null}
            {passwordMessage ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{passwordMessage}</div>
            ) : null}

            <button type="submit" className="btn-primary gap-2">
              <Save className="h-4 w-4" />
              Update Password
            </button>
          </form>
        </div>
      </div>

      <div className="panel p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-magenta/20 to-glow-purple/20 text-glow-magenta">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Store Settings</h2>
            <p className="text-sm text-gray-400">Session-based storefront preferences for operations and support.</p>
          </div>
        </div>

        <form onSubmit={saveStoreSettings} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Store name</span>
              <input className="input" name="storeName" value={storeSettings.storeName} onChange={handleSettingsChange} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Support email</span>
              <input className="input" type="email" name="supportEmail" value={storeSettings.supportEmail} onChange={handleSettingsChange} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Support phone</span>
              <input className="input" name="supportPhone" value={storeSettings.supportPhone} onChange={handleSettingsChange} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Inside Dhaka delivery fee</span>
              <input
                className="input"
                type="number"
                min="0"
                name="defaultDeliveryInsideDhaka"
                value={storeSettings.defaultDeliveryInsideDhaka}
                onChange={handleSettingsChange}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Outside Dhaka delivery fee</span>
              <input
                className="input"
                type="number"
                min="0"
                name="defaultDeliveryOutsideDhaka"
                value={storeSettings.defaultDeliveryOutsideDhaka}
                onChange={handleSettingsChange}
              />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white">
              <input
                type="checkbox"
                name="cashOnDeliveryEnabled"
                checked={storeSettings.cashOnDeliveryEnabled}
                onChange={handleSettingsChange}
                className="h-4 w-4 accent-glow-magenta"
              />
              Cash on delivery enabled
            </label>
          </div>

          {settingsMessage ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{settingsMessage}</div>
          ) : null}

          <button type="submit" className="btn-primary gap-2">
            <Save className="h-4 w-4" />
            Save Store Settings
          </button>
        </form>
      </div>
    </div>
  );
}
