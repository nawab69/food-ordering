import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include',
    }),
    tagTypes: ['Menu', 'Order', 'Push'],
    endpoints: (builder) => ({
        // Menu endpoints
        getMenuItems: builder.query({
            query: (params = {}) => ({
                url: '/menu',
                params,
            }),
            providesTags: ['Menu'],
        }),
        getMenuItem: builder.query({
            query: (id) => `/menu/${id}`,
            providesTags: (_, __, id) => [{ type: 'Menu', id }],
        }),

        // Order endpoints
        createOrder: builder.mutation({
            query: (orderData) => ({
                url: '/orders',
                method: 'POST',
                body: orderData,
            }),
            invalidatesTags: ['Order'],
        }),
        getOrder: builder.query({
            query: (id) => `/orders/${id}`,
            providesTags: (_, __, id) => [{ type: 'Order', id }],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/orders/${id}/status`,
                method: 'PUT',
                body: { status },
            }),
            invalidatesTags: (_, __, { id }) => [{ type: 'Order', id }],
        }),

        // Push notification endpoints
        subscribeToPush: builder.mutation({
            query: (subscription) => ({
                url: '/push/subscribe',
                method: 'POST',
                body: subscription,
            }),
            invalidatesTags: ['Push'],
        }),
        unsubscribeFromPush: builder.mutation({
            query: () => ({
                url: '/push/subscribe',
                method: 'DELETE',
            }),
            invalidatesTags: ['Push'],
        }),
        getPushPublicKey: builder.query({
            query: () => '/push/publicKey',
            providesTags: ['Push'],
        }),

        // Health check
        getHealth: builder.query({
            query: () => '/health',
        }),
    }),
});

export const {
    useGetMenuItemsQuery,
    useGetMenuItemQuery,
    useCreateOrderMutation,
    useGetOrderQuery,
    useUpdateOrderStatusMutation,
    useSubscribeToPushMutation,
    useUnsubscribeFromPushMutation,
    useGetPushPublicKeyQuery,
    useGetHealthQuery,
} = apiSlice;
