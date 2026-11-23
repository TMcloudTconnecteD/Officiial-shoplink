import { apiSlice } from "./apiSlice.js";

export const riderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApprovedRiders: builder.query({
      query: () => "/api/riders/approved",
      providesTags: ["Rider"],
    }),
    getMyRiderApplication: builder.query({
      query: () => "/api/riders/mine",
      providesTags: ["RiderApplication"],
    }),
    applyAsRider: builder.mutation({
      query: (application) => ({
        url: "/api/riders/apply",
        method: "POST",
        body: application,
      }),
      invalidatesTags: ["RiderApplication"],
    }),
    getRiderApplications: builder.query({
      query: () => "/api/riders/applications",
      providesTags: ["RiderApplication"],
    }),
    reviewRiderApplication: builder.mutation({
      query: ({ riderId, status }) => ({
        url: `/api/riders/applications/${riderId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["RiderApplication", "Rider"],
    }),
  }),
});

export const {
  useGetApprovedRidersQuery,
  useGetMyRiderApplicationQuery,
  useApplyAsRiderMutation,
  useGetRiderApplicationsQuery,
  useReviewRiderApplicationMutation,
} = riderApiSlice;
