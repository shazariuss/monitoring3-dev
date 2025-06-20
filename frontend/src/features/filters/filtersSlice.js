import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    dateFrom: null,
    dateTo: null,
    status: null,
    messageStatus: null,
    type: null,
    direction: null,
    search: null,
    errorsOnly: false,
    page: 1,
    limit: 10,
};

const filtersSlice = createSlice({
    name: "filters",
    initialState,
    reducers: {
        setDateFrom: (state, action) => {
            state.dateFrom = action.payload;
        },
        setDateTo: (state, action) => {
            state.dateTo = action.payload;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        setMessageStatus: (state, action) => {
            state.messageStatus = action.payload;
        },
        setType: (state, action) => {
            state.type = action.payload;
        },
        setDirection: (state, action) => {
            state.direction = action.payload;
        },
        setSearch: (state, action) => {
            state.search = action.payload;
        },
        setErrorsOnly: (state, action) => {
            state.errorsOnly = action.payload;
        },
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setLimit: (state, action) => {
            state.limit = action.payload;
            state.page = 1;
        },
        clearFilters: (state) => {
            Object.assign(state, {
                ...initialState,
                page: 1,
                limit: state.limit,
            });
        },
    },
});

export const {
    setDateFrom,
    setDateTo,
    setStatus,
    setMessageStatus,
    setType,
    setDirection,
    setSearch,
    setErrorsOnly,
    setPage,
    setLimit,
    clearFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

export const filtersReducer = filtersSlice.reducer;
