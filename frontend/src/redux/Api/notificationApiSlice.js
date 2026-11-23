import { apiSlice } from "./apiSlice.js";

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => "/api/notifications/notifications",
      providesTags: ["Notification"],
    }),
    markNotificationsRead: builder.mutation({
      query: () => ({
        url: "/api/notifications/badge/reset",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation,
} = notificationApiSlice;
