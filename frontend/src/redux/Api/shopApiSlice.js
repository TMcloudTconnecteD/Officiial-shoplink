import { SHOP_URL, UPLOAD_URL } from "../features/constants.js";
import { apiSlice } from "./apiSlice.js";

export const shopApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all shops
    fetchShops: builder.query({
      query: () => ({
        url: `${SHOP_URL}/all`,
        method: "GET",
      }),
      keepUnusedDataFor: 50,
      providesTags: ["Shop"],
    }),

    // Fetch a single shop by ID
    getShopById: builder.query({
      query: (id) => ({
        url: `${SHOP_URL}/${id}`,
        method: "GET",
      }),
      providesTags: ["Shop"],
    }),

    // Create a shop
    createShop: builder.mutation({
      query: (mallData) => ({
        url: `${SHOP_URL}`,
        method: "POST",
        body: mallData,
      }),
      invalidatesTags: ["Shop"],
    }),

    // Update a shop
    updateShop: builder.mutation({
      query: ({ id, formData }) => ({
        url: `${SHOP_URL}/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Shop"],
    }),

    // Delete a shop
    deleteShop: builder.mutation({
      query: (id) => ({
        url: `${SHOP_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shop"],
    }),

    // Fetch shops by category
    fetchShopsByCategory: builder.query({
      query: (category) => ({
        url: `${SHOP_URL}/shops/category/${category}`,
        method: "GET",
      }),
    }),

    // Upload shop image
    uploadShopImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`,
        method: "POST",
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
  useGetShopByIdQuery,
} = shopApiSlice;
