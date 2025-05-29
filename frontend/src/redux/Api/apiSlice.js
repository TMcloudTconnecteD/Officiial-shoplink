import {fetchBaseQuery, createApi} from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../features/constants.js';

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = localStorage.getItem('token') || getState().auth?.userInfo?.token;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        // Only set Content-Type if it's not a FormData request
        if (!(getState()?.currentRequest?.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }
        return headers;
    },
});

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Order', 'Product', 'Cart', 'Review', 'Category', 'Shop', 'Mpesa'],
    endpoints: () => ({}),
});
