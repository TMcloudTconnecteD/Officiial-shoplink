// src/redux/features/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { updateCart as computeCartTotals } from "../../../Utils/cartUtils"; // keep using your existing util for totals if needed

// helpers
const getCurrentUserId = () => localStorage.getItem("currentUserId") || null;
const getCartKeyForUser = (userId) => (userId ? `cart_${userId}` : "cart_guest");

const loadCartFromStorage = (userId) => {
  const key = getCartKeyForUser(userId);
  const raw = localStorage.getItem(key);
  if (!raw) return { cartItems: [], shippingAddress: {}, paymentMethod: "PayPal" };
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { cartItems: [], shippingAddress: {}, paymentMethod: "PayPal" };
  }
};

const initialState = loadCartFromStorage(getCurrentUserId());

const saveCartToStorage = (state, userId) => {
  const key = getCartKeyForUser(userId);
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    // ignore storage errors
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // call this after login to load the user's cart
    loadCartForUser: (state, action) => {
      const userId = action.payload || getCurrentUserId();
      const loaded = loadCartFromStorage(userId);
      state.cartItems = loaded.cartItems || [];
      state.shippingAddress = loaded.shippingAddress || {};
      state.paymentMethod = loaded.paymentMethod || "PayPal";
    },

    addToCart: (state, action) => {
      const { user, rating, numReviews, reviews, ...item } = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      // optionally compute totals (if updateCart returns computed state)
      try {
        computeCartTotals(state, item);
      } catch (e) {
        // ignore if compute util isn't purely functional
      }

      saveCartToStorage(state, getCurrentUserId());
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      try {
        computeCartTotals(state);
      } catch (e) {}
      saveCartToStorage(state, getCurrentUserId());
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      saveCartToStorage(state, getCurrentUserId());
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      saveCartToStorage(state, getCurrentUserId());
    },

    clearCartItems: (state) => {
      state.cartItems = [];
      saveCartToStorage(state, getCurrentUserId());
    },

    // reset to guest initial state (useful on full app reset)
    resetCart: (state) => {
      const initial = { cartItems: [], shippingAddress: {}, paymentMethod: "PayPal" };
      state.cartItems = initial.cartItems;
      state.shippingAddress = initial.shippingAddress;
      state.paymentMethod = initial.paymentMethod;
      saveCartToStorage(state, getCurrentUserId());
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  savePaymentMethod,
  saveShippingAddress,
  clearCartItems,
  resetCart,
  loadCartForUser,
} = cartSlice.actions;

export default cartSlice.reducer;
