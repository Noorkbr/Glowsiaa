/**
 * Nagad Payment Integration
 * Docs: https://nagad.com.bd/api/
 *
 * Required ENV vars:
 *   NAGAD_BASE_URL         = http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0  (sandbox)
 *                          = https://api.mynagad.com/api/dfs  (production)
 *   NAGAD_MERCHANT_ID      = Your Nagad merchant ID
 *   NAGAD_MERCHANT_NUMBER  = Your Nagad merchant mobile number
 *   NAGAD_PUBLIC_KEY       = Nagad's public key (for encrypting)
 *   NAGAD_PRIVATE_KEY      = Your private key (for signing)
 */

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL =
  process.env.NAGAD_BASE_URL ||
  'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0';

const MERCHANT_ID = process.env.NAGAD_MERCHANT_ID || '';
const MERCHANT_NUMBER = process.env.NAGAD_MERCHANT_NUMBER || '';

/**
 * Encrypt data with Nagad public key
 */
const encryptWithPublicKey = (data) => {
  const publicKey = process.env.NAGAD_PUBLIC_KEY;
  if (!publicKey) throw new Error('NAGAD_PUBLIC_KEY is not set');
  const buffer = Buffer.from(JSON.stringify(data));
  return crypto.publicEncrypt(
    { key: `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`, padding: crypto.constants.RSA_PKCS1_PADDING },
    buffer
  ).toString('base64');
};

/**
 * Sign data with merchant private key
 */
const signWithPrivateKey = (data) => {
  const privateKey = process.env.NAGAD_PRIVATE_KEY;
  if (!privateKey) throw new Error('NAGAD_PRIVATE_KEY is not set');
  const sign = crypto.createSign('SHA256');
  sign.update(JSON.stringify(data));
  return sign.sign(
    `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`,
    'base64'
  );
};

/**
 * Step 1: Initialize Payment
 */
const initializePayment = async ({ orderId, amount, callbackURL }) => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const invoiceNumber = `${orderId}-${timestamp}`;

  const sensitiveData = {
    merchantId: MERCHANT_ID,
    datetime: timestamp,
    orderId: invoiceNumber,
    challenge: crypto.randomBytes(16).toString('hex'),
  };

  const payload = {
    accountNumber: MERCHANT_NUMBER,
    dateTime: timestamp,
    sensitiveData: encryptWithPublicKey(sensitiveData),
    signature: signWithPrivateKey(sensitiveData),
  };

  const { data } = await axios.post(
    `${BASE_URL}/check-out/initialize/${MERCHANT_ID}/${invoiceNumber}`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
        'X-KM-IP-V4': '127.0.0.1',
        'X-KM-Client-Type': 'PC_WEB',
      },
    }
  );

  if (data.reason !== 'Successful') {
    throw new Error(data.message || 'Nagad initialization failed');
  }

  // Step 2: Complete Payment
  const completePayload = {
    sensitiveData: encryptWithPublicKey({
      merchantId: MERCHANT_ID,
      orderId: invoiceNumber,
      amount: String(amount),
      currencyCode: '050',
      challenge: data.sensitiveData.challenge,
    }),
    signature: signWithPrivateKey({ merchantId: MERCHANT_ID, orderId: invoiceNumber }),
    merchantCallbackURL: callbackURL || `${process.env.CLIENT_URL}/payment/nagad-callback`,
  };

  const completeResp = await axios.post(
    `${BASE_URL}/check-out/complete/${data.paymentReferenceId}`,
    completePayload,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
      },
    }
  );

  return {
    paymentReferenceId: data.paymentReferenceId,
    callBackUrl: completeResp.data.callBackUrl,
    invoiceNumber,
  };
};

/**
 * Verify Payment Callback
 */
const verifyPayment = async (paymentRefId) => {
  const { data } = await axios.get(
    `${BASE_URL}/verify/payment/${paymentRefId}`,
    {
      headers: {
        Accept: 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
      },
    }
  );
  return data;
};

const isSandbox = () =>
  (process.env.NAGAD_BASE_URL || '').includes('sandbox') || (process.env.NAGAD_BASE_URL || '').includes('10080');

module.exports = { initializePayment, verifyPayment, isSandbox };

