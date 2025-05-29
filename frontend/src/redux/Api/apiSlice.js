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
        
        // Don't set Content-Type for FormData requests
        const currentBody = getState()?.currentRequest?.body;
        if (!(currentBody instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }
        // Let the browser set the Content-Type for FormData (includes boundary)
        return headers;
    },
});

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Order', 'Product', 'Cart', 'Review', 'Category', 'Shop', 'Mpesa'],
    endpoints: () => ({}),
});
