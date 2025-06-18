import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    dateFrom: undefined,
    dateTo: undefined,
    status: undefined,
    type: undefined,
    search: "",
    errorsOnly: false,
    quickFilter: undefined,
};

const filtersSlice = createSlice({
    name: "filters",
    initialState,
    reducers: {
        setDateFrom: (state, action) => {
            state.dateFrom = action.payload || undefined;
        },
        setDateTo: (state, action) => {
            state.dateTo = action.payload || undefined;
        },
        setDateRange: (state, action) => {
            // Новый reducer для установки диапазона дат
            const { dateFrom, dateTo } = action.payload || {};
            state.dateFrom = dateFrom || undefined;
            state.dateTo = dateTo || undefined;
        },
        setStatus: (state, action) => {
            state.status = action.payload || undefined;
        },
        setType: (state, action) => {
            state.type = action.payload || undefined;
        },
        setSearch: (state, action) => {
            state.search = action.payload || "";
        },
        setErrorsOnly: (state, action) => {
            state.errorsOnly = Boolean(action.payload);
        },

        setQuickFilter: (state, action) => {
            const filter = action.payload;

            if (filter === "today") {
                const today = new Date().toISOString().split("T")[0];
                state.dateFrom = today;
                state.dateTo = today;
                state.status = undefined;
                state.errorsOnly = false;
            } else if (filter === "yesterday") {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split("T")[0];
                state.dateFrom = yesterdayStr;
                state.dateTo = yesterdayStr;
                state.status = undefined;
                state.errorsOnly = false;
            } else if (filter === "last7days") {
                const today = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 7);
                state.dateFrom = sevenDaysAgo.toISOString().split("T")[0];
                state.dateTo = today.toISOString().split("T")[0];
                state.status = undefined;
                state.errorsOnly = false;
            } else if (filter === "errors") {
                state.errorsOnly = true;
                state.status = undefined;
                state.dateFrom = undefined;
                state.dateTo = undefined;
            } else if (filter === "sent") {
                state.errorsOnly = false;
                state.status = "7"; // Отправлен в SWIFT - согласно таблице
                state.dateFrom = undefined;
                state.dateTo = undefined;
            } else if (filter === "ready") {
                state.errorsOnly = false;
                state.status = "5"; // На подтверждение - согласно таблице
                state.dateFrom = undefined;
                state.dateTo = undefined;
            } else if (filter === "all") {
                state.dateFrom = undefined;
                state.dateTo = undefined;
                state.status = undefined;
                state.errorsOnly = false;
            }

            state.quickFilter = filter || undefined;
        },
        clearFilters: (state) => {
            state.dateFrom = undefined;
            state.dateTo = undefined;
            state.status = undefined;
            state.type = undefined;
            state.search = "";
            state.errorsOnly = false;
            state.quickFilter = undefined;
        },
    },
});

export const {
    setDateFrom,
    setDateTo,
    setDateRange,
    setStatus,
    setType,
    setSearch,
    setErrorsOnly,
    setQuickFilter,
    clearFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
