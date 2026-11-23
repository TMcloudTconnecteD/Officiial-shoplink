import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "../Api/apiSlice";
import authReducer from "../features/auth/authSlice";
import favoritesReducer from "./favorites/favoriteSlice";
import cartSliceReducer from "./cart/cartSlice";
import shopReducer from "./shop/shopSlice";
import { mpesaApi } from "../Api/mpesaApiSlice"; // Import the mpesaApi slice

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [mpesaApi.reducerPath]: mpesaApi.reducer, // Add mpesaApi reducer here
    auth: authReducer,
    favorites: favoritesReducer,
    cart: cartSliceReducer,
    shop: shopReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, mpesaApi.middleware), // Add mpesaApi middleware here
  devTools: true,
});

setupListeners(store.dispatch);

export default store;
