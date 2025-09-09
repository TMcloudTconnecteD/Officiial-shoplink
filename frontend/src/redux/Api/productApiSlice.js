import { PRODUCT_URL, UPLOAD_URL } from "../features/constants.js";
import { apiSlice } from "./apiSlice.js";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get products with keyword search
    getProducts: builder.query({
      query: ({ keyword }) => ({
        url: `${PRODUCT_URL}`,
        params: { keyword },
      }),
      keepUnusedDataFor: 60, // cache for 60s
      providesTags: ["Products"],
    }),

    // ✅ Get single product
    getProductById: builder.query({
      query: (productId) => `${PRODUCT_URL}/${productId}`,
      providesTags: (result, error, productId) => [
        { type: "Product", id: productId },
      ],
    }),

    // ✅ Get all products (no keyword)
    allProducts: builder.query({
      query: () => `${PRODUCT_URL}/allproducts`,
      providesTags: ["Products"],
    }),

    // ✅ Get product details
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
      }),
      keepUnusedDataFor: 60,
      providesTags: (result, error, productId) => [
        { type: "Product", id: productId },
      ],
    }),

    // ✅ Create product
    createProduct: builder.mutation({
      query: (productData) => ({
        url: `${PRODUCT_URL}`,
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Products"],
    }),

    // ✅ Update product
    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
        "Products",
      ],
    }),

    // ✅ Delete product
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, productId) => [
        { type: "Product", id: productId },
        "Products",
      ],
    }),

    // ✅ Create review
    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/${data.productId}/reviews`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
      ],
    }),

    // ✅ Get top products
    getTopProducts: builder.query({
      query: () => ({
        url: `${PRODUCT_URL}/top`,
        method: "GET",
      }),
      keepUnusedDataFor: 60,
      providesTags: ["Products"],
    }),

    // ✅ Get new products
    getNewProducts: builder.query({
      query: () => ({
        url: `${PRODUCT_URL}/new`,
        method: "GET",
      }),
      keepUnusedDataFor: 60,
      providesTags: ["Products"],
    }),

    // ✅ Upload product image
    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`,
        method: "POST",
        body: data, // should be FormData
      }),
    }),

    // ✅ Filtered products (POST query)
    getFilteredProducts: builder.query({
      query: ({ checked, radio }) => ({
        url: `${PRODUCT_URL}/filtered-products`,
        method: "POST",
        body: { checked, radio },
      }),
      providesTags: ["Products"],
    }),

    // ✅ Get products by shopId
    getProductsByShopId: builder.query({
      query: (shopId) => `${PRODUCT_URL}/shop/${shopId}`,
      providesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductByIdQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useGetTopProductsQuery,
  useGetNewProductsQuery,
  useAllProductsQuery,
  useUploadProductImageMutation,
  useGetFilteredProductsQuery,
  useGetProductsByShopIdQuery,
} = productApiSlice;
