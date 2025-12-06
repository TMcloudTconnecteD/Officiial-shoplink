// src/redux/features/favorites/favoriteSlice.js
import { createSlice } from "@reduxjs/toolkit";

// helpers
const getCurrentUserId = () => localStorage.getItem("currentUserId") || null;
const getFavoritesKeyForUser = (userId) => (userId ? `favorites_${userId}` : "favorites_guest");

const loadFavoritesFromStorage = (userId) => {
  const key = getFavoritesKeyForUser(userId);
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

const initialState = loadFavoritesFromStorage(getCurrentUserId());

const saveFavoritesToStorage = (state, userId) => {
  const key = getFavoritesKeyForUser(userId);
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    loadFavoritesForUser: (state, action) => {
      const userId = action.payload || getCurrentUserId();
      const loaded = loadFavoritesFromStorage(userId);
      return loaded;
    },

    addToFavorites: (state, action) => {
      if (!state.some((product) => product._id === action.payload._id)) {
        state.push(action.payload);
      }
      saveFavoritesToStorage(state, getCurrentUserId());
    },

    removeFromFavorites: (state, action) => {
      const newState = state.filter((product) => product._id !== action.payload._id);
      saveFavoritesToStorage(newState, getCurrentUserId());
      return newState;
    },

    setFavorites: (state, action) => {
      const payload = action.payload || [];
      saveFavoritesToStorage(payload, getCurrentUserId());
      return payload;
    },

    clearFavorites: () => {
      const empty = [];
      saveFavoritesToStorage(empty, getCurrentUserId());
      return empty;
    },
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  setFavorites,
  loadFavoritesForUser,
  clearFavorites,
} = favoriteSlice.actions;

export const selectFavoriteProduct = (state) => state.favorites;
export default favoriteSlice.reducer;
