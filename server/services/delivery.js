/**
 * Delivery Partner API Services
 *
 * Steadfast:
 *   STEADFAST_API_KEY    = Your Steadfast API key
 *   STEADFAST_SECRET_KEY = Your Steadfast secret key
 *
 * Pathao:
 *   PATHAO_CLIENT_ID     = Pathao client ID
 *   PATHAO_CLIENT_SECRET = Pathao client secret
 *   PATHAO_USERNAME      = Pathao merchant username
 *   PATHAO_PASSWORD      = Pathao merchant password
 *
 * RedX:
 *   REDX_API_KEY         = RedX bearer token
 *   REDX_STORE_ID        = RedX store ID
 */

const axios = require('axios');

// ─── STEADFAST ─────────────────────────────────────────────────────────────

const STEADFAST_BASE = 'https://portal.steadfast.com.bd/api/v1';

const steadfastHeaders = () => ({
  'Api-Key': process.env.STEADFAST_API_KEY,
  'Secret-Key': process.env.STEADFAST_SECRET_KEY,
  'Content-Type': 'application/json',
});

/**
 * Create a Steadfast consignment
 */
const createSteadfastOrder = async (order) => {
  const payload = {
    invoice: order.orderId,
    recipient_name: order.customer.name,
    recipient_phone: order.customer.phone,
    recipient_address: order.customer.address,
    cod_amount: order.paymentMethod === 'cod' ? order.total : 0,
    note: order.notes || `Glowsiaa Order ${order.orderId}`,
  };

  const { data } = await axios.post(`${STEADFAST_BASE}/create_order`, payload, {
    headers: steadfastHeaders(),
  });

  if (data.status !== 200) {
    throw new Error(data.message || 'Steadfast order creation failed');
  }

  return {
    trackingCode: data.consignment?.tracking_code,
    consignmentId: data.consignment?.id,
    status: data.consignment?.status,
  };
};

/**
 * Check Steadfast consignment status
 */
const checkSteadfastStatus = async (trackingCode) => {
  const { data } = await axios.get(
    `${STEADFAST_BASE}/status_by_trackingcode/${trackingCode}`,
    { headers: steadfastHeaders() }
  );
  return data;
};

/**
 * Get Steadfast balance
 */
const getSteadfastBalance = async () => {
  const { data } = await axios.get(`${STEADFAST_BASE}/get_balance`, {
    headers: steadfastHeaders(),
  });
  return data;
};

// ─── PATHAO ────────────────────────────────────────────────────────────────

const PATHAO_BASE = 'https://hermes.pathao.com/aladdin/api/v1';
let pathaoToken = null;
let pathaoTokenExpiry = 0;

const getPathaoToken = async () => {
  if (pathaoToken && Date.now() < pathaoTokenExpiry - 60000) return pathaoToken;

  const { data } = await axios.post(`${PATHAO_BASE}/issue-token`, {
    client_id: process.env.PATHAO_CLIENT_ID,
    client_secret: process.env.PATHAO_CLIENT_SECRET,
    username: process.env.PATHAO_USERNAME,
    password: process.env.PATHAO_PASSWORD,
    grant_type: 'password',
  });

  pathaoToken = data.access_token;
  pathaoTokenExpiry = Date.now() + (data.expires_in || 86400) * 1000;
  return pathaoToken;
};

const createPathaoOrder = async (order, { cityId, zoneId, areaId, storeId }) => {
  const token = await getPathaoToken();

  const payload = {
    store_id: storeId || process.env.PATHAO_STORE_ID,
    merchant_order_id: order.orderId,
    recipient_name: order.customer.name,
    recipient_phone: order.customer.phone,
    recipient_address: order.customer.address,
    recipient_city: cityId,
    recipient_zone: zoneId,
    recipient_area: areaId,
    delivery_type: 48, // 48h standard
    item_type: 2, // parcel
    special_instruction: order.notes || '',
    item_quantity: order.items.reduce((s, i) => s + i.quantity, 0),
    item_weight: 0.5,
    amount_to_collect: order.paymentMethod === 'cod' ? order.total : 0,
    item_description: order.items.map((i) => i.name).join(', ').slice(0, 200),
  };

  const { data } = await axios.post(`${PATHAO_BASE}/orders`, payload, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });

  return {
    consignmentId: data.data?.consignment_id,
    merchantOrderId: data.data?.merchant_order_id,
    orderStatus: data.data?.order_status,
  };
};

// ─── REDX ──────────────────────────────────────────────────────────────────

const REDX_BASE = 'https://openapi.redx.com.bd/v1.0.0-beta';

const createRedxOrder = async (order) => {
  const payload = {
    customer_details: {
      name: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address,
    },
    delivery_fee: order.deliveryFee,
    cod_fee: order.paymentMethod === 'cod' ? order.total : 0,
    parcel_details: {
      invoice: order.orderId,
      weight: 0.5,
      selling_price: order.total,
      cash_collection_amount: order.paymentMethod === 'cod' ? order.total : 0,
      value: order.subtotal,
    },
  };

  const { data } = await axios.post(`${REDX_BASE}/parcel`, payload, {
    headers: {
      'API-ACCESS-TOKEN': `Bearer ${process.env.REDX_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  return {
    trackingId: data.trackingId,
  };
};

// ─── Unified Push ──────────────────────────────────────────────────────────

const pushOrderToDelivery = async (order, company, options = {}) => {
  switch (company.toLowerCase()) {
    case 'steadfast':
      return createSteadfastOrder(order);
    case 'pathao':
      return createPathaoOrder(order, options);
    case 'redx':
      return createRedxOrder(order);
    default:
      throw new Error(`Unknown delivery company: ${company}`);
  }
};

module.exports = {
  pushOrderToDelivery,
  createSteadfastOrder,
  checkSteadfastStatus,
  getSteadfastBalance,
  getPathaoToken,
  createPathaoOrder,
  createRedxOrder,
};

