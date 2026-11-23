// Keep local development on the Vite proxy and use the deployed API by default in production.
export const BASE_URL = import.meta.env.VITE_BASE_URL
    || (import.meta.env.PROD ? 'https://shoplink-b.onrender.com' : '');
export const USERS_URL = '/api/users'
export const CATEGORY_URL = '/api/category'
export const PRODUCT_URL = '/api/products'
export const UPLOAD_URL = '/api/uploads'
export const SHOP_URL = '/api/shops'
export const ORDERS_URL = "/api/orders";
export const PAYPAL_URL = "/api/config/paypal";

// Add this 👇
export const MPESA_URL = '/api/payments';
