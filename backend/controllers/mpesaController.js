import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const { 
  MPESA_SHORTCODE, 
  MPESA_PASSKEY, 
  MPESA_CONSUMER_KEY, 
  MPESA_CONSUMER_SECRET,
  MPESA_ENV = 'production', // 'production' or 'sandbox'
} = process.env;

// Use environment-specific URLs
const BASE_URL_LOCAL = MPESA_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

// Resolve callback URL: prefer explicit MPESA_CALLBACK_URL, then environment-specific vars
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL
  || (MPESA_ENV === 'production'
    ? process.env.MPESA_CALLBACK_URL_PROD
    : process.env.MPESA_CALLBACK_URL_DEV)
  || (MPESA_ENV === 'production'
    ? 'hhttps://shoplink-b.onrender.com/api/payments/callback'
    : 'https://shoplink-b.onrender.com/api/payments/callback');

// Optional: full C2B / query URL may be provided (includes path). Fallback to base + query path.
const MPESA_C2B_URL = process.env.MPESA_C2B_URL || `${BASE_URL_LOCAL}/mpesa/stkpushquery/v1/query`;

// Optional: supply full STK push URL via env, otherwise use base + processrequest path
const MPESA_STK_PUSH_URL = process.env.MPESA_STK_PUSH_URL || `${BASE_URL_LOCAL}/mpesa/stkpush/v1/processrequest`;

// Log the callback URL for debugging on startup
console.info('MPESA callback URL:', MPESA_CALLBACK_URL);

const isValidCallbackUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  // Reject obvious local addresses
  if (lower.includes('localhost') || lower.includes('127.0.0.1')) return false;
  // Must be http/https - prefer https for production
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) return false;
  // Prefer https - warn but allow http in non-production only
  if (MPESA_ENV === 'production' && !lower.startsWith('https://')) return false;
  return true;
};

// Generate base64 encoded password
const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
  return { password, timestamp };
};

// Get Safaricom access token
const getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const { data } = await axios.get(
      `${BASE_URL_LOCAL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    return data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with M-Pesa API');
  }
};

// Initiate STK push payment
const initiatePayment = async (phoneNumber, amount, orderId) => {
  try {
    // Validate callback URL before making the STK request
    if (!isValidCallbackUrl(MPESA_CALLBACK_URL)) {
      const msg = 'Invalid MPESA_CALLBACK_URL: must be a publicly reachable URL (https recommended)';
      console.error(msg, { MPESA_CALLBACK_URL });
      return { success: false, error: msg, message: msg };
    }
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: orderId,
      TransactionDesc: `Payment for Order ${orderId}`,
    };

    const { data } = await axios.post(
      MPESA_STK_PUSH_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data,
      message: 'Payment initiated successfully'
    };
  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error('Payment initiation failed:', errData);
    // If Safaricom indicates invalid callback, add actionable hint
    if (errData && errData.errorMessage && /callbackurl/i.test(errData.errorMessage)) {
      const hint = 'Invalid CallBackURL returned by M-Pesa. Ensure MPESA_CALLBACK_URL is a public HTTPS endpoint reachable by Safaricom sandbox/production.';
      return { success: false, error: errData, message: hint };
    }
    return {
      success: false,
      error: errData,
      message: 'Payment initiation failed'
    };
  }
};

// Handle M-Pesa callback
const handleCallback = async (callbackData) => {
  try {
    const { Body: { stkCallback: { ResultCode, ResultDesc, CallbackMetadata } } } = callbackData;
    
    if (ResultCode === 0) {
      const metadata = CallbackMetadata.Item.reduce((acc, item) => {
        acc[item.Name] = item.Value;
        return acc;
      }, {});

      // Attempt to update order in DB by matching checkoutRequestId (preferred), then AccountReference
      try {
        const Order = (await import('../models/orderModel.js')).default;
        const checkoutId = metadata['CheckoutRequestID'] || null;
        const accountRef = metadata['AccountReference'] || null;

        let order = null;
        if (checkoutId) {
          order = await Order.findOne({ checkoutRequestId: checkoutId });
        }
        if (!order && accountRef) {
          // accountRef may be the order ID
          order = await Order.findById(accountRef);
        }

        if (!order) {
          // As a last resort, try to search by MpesaReceiptNumber in paymentResult.id
          const receipt = metadata['MpesaReceiptNumber'] || null;
          if (receipt) {
            order = await Order.findOne({ 'paymentResult.id': receipt });
          }
        }

        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            id: metadata['MpesaReceiptNumber'] || '',
            status: 'COMPLETED',
            update_time: new Date().toISOString(),
            email_address: '',
          };
          await order.save();
        }
      } catch (e) {
        console.warn('Failed to update order from callback:', e.message);
      }

      return {
        success: true,
        data: metadata,
        message: 'Payment completed successfully'
      };
    }

    return {
      success: false,
      error: ResultDesc,
      message: 'Payment failed'
    };
  } catch (error) {
    console.error('Callback processing failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Error processing callback'
    };
  }
};

// Query payment status
const queryPaymentStatus = async (checkoutRequestId) => {
  try {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const queryUrl = MPESA_C2B_URL || `${BASE_URL_LOCAL}/mpesa/stkpushquery/v1/query`;
    const { data } = await axios.post(
      queryUrl,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data,
      message: 'Payment status retrieved'
    };
  } catch (error) {
    console.error('Payment status query failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
      message: 'Failed to query payment status'
    };
  }
};

export { initiatePayment, handleCallback, queryPaymentStatus };
