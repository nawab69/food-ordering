import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { MenuFilters } from '../../types';

interface MenuState {
    selectedCategory: string;
    searchTerm: string;
    filters: MenuFilters;
    isLoading: boolean;
    error: string | null;
}

const initialState: MenuState = {
    selectedCategory: 'all',
    searchTerm: '',
    filters: {},
    isLoading: false,
    error: null,
};

const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        setSelectedCategory: (state, action: PayloadAction<string>) => {
            state.selectedCategory = action.payload;
        },

        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },

        setFilters: (state, action: PayloadAction<MenuFilters>) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        clearFilters: (state) => {
            state.filters = {};
            state.searchTerm = '';
            state.selectedCategory = 'all';
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setSelectedCategory,
    setSearchTerm,
    setFilters,
    clearFilters,
    setLoading,
    setError,
} = menuSlice.actions;

export default menuSlice.reducer;
