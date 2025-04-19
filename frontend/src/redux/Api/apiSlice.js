import {fetchBaseQuery, createApi} from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../features/constants.js';

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',  // Add this line to send cookies with requests
    prepareHeaders: (headers, { getState }) => {
        // Get the token from the Redux state or localStorage
        const token = getState().auth?.token || localStorage.getItem('token');
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Order', 'Product', 'Cart', 'Review', 'Category', 'Shop', 'Mpesa'],
    endpoints: () => ({}),
});
