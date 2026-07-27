import { AnimatePresence, motion } from 'framer-motion';
import { PackagePlus, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const categories = [
  { value: 'skincare', label: 'Skincare' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'haircare', label: 'Haircare' },
];

const initialFormState = {
  name: '',
  description: '',
  price: '',
  comparePrice: '',
  category: 'skincare',
  stock: '',
  badge: '',
  isFeatured: false,
  images: ['', '', ''],
};

const currencyFormatter = new Intl.NumberFormat('en-BD');

const normalizeForm = (product) => ({
  name: product?.name || '',
  description: product?.description || '',
  price: product?.price?.toString() || '',
  comparePrice: product?.comparePrice?.toString() || '',
  category: product?.category || 'skincare',
  stock: product?.stock?.toString() || '',
  badge: product?.badge || '',
  isFeatured: Boolean(product?.isFeatured),
  images: [product?.images?.[0] || '', product?.images?.[1] || '', product?.images?.[2] || ''],
});

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/products');
      setProducts(data.products || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const featuredCount = useMemo(() => products.filter((product) => product.isFeatured).length, [products]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(initialFormState);
    setShowModal(true);
    setError('');
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm(normalizeForm(product));
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(initialFormState);
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (index, value) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((image, currentIndex) => (currentIndex === index ? value : image)),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      category: form.category,
      stock: Number(form.stock),
      badge: form.badge.trim(),
      isFeatured: form.isFeatured,
      images: form.images.map((image) => image.trim()).filter(Boolean),
    };

    try {
      if (editingProduct) {
        const { data } = await api.put(`/products/${editingProduct._id}`, payload);
        setProducts((prev) => prev.map((product) => (product._id === editingProduct._id ? data.product : product)));
        toast.success('Product updated successfully!');
      } else {
        const { data } = await api.post('/products', payload);
        setProducts((prev) => [data.product, ...prev]);
        toast.success('Product created successfully!');
      }

      closeModal();
    } catch (requestError) {
      const serverMessage = requestError.response?.data?.errors?.join(', ') || requestError.response?.data?.message;
      setError(serverMessage || 'Unable to save product right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.delete(`/products/${deleteConfirm._id}`);
      setProducts((prev) => prev.filter((product) => product._id !== deleteConfirm._id));
      setDeleteConfirm(null);
      toast.success('Product deleted.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="panel p-5 md:max-w-md">
          <p className="text-sm text-gray-400">Catalog overview</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{products.length} products</h2>
          <p className="mt-2 text-sm text-emerald-300">{featuredCount} featured items highlighted on the storefront.</p>
        </div>

        <button type="button" className="btn-primary gap-2 self-start" onClick={openCreateModal}>
          <PackagePlus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="panel p-6 text-sm text-gray-400">Loading products...</div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="panel overflow-hidden">
              <div className="aspect-[4/3] bg-white/5">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">No image available</div>
                )}
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-glow-magenta">{product.category}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{product.name}</h3>
                  </div>
                  {product.badge ? <span className="rounded-full bg-glow-purple/15 px-3 py-1 text-xs font-semibold text-glow-purple">{product.badge}</span> : null}
                </div>

                <p
                  className="text-sm text-gray-400"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {product.description}
                </p>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">৳{currencyFormatter.format(product.price || 0)}</p>
                    {product.comparePrice ? (
                      <p className="text-sm text-gray-500 line-through">৳{currencyFormatter.format(product.comparePrice)}</p>
                    ) : null}
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <p>Stock: {product.stock}</p>
                    <p>{product.isFeatured ? 'Featured' : 'Standard'}</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button type="button" className="btn-secondary flex-1 gap-2" onClick={() => openEditModal(product)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
                    onClick={() => setDeleteConfirm(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="panel max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                  <p className="mt-1 text-sm text-gray-400">Manage pricing, availability, gallery, and storefront visibility.</p>
                </div>
                <button type="button" className="text-gray-400 transition hover:text-white" onClick={closeModal}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Product name</span>
                    <input className="input" name="name" value={form.name} onChange={handleFieldChange} required />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Description</span>
                    <textarea
                      className="input min-h-[120px]"
                      name="description"
                      value={form.description}
                      onChange={handleFieldChange}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Price</span>
                    <input className="input" type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleFieldChange} required />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Compare price</span>
                    <input className="input" type="number" min="0" step="0.01" name="comparePrice" value={form.comparePrice} onChange={handleFieldChange} />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Category</span>
                    <select className="input" name="category" value={form.category} onChange={handleFieldChange} required>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Stock</span>
                    <input className="input" type="number" min="0" name="stock" value={form.stock} onChange={handleFieldChange} required />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Badge</span>
                    <input className="input" name="badge" value={form.badge} onChange={handleFieldChange} placeholder="Bestseller" />
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white">
                    <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleFieldChange} className="h-4 w-4 accent-glow-magenta" />
                    Feature this product on the storefront
                  </label>

                  {form.images.map((image, index) => (
                    <label key={index} className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-gray-300">Image URL {index + 1}</span>
                      <input className="input" value={image} onChange={(event) => handleImageChange(index, event.target.value)} placeholder="https://example.com/product-image.jpg" />
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" className="btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="panel w-full max-w-md p-6"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
            >
              <h2 className="text-xl font-bold text-white">Delete product</h2>
              <p className="mt-2 text-sm text-gray-400">
                Are you sure you want to remove <span className="font-semibold text-white">{deleteConfirm.name}</span> from the catalog?
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
                  Keep Product
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-60"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
