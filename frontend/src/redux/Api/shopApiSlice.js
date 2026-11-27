import { SHOP_URL, UPLOAD_URL } from "../features/constants.js";  // Make sure to update with the correct URL constant
import { apiSlice } from "./apiSlice.js";

export const shopApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all shops with optional filters
        fetchShops: builder.query({
            query: () => ({
                url: `${SHOP_URL}/all`,
                method: 'GET',
               
                
            }),
            keepUnusedDataFor: 50,
            providesTags: ['Shop'],
            
        }),
        getMallOverview: builder.query({
            query: () => `${SHOP_URL}/mall-overview`,
            providesTags: ['Shop', 'Products'],
        }),
        getMalls: builder.query({
            query: () => "/api/malls",
            providesTags: ["Mall"],
        }),
        getMallDetails: builder.query({
            query: (mallId) => `/api/malls/${mallId}`,
            providesTags: (_result, _error, mallId) => [{ type: "Mall", id: mallId }],
        }),
        getMallProgress: builder.query({
            query: () => "/api/malls/progress/me",
            providesTags: ["Mall", "Shop"],
        }),
        getMallAnalytics: builder.query({
            query: (mallId) => `/api/malls/${mallId}/analytics`,
            providesTags: (_result, _error, mallId) => [{ type: "Mall", id: `analytics-${mallId}` }],
        }),
        recordMallVisit: builder.mutation({
            query: ({ mallId, visitorKey }) => ({
                url: `/api/malls/${mallId}/visit`,
                method: "POST",
                body: { visitorKey },
            }),
        }),
        convertShopToMall: builder.mutation({
            query: (shopId) => ({
                url: `/api/malls/convert/${shopId}`,
                method: "POST",
            }),
            invalidatesTags: ["Mall", "Shop"],
        }),
        createMallChildShop: builder.mutation({
            query: ({ mallId, formData }) => ({
                url: `/api/malls/${mallId}/shops`,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: (_result, _error, { mallId }) => ["Mall", "Shop", { type: "Mall", id: `analytics-${mallId}` }],
        }),
        updateMallFeature: builder.mutation({
            query: ({ mallId, featured }) => ({
                url: `/api/malls/${mallId}/feature`,
                method: "PATCH",
                body: { featured },
            }),
            invalidatesTags: ["Mall"],
        }),

        // Create a new shop
        createShop: builder.mutation({
            query: (mallData) => ({
                url: `${SHOP_URL}`,
                method: 'POST',
                body: mallData,
            }),
            invalidatesTags: ['Shop'],
        }),

        // Update an existing shop
                    updateShop: builder.mutation({
            query: ({ mallId, formData }) => ({
                url: `${SHOP_URL}/${mallId}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Shop'],
            }),

            getShopDetails: builder.query({
            query: (mallId) => `${SHOP_URL}/${mallId}`,
            providesTags: ['Shop'],
            }),

        // Delete a shop
        deleteShop: builder.mutation({
            query: (mallId) => ({
                url: `${SHOP_URL}/${mallId}`,
                method: 'DELETE',
            }),
        }),

        // Fetch shops by category filter
        fetchShopsByCategory: builder.query({
            query: (category) => ({
                url: `${SHOP_URL}/shops/category/${category}`,
                method: 'GET',
            }),
        }),
   


// Export hooks for usage in functional components  
        uploadShopImage: builder.mutation({
            query: (data) => ({

                url: `${UPLOAD_URL}`,
                method: 'POST',
                body: data,



                
            }),
        }),

    }),
});  

export const {
    useCreateShopMutation,
    useUpdateShopMutation,
    useDeleteShopMutation,
    useFetchShopsQuery,
    useGetMallOverviewQuery,
    useGetMallsQuery,
    useGetMallDetailsQuery,
    useGetMallProgressQuery,
    useGetMallAnalyticsQuery,
    useRecordMallVisitMutation,
    useConvertShopToMallMutation,
    useCreateMallChildShopMutation,
    useUpdateMallFeatureMutation,
    useFetchShopsByCategoryQuery,
    useUploadShopImageMutation,
    useGetShopDetailsQuery,

} = shopApiSlice;
