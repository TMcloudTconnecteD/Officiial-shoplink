// Keep local requests on Vite's proxy so cookies and local origins stay same-site.
const configuredApiUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL;
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(configuredApiUrl || "");
export const BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_BASE_URL || (configuredApiUrl && !isLocalApiUrl ? configuredApiUrl : 'https://shoplink-b.onrender.com'))
  : '';
export const USERS_URL = '/api/users'
export const CATEGORY_URL = '/api/category'
export const PRODUCT_URL = '/api/products'
export const UPLOAD_URL = '/api/uploads'
export const SHOP_URL = '/api/shops'
export const ORDERS_URL = "/api/orders";
export const PAYPAL_URL = "/api/config/paypal";

// Add this 👇
export const MPESA_URL = '/api/payments';
