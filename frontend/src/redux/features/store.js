import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "../Api/apiSlice.js";
import authReducer from "../features/auth/authSlice.js";
import favoritesReducer from "./favorites/favoriteSlice.js";
import { getFavoritesFromLocalStorage } from "../../Utils/localStorage.js";
import cartSliceReducer from "./cart/cartSlice.js";
import shopReducer from "./shop/shopSlice.js";
import { mpesaApi } from "../Api/mpesaApiSlice.js";// Import the mpesaApi slice

// Initialize the favorites state from localStorage
const initialFavorites = getFavoritesFromLocalStorage() || [];

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [mpesaApi.reducerPath]: mpesaApi.reducer, // Add mpesaApi reducer here
    auth: authReducer,
    favorites: favoritesReducer,
    cart: cartSliceReducer,
    shop: shopReducer,
  },
  preloadedState: {
    favorites: initialFavorites,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, mpesaApi.middleware), // Add mpesaApi middleware here
  devTools: true,
});

setupListeners(store.dispatch);

export default store;
