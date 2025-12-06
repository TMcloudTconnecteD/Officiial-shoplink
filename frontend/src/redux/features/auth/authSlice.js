// src/redux/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  token: localStorage.getItem("token") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const payload = action.payload || {};
      state.userInfo = payload;
      state.token = payload.token || localStorage.getItem("token") || null;

      localStorage.setItem("userInfo", JSON.stringify(payload));
      if (state.token) localStorage.setItem("token", state.token);

      const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem("expirationTime", expirationTime.toString());

      // Save the currently active user id so slices can pick the right storage key
      if (payload && (payload._id || payload.id)) {
        const uid = payload._id || payload.id;
        localStorage.setItem("currentUserId", uid);
      } else {
        localStorage.removeItem("currentUserId");
      }
    },

    logout: (state) => {
      // Attempt to remove only the current user's persisted cart/favorites
      const curUserId = localStorage.getItem("currentUserId");
      if (curUserId) {
        try {
          localStorage.removeItem(`cart_${curUserId}`);
          localStorage.removeItem(`favorites_${curUserId}`);
        } catch (e) {
          // ignore if any
        }
      }

      state.userInfo = null;
      state.token = null;

      // Remove auth-related items
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      localStorage.removeItem("expirationTime");
      localStorage.removeItem("currentUserId");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
