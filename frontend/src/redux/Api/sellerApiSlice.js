import { apiSlice } from "./apiSlice.js";

export const sellerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    applyAsSeller: builder.mutation({
      query: (application) => ({
        url: "/api/sellers/apply",
        method: "POST",
        body: application,
      }),
      invalidatesTags: ["User", "Notification", "Shop"],
    }),
    getMySellerApplication: builder.query({
      query: () => "/api/sellers/mine",
      providesTags: ["User"],
    }),
    getSellerWorkspace: builder.query({
      query: () => "/api/sellers/workspace",
      providesTags: ["Shop"],
    }),
    getSellerAnalytics: builder.query({
      query: () => "/api/sellers/analytics",
      providesTags: ["Order", "Products"],
    }),
    getSellerApplications: builder.query({
      query: () => "/api/sellers/applications",
      providesTags: ["User", "Shop"],
    }),
    reviewSellerApplication: builder.mutation({
      query: ({ applicationId, status }) => ({
        url: `/api/sellers/applications/${applicationId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["User", "Shop", "Notification"],
    }),
  }),
});

export const {
  useApplyAsSellerMutation,
  useGetMySellerApplicationQuery,
  useGetSellerWorkspaceQuery,
  useGetSellerAnalyticsQuery,
  useGetSellerApplicationsQuery,
  useReviewSellerApplicationMutation,
} = sellerApiSlice;
