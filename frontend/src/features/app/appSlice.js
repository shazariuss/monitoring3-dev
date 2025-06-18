import { createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
    name: "app",
    initialState: {
        lastUpdate: null,
        autoRefresh: true,
        refreshInterval: 30000, // 30 секунд
        isOnline: true,
    },
    reducers: {
        setLastUpdate: (state) => {
            state.lastUpdate = new Date().toISOString();
        },
        toggleAutoRefresh: (state) => {
            state.autoRefresh = !state.autoRefresh;
        },
        setRefreshInterval: (state, action) => {
            state.refreshInterval = action.payload;
        },
        setOnlineStatus: (state, action) => {
            state.isOnline = action.payload;
        },
    },
});

export const {
    setLastUpdate,
    toggleAutoRefresh,
    setRefreshInterval,
    setOnlineStatus,
} = appSlice.actions;

export default appSlice.reducer;
