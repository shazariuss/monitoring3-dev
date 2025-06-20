import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk для загрузки статистики
export const fetchStats = createAsyncThunk(
    "stats/fetchStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch("/api/transactions/stats");

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    data: {
        total: 0,
        success: 0,
        errors: 0,
        pending: 0,
        statusBreakdown: {},
    },
    loading: false,
    error: null,
};

const statsSlice = createSlice({
    name: "stats",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = statsSlice.actions;

export default statsSlice.reducer;
export const statsReducer = statsSlice.reducer;
