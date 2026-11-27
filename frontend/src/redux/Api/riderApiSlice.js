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
      invalidatesTags: ["RiderApplication", "Notification"],
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
      invalidatesTags: ["RiderApplication", "Rider", "Notification"],
    }),
    suspendRider: builder.mutation({
      query: ({ riderId, reason }) => ({
        url: `/api/riders/applications/${riderId}/suspend`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["RiderApplication", "Rider", "Notification"],
    }),
    submitRiderAppeal: builder.mutation({
      query: (message) => ({
        url: "/api/riders/mine/appeal",
        method: "POST",
        body: { message },
      }),
      invalidatesTags: ["RiderApplication", "Rider", "Notification"],
    }),
    reviewRiderAppeal: builder.mutation({
      query: ({ riderId, decision, note }) => ({
        url: `/api/riders/applications/${riderId}/appeal`,
        method: "PATCH",
        body: { decision, note },
      }),
      invalidatesTags: ["RiderApplication", "Rider", "Notification"],
    }),
  }),
});

export const {
  useGetApprovedRidersQuery,
  useGetMyRiderApplicationQuery,
  useApplyAsRiderMutation,
  useGetRiderApplicationsQuery,
  useReviewRiderApplicationMutation,
  useSuspendRiderMutation,
  useSubmitRiderAppealMutation,
  useReviewRiderAppealMutation,
} = riderApiSlice;
