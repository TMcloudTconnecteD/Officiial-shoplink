

import { PRODUCT_URL, UPLOAD_URL } from "../features/constants.js";
import { apiSlice } from "./apiSlice.js";

export const productApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: ({keyword}) => ({
                url: `${PRODUCT_URL}`,
                params: {
                    keyword,
                },
                
            }),

            keepUnusedDataFor: 5,
            providesTags:['Products'],
        }),


        getProductById: builder.query({
            query:(productId) => `${PRODUCT_URL}/${productId}`,
            providesTags:(result,error,productId) => [
                {type: 'Product', id: productId},
            ],
        }),


        allProducts : builder.query({
            query: () =>  `${PRODUCT_URL}/allproducts`,
                
            

        }),
        getProductDetails: builder.query({
            query: (productId) =>({ 
                url: `${PRODUCT_URL}/${productId}`}),
           keepUnusedDataFor: 5,
            
        }),

        createProduct: builder.mutation({
            query: (productData) => ({
                url: `${PRODUCT_URL}`,
                method: 'POST',
                body: productData,
            }),
            invalidatesTags: ['Product'],
        }),

        updateProduct: builder.mutation({
            query: ({productId, formData}) => ({
                url: `${PRODUCT_URL}/${productId}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Product'],
        }),


        deleteProduct: builder.mutation({
            query: (productId) => ({
                url: `${PRODUCT_URL}/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),

        createReview : builder.mutation({
            query: (data) => ({
                url: `${PRODUCT_URL}/${data.productId}/reviews`,
                method: 'POST',
                body: data,

            })
        }),

        getTopProducts: builder.query({
            query: () => ({
                url: `${PRODUCT_URL}/top`,
                method: 'GET',
                keepUnusedDataFor: 5,
            }),
            
        }),

        getNewProducts: builder.query({
            query: () => ({
                url: `${PRODUCT_URL}/new`,
                method: 'GET',
                keepUnusedDataFor: 5,
            }),
            
        }),

        uploadProductImage: builder.mutation({
            query: (data) => ({

                url: `${UPLOAD_URL}`,
                method: 'POST',
                body: data,



                
            }),
        }),

        getFilteredProducts: builder.query({
            query: ({ checked, radio }) => ({
              url: `${PRODUCT_URL}/filtered-products`,
              method: "POST",
              body: { checked, radio },
            }),
          }),

    })

})

export const { useGetProductByIdQuery,
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
  } = productApiSlice;

