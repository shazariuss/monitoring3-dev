import axios from "axios";
import { message } from "antd";

const api = axios.create({
    baseURL: "/api",
    timeout: 10000,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Произошла ошибка";
        message.error(errorMessage);
        return Promise.reject(error);
    }
);

export const transactionApi = {
    getTransactions: (params) => api.get("/transactions", { params }),
    getTransactionById: (id) => api.get(`/transactions/${id}`),
    getStats: () => api.get("/transactions/stats"),
};

export const referenceApi = {
    getErrors: () => api.get("/errors"),
    getFormTypes: () => api.get("/errors/form-types"),
};

export default api;
