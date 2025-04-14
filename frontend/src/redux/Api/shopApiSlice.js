import { SHOP_URL, UPLOAD_URL } from "../features/constants";  // Make sure to update with the correct URL constant
import { apiSlice } from "./apiSlice";

export const shopApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all shops with optional filters
        fetchShops: builder.query({
            query: () => ({
                url: `${SHOP_URL}/all`,
                method: 'GET',
               
                
            }),
            validatesTags: ['Shop'],

            keepUnusedDataFor: 50,
            
        }),

        // Create a new shop
        createShop: builder.mutation({
            query: (newShop) => ({
                url: `${SHOP_URL}`,
                method: 'POST',
                body: newShop,
            }),
            invalidatesTags: ['Shop'],
        }),

        // Update an existing shop
        updateShop: builder.mutation({
            query: ({ shopId, updatedShop }) => ({
                url: `${SHOP_URL}/${shopId}`,
                method: 'PUT',
                body: updatedShop,
            }),
        }),

        // Delete a shop
        deleteShop: builder.mutation({
            query: (shopId) => ({
                url: `${SHOP_URL}/${shopId}`,
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
    useFetchShopsByCategoryQuery,
    useUploadShopImageMutation,

} = shopApiSlice;
