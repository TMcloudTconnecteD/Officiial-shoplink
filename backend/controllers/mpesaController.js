import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const { 
  MPESA_SHORTCODE, 
  MPESA_PASSKEY, 
  MPESA_CONSUMER_KEY, 
  MPESA_CONSUMER_SECRET,
  MPESA_ENV = 'sandbox', // 'production' or 'sandbox'
} = process.env;

// Use environment-specific URLs
const BASE_URL_LOCAL = MPESA_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || (MPESA_ENV === 'production' 
  ? 'https://your-production-callback.example.com/api/payments/callback' // production fallback
  : 'http://localhost:8000/api/payments/callback'); // localhost

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
      `${BASE_URL_LOCAL}/mpesa/stkpush/v1/processrequest`,
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

      // Attempt to update order in DB if AccountReference was used as orderId
      try {
        const Order = (await import('../models/orderModel.js')).default;
        const orderIdFromCallback = metadata['AccountReference'] || metadata['MpesaReceiptNumber'] || null;
        if (orderIdFromCallback) {
          const order = await Order.findById(orderIdFromCallback);
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

    const { data } = await axios.post(
      `${BASE_URL_LOCAL}/mpesa/stkpushquery/v1/query`,
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
