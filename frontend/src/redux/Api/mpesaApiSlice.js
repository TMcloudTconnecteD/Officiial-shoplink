import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { MPESA_URL } from '../features/constants';

const MPESA_BASE_URL = 'https://4dff-129-222-187-52.ngrok-free.app' + MPESA_URL;

export const mpesaApi = createApi({
  reducerPath: 'mpesaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: MPESA_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.accessToken || '';
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
