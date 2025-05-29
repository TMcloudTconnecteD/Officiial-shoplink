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

        // Upload shop image
        uploadShopImage: builder.mutation({
            query: (data) => ({
                url: `${UPLOAD_URL}`,
                method: 'POST',
                // Don't transform FormData to JSON
                body: data,
                formData: true,
            }),
        }),
    }),
});  

export const {
    useCreateShopMutation,
    useUpdateShopMutation,
    useDeleteShopMutation,
    useFetchShopsQuery,
    useFetchShopsByCategoryQuery,
    useUploadShopImageMutation,
} = shopApiSlice;
