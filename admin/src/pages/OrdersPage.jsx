import { AnimatePresence, motion } from 'framer-motion';
import { Search, Truck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusBadgeStyles = {
  pending: 'border-yellow-500/20 bg-yellow-500/15 text-yellow-300',
  confirmed: 'border-blue-500/20 bg-blue-500/15 text-blue-300',
  processing: 'border-orange-500/20 bg-orange-500/15 text-orange-300',
  shipped: 'border-purple-500/20 bg-purple-500/15 text-purple-300',
  delivered: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-300',
  cancelled: 'border-red-500/20 bg-red-500/15 text-red-300',
};

const deliveryCompanies = [
  { label: 'Pathao', value: 'pathao' },
  { label: 'Steadfast', value: 'steadfast' },
  { label: 'RedX', value: 'redx' },
];

const currencyFormatter = new Intl.NumberFormat('en-BD');

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('pathao');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingStatusId, setSavingStatusId] = useState('');
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryError, setDeliveryError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data.orders || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = [order.orderId, order.customer?.name, order.customer?.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const updateOrderStatus = async (orderId, status) => {
    setSavingStatusId(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((order) => (order._id === orderId ? data.order : order)));
      toast.success(`Order status updated to ${status}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update order status.');
      toast.error('Failed to update order status');
    } finally {
      setSavingStatusId('');
    }
  };

  const openDeliveryModal = (order) => {
    setSelectedOrder(order);
    setSelectedCompany(order.trackingCompany || 'pathao');
    setTrackingNumber(order.trackingNumber || '');
    setDeliveryError('');
  };

  const closeDeliveryModal = () => {
    setSelectedOrder(null);
    setTrackingNumber('');
    setDeliveryError('');
  };

  const pushToDelivery = async (event) => {
    event.preventDefault();

    if (!selectedOrder) {
      return;
    }

    setDeliveryLoading(true);
    setDeliveryError('');

    try {
      const { data } = await api.post('/admin/push-delivery', {
        orderId: selectedOrder.orderId,
        company: selectedCompany,
      });

      setTrackingNumber(data.trackingNumber);
      setOrders((prev) => prev.map((order) => (order._id === selectedOrder._id ? data.order : order)));
      setSelectedOrder(data.order);
      toast.success(`Order pushed to ${selectedCompany.toUpperCase()}! Tracking: ${data.trackingNumber}`);
    } catch (requestError) {
      setDeliveryError(requestError.response?.data?.message || 'Failed to push order to delivery.');
      toast.error('Failed to push to delivery');
    } finally {
      setDeliveryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="input pl-11"
              placeholder="Search by order ID, customer, or phone"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <select className="input max-w-xs" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto -mx-0">
          <table className="min-w-full text-left text-sm text-gray-200" style={{ minWidth: '700px' }}>
            <thead className="bg-white/5 text-gray-400">
              <tr>
                <th className="px-4 py-4 font-medium">Order ID</th>
                <th className="px-4 py-4 font-medium">Customer Name</th>
                <th className="px-4 py-4 font-medium">Phone</th>
                <th className="px-4 py-4 font-medium">Items</th>
                <th className="px-4 py-4 font-medium">Total ৳</th>
                <th className="px-4 py-4 font-medium">Payment</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-400" colSpan={9}>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-t border-white/10">
                    <td className="px-4 py-4 font-semibold text-white">{order.orderId}</td>
                    <td className="px-4 py-4">{order.customer?.name}</td>
                    <td className="px-4 py-4">{order.customer?.phone}</td>
                    <td className="px-4 py-4">{order.items?.length || 0}</td>
                    <td className="px-4 py-4">{currencyFormatter.format(order.total || 0)}</td>
                    <td className="px-4 py-4 uppercase">{order.paymentMethod}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeStyles[order.status]}`}>
                          {order.status}
                        </span>
                        <select
                          className="input min-w-[160px] py-2 text-xs capitalize"
                          value={order.status}
                          onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                          disabled={savingStatusId === order._id}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <button type="button" className="btn-secondary gap-2 px-3 py-2" onClick={() => openDeliveryModal(order)}>
                        <Truck className="h-4 w-4" />
                        Push to Delivery
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-400" colSpan={9}>
                    No orders matched your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="panel w-full max-w-lg p-6"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Push to Delivery</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Send <span className="font-semibold text-white">{selectedOrder.orderId}</span> to a courier partner.
                  </p>
                </div>
                <button type="button" className="text-gray-400 transition hover:text-white" onClick={closeDeliveryModal}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={pushToDelivery} className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Delivery company
                  <select
                    className="input mt-2"
                    value={selectedCompany}
                    onChange={(event) => setSelectedCompany(event.target.value)}
                  >
                    {deliveryCompanies.map((company) => (
                      <option key={company.value} value={company.value}>
                        {company.label}
                      </option>
                    ))}
                  </select>
                </label>

                {trackingNumber ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    Tracking number generated: <span className="font-semibold text-white">{trackingNumber}</span>
                  </div>
                ) : null}

                {deliveryError ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{deliveryError}</div>
                ) : null}

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="btn-secondary" onClick={closeDeliveryModal}>
                    Close
                  </button>
                  <button type="submit" className="btn-primary" disabled={deliveryLoading}>
                    {deliveryLoading ? 'Submitting...' : 'Submit to Delivery'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
