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

const MPESA_CALLBACK_URL = process.env.MPESA_ENV === 'production' 
  ? process.env.MPESA_CALLBACK_URL_PROD 
  : process.env.MPESA_CALLBACK_URL_DEV;

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
    console.error('Payment initiation failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
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
