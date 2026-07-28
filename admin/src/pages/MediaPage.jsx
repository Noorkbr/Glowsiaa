import { useRef, useState, useEffect } from 'react';
import { Upload, Image, Trash2, Copy, Check, Globe, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function MediaPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoAlt, setLogoAlt] = useState('Glowsiaa');
  const [savingLogo, setSavingLogo] = useState(false);
  const [previewLogo, setPreviewLogo] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
    fetchLogoSettings();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/uploads/list');
      setFiles(data.files || []);
    } catch { /* No files yet is OK */ }
    setLoading(false);
  };

  const fetchLogoSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setLogoUrl(data.settings?.logo_url || '');
      setLogoAlt(data.settings?.logo_alt || 'Glowsiaa');
      setPreviewLogo(data.settings?.logo_url || '');
    } catch {}
  };

  const uploadFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Image uploaded!');
      setFiles(p => [{ filename: data.filename, url: data.url, size: data.size, createdAt: new Date() }, ...p]);
      return data.url;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) await uploadFile(file);
    else toast.error('Please drop an image file');
  };

  const deleteFile = async (filename) => {
    if (!confirm(`Delete ${filename}?`)) return;
    try {
      await api.delete(`/uploads/${filename}`);
      setFiles(p => p.filter(f => f.filename !== filename));
      toast.success('File deleted');
      if (logoUrl.includes(filename)) { setLogoUrl(''); setPreviewLogo(''); }
    } catch { toast.error('Delete failed'); }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copied!');
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const useasLogo = async (url) => {
    setLogoUrl(url);
    setPreviewLogo(url);
    await saveLogo(url, logoAlt);
  };

  const saveLogo = async (url = logoUrl, alt = logoAlt) => {
    setSavingLogo(true);
    try {
      await api.put('/settings', { settings: { logo_url: url, logo_alt: alt } });
      setPreviewLogo(url);
      toast.success('Logo saved! Changes are live on the client site.');
    } catch { toast.error('Failed to save logo'); }
    setSavingLogo(false);
  };

  const clearLogo = async () => {
    setLogoUrl('');
    setPreviewLogo('');
    await saveLogo('', logoAlt);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Media & Logo</h2>
        <p className="text-sm text-gray-400 mt-1">Upload images, set your logo — changes appear instantly on the client site</p>
      </div>

      {/* ─── Logo Settings ─── */}
      <div className="panel p-6">
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-glow-magenta" /> Site Logo
        </h3>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Logo Image URL</span>
              <input className="input" value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://... or select from uploads below" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Logo Alt Text</span>
              <input className="input" value={logoAlt} onChange={e => setLogoAlt(e.target.value)} placeholder="Glowsiaa" />
            </label>
            <div className="flex gap-3">
              <button type="button" className="btn-primary flex-1" onClick={() => saveLogo()} disabled={savingLogo}>
                {savingLogo ? 'Saving...' : 'Save Logo'}
              </button>
              {previewLogo && (
                <button type="button" className="btn-secondary" onClick={clearLogo}>
                  Remove Logo (use text)
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              💡 If no logo is set, the site will show the "GLOWSIAA" text logo
            </p>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 min-h-[120px]">
            {previewLogo ? (
              <div className="text-center">
                <img src={previewLogo} alt={logoAlt} className="max-h-24 max-w-[240px] object-contain mx-auto" />
                <p className="mt-2 text-xs text-gray-500">Current logo preview</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-heading text-3xl font-black tracking-[0.35em]"
                  style={{ background: 'linear-gradient(to right, #D5106E, #6E3992)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  GLOWSIAA
                </p>
                <p className="mt-2 text-xs text-gray-500">Default text logo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Upload Area ─── */}
      <div className="panel p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-glow-magenta" /> Upload Images
        </h3>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
            dragOver ? 'border-glow-magenta bg-glow-magenta/10' : 'border-white/20 hover:border-glow-magenta/50 hover:bg-white/5'
          }`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-glow-magenta" />
              <p className="text-sm text-gray-400">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <Upload className="h-10 w-10 text-gray-500" />
              <p className="text-white/70">Drop an image here or click to browse</p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP, SVG — max 5MB</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Uploaded Files ─── */}
      <div className="panel p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Image className="h-5 w-5 text-glow-magenta" /> Uploaded Files ({files.length})
        </h3>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-500 text-sm">No files uploaded yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {files.map(file => (
              <div key={file.filename} className="group overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <div className="relative h-36 bg-white/5">
                  <img src={file.url} alt={file.filename} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
                    <button type="button" onClick={() => copyUrl(file.url)}
                      className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30">
                      {copiedUrl === file.url ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={() => useasLogo(file.url)}
                      className="rounded-lg bg-glow-magenta/80 p-2 text-white hover:bg-glow-magenta">
                      <Globe className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => deleteFile(file.filename)}
                      className="rounded-lg bg-red-500/80 p-2 text-white hover:bg-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <p className="truncate text-xs font-medium text-white/80">{file.filename}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-500">{formatSize(file.size)}</p>
                    {previewLogo && previewLogo.includes(file.filename) && (
                      <span className="rounded-full bg-glow-magenta/15 px-2 py-0.5 text-[10px] font-bold text-glow-magenta">Logo</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

