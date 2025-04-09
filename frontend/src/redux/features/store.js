import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "../api/apiSlice";
import authReducer from "../features/auth/authSlice";
import favoritesReducer from "./favorites/favoriteSlice";
import { getFavoritesFromLocalStorage } from "../../Utils/localStorage";
import cartSliceReducer from "./cart/cartSlice";
import shopReducer from "./shop/shopSlice";


    
// Initialize the favorites state from localStorage

const initialFavorites = getFavoritesFromLocalStorage() || [];

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        favorites: favoritesReducer,
        cart: cartSliceReducer,
        shop: shopReducer,

    },



preloadedState: {
  favorites: initialFavorites,

},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true


})
setupListeners(store.dispatch)
export default store;
