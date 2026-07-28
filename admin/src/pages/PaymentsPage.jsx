import { CheckCircle, CreditCard, ExternalLink, XCircle, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const GATEWAYS = [
  {
    key: 'bkash',
    name: 'bKash',
    logo: '💙',
    color: 'from-[#E2136E] to-[#9B1B52]',
    desc: 'Bangladesh\'s #1 mobile payment — 60M+ users',
    docs: 'https://developer.bka.sh/docs/tokenized-checkout-process',
    envVars: ['BKASH_BASE_URL', 'BKASH_APP_KEY', 'BKASH_APP_SECRET', 'BKASH_USERNAME', 'BKASH_PASSWORD'],
  },
  {
    key: 'nagad',
    name: 'Nagad',
    logo: '🟠',
    color: 'from-[#F06C1C] to-[#C45315]',
    desc: 'Bangladesh Post Office digital payment',
    docs: 'https://nagad.com.bd/api/',
    envVars: ['NAGAD_BASE_URL', 'NAGAD_MERCHANT_ID', 'NAGAD_MERCHANT_NUMBER', 'NAGAD_PUBLIC_KEY', 'NAGAD_PRIVATE_KEY'],
  },
  {
    key: 'cod',
    name: 'Cash on Delivery',
    logo: '💵',
    color: 'from-emerald-500 to-teal-600',
    desc: 'Always available — no setup required',
    docs: null,
    envVars: [],
  },
];

export default function PaymentsPage() {
  const [gateways, setGateways] = useState({ bkash: { enabled: false }, nagad: { enabled: false }, cod: { enabled: true } });
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gwRes, settingsRes] = await Promise.all([
        api.get('/payments/gateways'),
        api.get('/settings'),
      ]);
      setGateways(gwRes.data.gateways || {});
      setSettings(settingsRes.data.settings || {});
    } catch { toast.error('Failed to load payment data'); }
    setLoading(false);
  };

  const toggleGateway = async (key, current) => {
    setSaving(true);
    try {
      await api.put(`/settings/${key}_enabled`, { value: !current });
      setSettings(p => ({ ...p, [`${key}_enabled`]: !current }));
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} ${!current ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to update setting'); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Payment Gateways</h2>
        <p className="text-sm text-gray-400 mt-1">Configure bKash, Nagad, and COD. Add API credentials to your server .env file.</p>
      </div>

      {loading ? <div className="panel p-6 text-gray-400">Loading...</div> : (
        <div className="grid gap-6 lg:grid-cols-3">
          {GATEWAYS.map(gw => {
            const gwStatus = gateways[gw.key] || {};
            const settingEnabled = settings[`${gw.key}_enabled`] ?? (gw.key === 'cod');
            const serverConfigured = gwStatus.enabled;
            const isSandbox = gwStatus.sandbox;

            return (
              <div key={gw.key} className="panel overflow-hidden">
                <div className={`h-2 w-full bg-gradient-to-r ${gw.color}`} />
                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{gw.logo}</span>
                      <div>
                        <h3 className="font-bold text-white">{gw.name}</h3>
                        <p className="text-xs text-gray-400">{gw.desc}</p>
                      </div>
                    </div>
                    {gw.key !== 'cod' && (
                      <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${serverConfigured ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                        {serverConfigured ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {serverConfigured ? (isSandbox ? 'Sandbox' : 'Live') : 'Not Configured'}
                      </div>
                    )}
                  </div>

                  {/* Status / Toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="text-sm font-medium text-white">
                      {settingEnabled ? '✅ Enabled on Checkout' : '⏸️ Disabled'}
                    </span>
                    {gw.key !== 'cod' && (
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="sr-only" checked={settingEnabled}
                          onChange={() => toggleGateway(gw.key, settingEnabled)} disabled={saving} />
                        <div className={`h-5 w-9 rounded-full transition-colors ${settingEnabled ? 'bg-glow-magenta' : 'bg-white/20'}`}>
                          <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${settingEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </label>
                    )}
                  </div>

                  {/* ENV Vars needed */}
                  {gw.envVars.length > 0 && !serverConfigured && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-400 mb-2">Required in server .env:</p>
                      <div className="space-y-1">
                        {gw.envVars.map(v => (
                          <code key={v} className="block text-[10px] font-mono text-glow-magenta bg-glow-magenta/5 px-2 py-1 rounded">
                            {v}=
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  {gw.docs && (
                    <a href={gw.docs} target="_blank" rel="noreferrer"
                      className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition">
                      <ExternalLink className="h-3 w-3" /> View API Docs
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How to setup bKash */}
      <div className="panel p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-glow-magenta" /> Quick Setup Guide
        </h3>
        <ol className="space-y-3 text-sm text-gray-300">
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-glow-magenta/20 text-xs font-bold text-glow-magenta">1</span>Register as a merchant at <a href="https://developer.bka.sh" className="text-glow-magenta hover:underline" target="_blank" rel="noreferrer">developer.bka.sh</a></li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-glow-magenta/20 text-xs font-bold text-glow-magenta">2</span>Get your sandbox credentials from the bKash developer portal</li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-glow-magenta/20 text-xs font-bold text-glow-magenta">3</span>Add credentials to <code className="font-mono text-glow-magenta">server/.env</code> (see .env.example)</li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-glow-magenta/20 text-xs font-bold text-glow-magenta">4</span>Restart the server — gateway will show as &quot;Sandbox&quot; above</li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-glow-magenta/20 text-xs font-bold text-glow-magenta">5</span>Toggle &quot;Enabled on Checkout&quot; to show bKash as a payment option</li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-glow-magenta/20 text-xs font-bold text-glow-magenta">6</span>For production, change BKASH_BASE_URL to the production URL and get live keys</li>
        </ol>
      </div>
    </div>
  );
}

