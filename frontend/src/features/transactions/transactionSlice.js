import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchTransactions = createAsyncThunk(
    "transactions/fetchTransactions",
    async (filters = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();

            if (filters.page) params.append("page", filters.page);
            if (filters.limit) params.append("limit", filters.limit);
            if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
            if (filters.dateTo) params.append("dateTo", filters.dateTo);
            if (filters.status) params.append("status", filters.status);
            if (filters.type) params.append("type", filters.type);
            if (filters.search) params.append("search", filters.search);
            if (filters.errorsOnly)
                params.append("errorsOnly", filters.errorsOnly);

            const response = await fetch(
                `/api/transactions?${params.toString()}`
            );

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

export const fetchTransactionById = createAsyncThunk(
    "transactions/fetchTransactionById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/transactions/${id}`);

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
    data: [],
    currentTransaction: null,
    loading: false,
    error: null,
    pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
    },
};

const transactionSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        clearCurrentTransaction: (state) => {
            state.currentTransaction = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setPage: (state, action) => {
            state.pagination.current = action.payload;
        },
        setPageSize: (state, action) => {
            state.pagination.pageSize = action.payload;
            state.pagination.current = 1;
        },
    },
    extraReducers: (builder) => {
        builder

            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data || [];
                state.pagination = {
                    ...state.pagination,
                    ...action.payload.pagination,
                    current:
                        action.payload.pagination?.page ||
                        state.pagination.current,
                    pageSize:
                        action.payload.pagination?.limit ||
                        state.pagination.pageSize,
                    total: action.payload.pagination?.total || 0,
                };
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.data = [];
            })

            .addCase(fetchTransactionById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactionById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTransaction = action.payload;
            })
            .addCase(fetchTransactionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.currentTransaction = null;
            });
    },
});

export const { clearCurrentTransaction, clearError, setPage, setPageSize } =
    transactionSlice.actions;

export default transactionSlice.reducer;
export const transactionReducer = transactionSlice.reducer;
