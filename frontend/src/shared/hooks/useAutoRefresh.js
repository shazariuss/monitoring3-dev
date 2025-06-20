import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "../../features/transactions/transactionSlice";
import { fetchStats } from "../../features/stats/statsSlice"; // Исправлен импорт
import { setLastUpdate } from "../../features/app/appSlice";

const useAutoRefresh = () => {
    const dispatch = useDispatch();
    const { autoRefresh, refreshInterval } = useSelector((state) => state.app);
    const filters = useSelector((state) => state.filters);

    useEffect(() => {
        if (!autoRefresh) {
            return;
        }

        const intervalId = setInterval(() => {
            // Обновляем данные
            dispatch(fetchTransactions(filters));
            dispatch(fetchStats());
            dispatch(setLastUpdate());
        }, refreshInterval);

        // Первое обновление сразу при включении
        dispatch(fetchTransactions(filters));
        dispatch(fetchStats());
        dispatch(setLastUpdate());

        return () => {
            clearInterval(intervalId);
        };
    }, [dispatch, autoRefresh, refreshInterval, filters]);

    return {
        isAutoRefreshEnabled: autoRefresh,
        refreshInterval,
    };
};

export default useAutoRefresh;
