import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { MPESA_URL, BASE_URL } from '../features/constants';

// Use frontend's BASE_URL (set via Vite) so the client calls the same backend as the app
const MPESA_BASE_URL = `${BASE_URL}${MPESA_URL}`;

export const mpesaApi = createApi({
  reducerPath: 'mpesaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: MPESA_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
  const token = getState().auth?.token || localStorage.getItem('token') || '';
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    initiateMpesaPayment: builder.mutation({
      query: ({ phoneNumber, amount, orderId }) => ({
        url: 'initiate',
        method: 'POST',
        body: { phoneNumber, amount, orderId },
      }),
    }),
    checkMpesaPaymentStatus: builder.query({
      query: (checkoutRequestId) => `status/${checkoutRequestId}`,
    }),
  }),
});

export const {
  useInitiateMpesaPaymentMutation,
  useCheckMpesaPaymentStatusQuery,
} = mpesaApi;
