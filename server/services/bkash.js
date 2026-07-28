/**
 * bKash Tokenized Payment Integration
 * Docs: https://developer.bka.sh/docs/tokenized-checkout-process
 *
 * Required ENV vars:
 *   BKASH_BASE_URL   = https://tokenized.sandbox.bka.sh/v1.2.0-beta  (sandbox)
 *                    = https://tokenized.pay.bka.sh/v1.2.0-beta       (production)
 *   BKASH_APP_KEY    = Your bKash app key
 *   BKASH_APP_SECRET = Your bKash app secret
 *   BKASH_USERNAME   = bKash merchant username
 *   BKASH_PASSWORD   = bKash merchant password
 */

const axios = require('axios');

const BASE_URL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Step 1: Grant Token
 * Returns an id_token valid for 3600 seconds
 */
const grantToken = async () => {
  // Return cached token if still valid (buffer 60s)
  if (cachedToken && Date.now() < tokenExpiry - 60000) return cachedToken;

  const { data } = await axios.post(
    `${BASE_URL}/tokenized/checkout/token/grant`,
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
      },
    }
  );

  if (data.statusCode !== '0000') {
    throw new Error(data.statusMessage || 'bKash token grant failed');
  }

  cachedToken = data.id_token;
  tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken;
};

/**
 * Step 2: Create Payment
 * Returns paymentID and bkashURL for redirect
 */
const createPayment = async ({ amount, orderId, callbackURL, merchantInvoice }) => {
  const token = await grantToken();

  const { data } = await axios.post(
    `${BASE_URL}/tokenized/checkout/create`,
    {
      mode: '0011', // checkout
      payerReference: merchantInvoice || orderId,
      callbackURL: callbackURL || `${process.env.CLIENT_URL}/payment/bkash-callback`,
      amount: String(amount),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: merchantInvoice || orderId,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-App-Key': process.env.BKASH_APP_KEY,
      },
    }
  );

  if (data.statusCode !== '0000') {
    throw new Error(data.statusMessage || 'bKash create payment failed');
  }

  return {
    paymentID: data.paymentID,
    bkashURL: data.bkashURL,
    statusCode: data.statusCode,
  };
};

/**
 * Step 3: Execute Payment (called after user approves on bKash page)
 */
const executePayment = async (paymentID) => {
  const token = await grantToken();

  const { data } = await axios.post(
    `${BASE_URL}/tokenized/checkout/execute`,
    { paymentID },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-App-Key': process.env.BKASH_APP_KEY,
      },
    }
  );

  return data;
};

/**
 * Step 4: Query Payment Status
 */
const queryPayment = async (paymentID) => {
  const token = await grantToken();

  const { data } = await axios.get(
    `${BASE_URL}/tokenized/checkout/payment/status?paymentID=${paymentID}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: token,
        'X-App-Key': process.env.BKASH_APP_KEY,
      },
    }
  );

  return data;
};

/**
 * Refund a payment
 */
const refundPayment = async ({ paymentID, trxID, amount, reason }) => {
  const token = await grantToken();

  const { data } = await axios.post(
    `${BASE_URL}/tokenized/checkout/payment/refund`,
    {
      paymentID,
      trxID,
      amount: String(amount),
      currency: 'BDT',
      reason,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-App-Key': process.env.BKASH_APP_KEY,
      },
    }
  );

  return data;
};

const isSandbox = () =>
  (process.env.BKASH_BASE_URL || '').includes('sandbox');

module.exports = { grantToken, createPayment, executePayment, queryPayment, refundPayment, isSandbox };

