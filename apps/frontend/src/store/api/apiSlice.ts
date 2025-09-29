import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { csrfService } from '../../services/csrf.service';
import { persistenceService } from '../../services/persistence.service';

const API_BASE_URL = 'http://localhost:3000/api';

// Custom base query for offline-first menu loading
const customBaseQuery = async (args: any, api: any, extraOptions: any) => {
    const { endpoint } = api;

    // Handle menu items with offline-first strategy
    if (endpoint === 'getMenuItems') {
        try {
            // First try to get from cache
            const cachedItems = await persistenceService.getCachedMenuItems();
            if (cachedItems.length > 0) {
                console.log('Using cached menu items:', cachedItems.length);
                return { data: cachedItems };
            }

            // If no cache, try network
            const result = await fetchBaseQuery({
                baseUrl: API_BASE_URL,
                credentials: 'include',
            })(args, api, extraOptions);

            // If network succeeds, cache the result
            if (result.data) {
                await persistenceService.cacheMenuItems(result.data as any[]);
                console.log('Menu items cached for offline use');
            }

            return result;
        } catch (error) {
            console.log('Network failed, trying cached menu items');
            // Fallback to cache even if it's empty
            const cachedItems = await persistenceService.getCachedMenuItems();
            return { data: cachedItems };
        }
    }

    // For other endpoints, use normal fetch
    return fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include',
        prepareHeaders: async (headers, { endpoint }) => {
            // Add CSRF token for order creation
            if (endpoint === 'createOrder') {
                try {
                    const csrfHeaders = await csrfService.getHeaders();
                    Object.entries(csrfHeaders).forEach(([key, value]) => {
                        headers.set(key, value);
                    });
                } catch (error) {
                    console.error('Failed to get CSRF token:', error);
                }
            }
            return headers;
        },
    })(args, api, extraOptions);
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: customBaseQuery,
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
            query: (body: { endpoint: string }) => ({
                url: '/push/subscribe',
                method: 'DELETE',
                body,
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
