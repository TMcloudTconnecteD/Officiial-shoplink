// Use Vite environment variable when available (e.g. in production builds).
// If VITE_BASE_URL is not set we keep an empty string to allow the dev server proxy to work.
export const BASE_URL = import.meta.env.VITE_BASE_URL || '' // proxy / development
export const USERS_URL = '/api/users'
export const CATEGORY_URL = '/api/category'
export const PRODUCT_URL = '/api/products'
export const UPLOAD_URL = '/api/uploads'
export const SHOP_URL = '/api/shops'
export const ORDERS_URL = "/api/orders";
export const PAYPAL_URL = "/api/config/paypal";

// Add this 👇
export const MPESA_URL = '/api/payments/';
