import { apiSlice } from "./apiSlice.js";

export const marketingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPromoSettings: builder.query({
      query: () => "/api/marketing/public/settings",
      providesTags: ["Promo"],
    }),
    getFreshDrops: builder.query({
      query: () => "/api/marketing/public/fresh-drops",
      providesTags: ["Promo"],
    }),
    getFeaturedPromoProducts: builder.query({
      query: () => "/api/marketing/public/featured-products",
      providesTags: ["Promo"],
    }),
    getTrendingProducts: builder.query({
      query: () => "/api/marketing/public/trending",
      providesTags: ["Promo"],
    }),
    getSellerSpotlight: builder.query({
      query: () => "/api/marketing/public/seller-spotlight",
      providesTags: ["Promo"],
    }),
    getWelcomeToast: builder.query({
      query: () => "/api/marketing/public/welcome",
      keepUnusedDataFor: 0,
    }),
    logPromoEvent: builder.mutation({
      query: (body) => ({
        url: "/api/marketing/impressions",
        method: "POST",
        body,
      }),
    }),
    updateCartActivity: builder.mutation({
      query: (body) => ({
        url: "/api/marketing/cart/activity",
        method: "POST",
        body,
      }),
    }),
    getCartNudgeStatus: builder.query({
      query: () => "/api/marketing/cart/status",
      providesTags: ["Promo"],
    }),
    getRewards: builder.query({
      query: () => "/api/marketing/rewards/me",
      providesTags: ["Rewards"],
    }),
    getPromoAdminCatalog: builder.query({
      query: () => "/api/marketing/admin/catalog",
      providesTags: ["Promo"],
    }),
    updatePromoModules: builder.mutation({
      query: (body) => ({
        url: "/api/marketing/admin/modules",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Promo"],
    }),
    updateFeaturedSlot: builder.mutation({
      query: (body) => ({
        url: "/api/marketing/admin/featured",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Promo"],
    }),
    toggleProductFeature: builder.mutation({
      query: ({ productId, featured }) => ({
        url: `/api/marketing/admin/products/${productId}/feature`,
        method: "PATCH",
        body: { featured },
      }),
      invalidatesTags: ["Promo"],
    }),
    getPromoAnalytics: builder.query({
      query: () => "/api/marketing/admin/analytics",
      providesTags: ["Promo"],
    }),
    getPointsAnalytics: builder.query({
      query: () => "/api/marketing/admin/points-analytics",
      providesTags: ["Rewards"],
    }),
    getAllReferrals: builder.query({
      query: () => "/api/marketing/admin/referrals",
      providesTags: ["Rewards"],
    }),
    getAdminRewardCredits: builder.query({
      query: ({ page = 1, status = "", search = "" } = {}) => ({
        url: "/api/marketing/admin/reward-credits",
        params: { page, status: status || undefined, search: search || undefined },
      }),
      providesTags: ["Rewards"],
    }),
    updateRewardProgram: builder.mutation({
      query: (body) => ({
        url: "/api/marketing/admin/rewards",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Promo", "Rewards"],
    }),
    updateRewardCreditStatus: builder.mutation({
      query: ({ creditId, enabled }) => ({
        url: `/api/marketing/admin/reward-credits/${creditId}`,
        method: "PATCH",
        body: { enabled },
      }),
      invalidatesTags: ["Rewards"],
    }),
  }),
});

export const {
  useGetPromoSettingsQuery,
  useGetFreshDropsQuery,
  useGetFeaturedPromoProductsQuery,
  useGetTrendingProductsQuery,
  useGetSellerSpotlightQuery,
  useGetWelcomeToastQuery,
  useLogPromoEventMutation,
  useUpdateCartActivityMutation,
  useGetCartNudgeStatusQuery,
  useGetRewardsQuery,
  useGetPromoAdminCatalogQuery,
  useUpdatePromoModulesMutation,
  useUpdateFeaturedSlotMutation,
  useToggleProductFeatureMutation,
  useGetPromoAnalyticsQuery,
  useGetPointsAnalyticsQuery,
  useGetAllReferralsQuery,
  useGetAdminRewardCreditsQuery,
  useUpdateRewardProgramMutation,
  useUpdateRewardCreditStatusMutation,
} = marketingApiSlice;
