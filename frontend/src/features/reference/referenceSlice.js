import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { referenceApi } from "../../shared/api/api";

export const fetchErrors = createAsyncThunk(
    "reference/fetchErrors",
    async () => {
        const response = await referenceApi.getErrors();
        return response.data;
    }
);

export const fetchFormTypes = createAsyncThunk(
    "reference/fetchFormTypes",
    async () => {
        const response = await referenceApi.getFormTypes();
        return response.data;
    }
);

const referenceSlice = createSlice({
    name: "reference",
    initialState: {
        errors: [],
        formTypes: [],
        loading: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchErrors.fulfilled, (state, action) => {
                state.errors = action.payload;
            })
            .addCase(fetchFormTypes.fulfilled, (state, action) => {
                state.formTypes = action.payload;
            });
    },
});

export default referenceSlice.reducer;
