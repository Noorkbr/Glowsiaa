const express = require('express');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const bkash = require('../services/bkash');
const nagad = require('../services/nagad');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const rl = createRateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many payment requests' });

// ─── bKash ─────────────────────────────────────────────────────────────────

// Initiate bKash payment — called before placing order
router.post('/bkash/create', rl, async (req, res, next) => {
  try {
    const { amount, orderId, callbackURL } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ success: false, message: 'amount and orderId are required' });
    }

    if (!process.env.BKASH_APP_KEY) {
      return res.status(503).json({ success: false, message: 'bKash is not configured on this server' });
    }

    const payment = await bkash.createPayment({
      amount: Number(amount),
      orderId,
      callbackURL,
      merchantInvoice: orderId,
    });

    res.json({ success: true, ...payment });
  } catch (e) {
    next(e);
  }
});

// bKash execute — called after user approves on bKash page
router.post('/bkash/execute', rl, async (req, res, next) => {
  try {
    const { paymentID, orderId } = req.body;

    if (!paymentID) return res.status(400).json({ success: false, message: 'paymentID is required' });
    if (!process.env.BKASH_APP_KEY)
      return res.status(503).json({ success: false, message: 'bKash is not configured' });

    const result = await bkash.executePayment(paymentID);

    if (result.transactionStatus === 'Completed') {
      // Update order if orderId provided
      if (orderId) {
        await Order.findOneAndUpdate(
          { orderId },
          { status: 'confirmed', 'paymentDetails.trxID': result.trxID, 'paymentDetails.bkashPaymentID': paymentID }
        );
      }
      return res.json({ success: true, trxID: result.trxID, status: result.transactionStatus });
    }

    res.status(400).json({ success: false, message: result.statusMessage || 'Payment not completed' });
  } catch (e) {
    next(e);
  }
});

// bKash callback — redirect target from bKash
router.get('/bkash/callback', async (req, res) => {
  const { paymentID, status, orderId } = req.query;
  const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';

  if (status === 'success') {
    const qs = new URLSearchParams({ paymentID, method: 'bkash' });
    if (orderId) qs.set('orderId', orderId);
    return res.redirect(`${clientURL}/payment/success?${qs.toString()}`);
  }
  if (status === 'cancel') {
    return res.redirect(`${clientURL}/payment/cancelled?method=bkash`);
  }
  return res.redirect(`${clientURL}/payment/failed?method=bkash`);
});

// bKash query payment status
router.get('/bkash/status/:paymentID', rl, async (req, res, next) => {
  try {
    if (!process.env.BKASH_APP_KEY)
      return res.status(503).json({ success: false, message: 'bKash is not configured' });
    const data = await bkash.queryPayment(req.params.paymentID);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// ─── Nagad ─────────────────────────────────────────────────────────────────

router.post('/nagad/create', rl, async (req, res, next) => {
  try {
    const { amount, orderId, callbackURL } = req.body;

    if (!amount || !orderId)
      return res.status(400).json({ success: false, message: 'amount and orderId are required' });

    if (!process.env.NAGAD_MERCHANT_ID)
      return res.status(503).json({ success: false, message: 'Nagad is not configured on this server' });

    const payment = await nagad.initializePayment({ orderId, amount: Number(amount), callbackURL });
    res.json({ success: true, ...payment });
  } catch (e) { next(e); }
});

// Nagad callback redirect
router.get('/nagad/callback', async (req, res) => {
  const { order_id, status, payment_ref_id, orderId } = req.query;
  const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
  const oid = orderId || order_id;

  if (status === 'Success') {
    const qs = new URLSearchParams({ method: 'nagad' });
    if (payment_ref_id) qs.set('ref', payment_ref_id);
    if (oid) qs.set('orderId', oid);
    return res.redirect(`${clientURL}/payment/success?${qs.toString()}`);
  }
  return res.redirect(`${clientURL}/payment/failed?method=nagad`);
});

// Nagad verify
router.post('/nagad/verify', rl, async (req, res, next) => {
  try {
    const { paymentRefId, orderId } = req.body;
    if (!process.env.NAGAD_MERCHANT_ID)
      return res.status(503).json({ success: false, message: 'Nagad is not configured' });

    const data = await nagad.verifyPayment(paymentRefId);

    if (data.status === 'Success' && orderId) {
      await Order.findOneAndUpdate({ orderId }, { status: 'confirmed' });
    }

    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// ─── Gateway Status ─────────────────────────────────────────────────────────

router.get('/gateways', async (req, res) => {
  res.json({
    success: true,
    gateways: {
      bkash: {
        enabled: Boolean(process.env.BKASH_APP_KEY),
        sandbox: bkash.isSandbox(),
      },
      nagad: {
        enabled: Boolean(process.env.NAGAD_MERCHANT_ID),
        sandbox: nagad.isSandbox(),
      },
      rocket: {
        enabled: Boolean(process.env.ROCKET_MERCHANT_NUMBER),
      },
      cod: { enabled: true },
    },
  });
});

module.exports = router;

