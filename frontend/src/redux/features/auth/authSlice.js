import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userInfo: localStorage.getItem('userInfo') ?
        JSON.parse(localStorage.getItem('userInfo')) : null,
    token: localStorage.getItem('token') || null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const payload = action.payload || {};
            state.userInfo = payload;
            // token may be returned by backend in login response
            state.token = payload.token || localStorage.getItem('token') || null;

            localStorage.setItem('userInfo', JSON.stringify(payload));
            if (state.token) localStorage.setItem('token', state.token);

            const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
            localStorage.setItem('expirationTime', expirationTime.toString());
        },

        logout: (state, action) => {
            state.userInfo = null;
            state.token = null;
            // remove auth-related items only
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            localStorage.removeItem('expirationTime');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;