import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include', // Include cookies for CSRF
        prepareHeaders: (headers, { getState }) => {
            // Add CSRF token if available
            const csrfToken = localStorage.getItem('csrfToken');
            if (csrfToken) {
                headers.set('x-csrf-token', csrfToken);
            }
            return headers;
        },
    }),
    tagTypes: ['Menu', 'Order', 'Push', 'Auth'],
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
            providesTags: (result, error, id) => [{ type: 'Menu', id }],
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
            providesTags: (result, error, id) => [{ type: 'Order', id }],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/orders/${id}/status`,
                method: 'PUT',
                body: { status },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
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

        // Auth endpoints
        getCsrfToken: builder.query({
            query: () => '/auth/csrf',
            providesTags: ['Auth'],
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
    useGetCsrfTokenQuery,
    useGetHealthQuery,
} = apiSlice;
