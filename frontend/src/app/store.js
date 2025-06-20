import { configureStore } from "@reduxjs/toolkit";
import transactionReducer from "../features/transactions/transactionSlice";
import filtersReducer from "../features/filters/filtersSlice";
import referenceReducer from "../features/reference/referenceSlice";
import appReducer from "../features/app/appSlice";
import statsReducer from "../features/stats/statsSlice";

export const store = configureStore({
    reducer: {
        transactions: transactionReducer,
        filters: filtersReducer,
        reference: referenceReducer,
        app: appReducer,
        stats: statsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        }),
});

export default store;
