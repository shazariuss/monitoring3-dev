import { configureStore } from "@reduxjs/toolkit";
import transactionReducer from "../features/transactions/transactionSlice";
import filtersReducer from "../features/filters/filtersSlice";
import referenceReducer from "../features/reference/referenceSlice";
import appReducer from "../features/app/appSlice";

export const store = configureStore({
    reducer: {
        transactions: transactionReducer,
        filters: filtersReducer,
        reference: referenceReducer,
        app: appReducer,
    },
});
