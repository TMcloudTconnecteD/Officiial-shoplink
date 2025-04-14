import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const getAccessToken = async () => {
  const { CONSUMER_KEY, CONSUMER_SECRET } = process.env;
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

  const { data } = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  return data.access_token;
};

const getPassword = () => {
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const raw = `${process.env.SHORTCODE}${process.env.PASSKEY}${timestamp}`;
  const password = Buffer.from(raw).toString('base64');

  return { password, timestamp };
};

export const queryStkPush = async (checkoutRequestID) => {
  const accessToken = await getAccessToken();
  const { password, timestamp } = getPassword();

  const payload = {
    BusinessShortCode: process.env.SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestID,
  };

  const { data } = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return { data };
};
