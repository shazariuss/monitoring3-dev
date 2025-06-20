import { useState, useEffect } from "react";

const useQueryStates = () => {
    const [queryStates, setQueryStates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQueryStates = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/transactions/query-states");

                console.log(
                    "📊 Query states response status:",
                    response.status
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("📊 Query states error response:", errorText);
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`
                    );
                }

                const data = await response.json();

                setQueryStates(data || []);
            } catch (err) {
                // Fallback данные
                const fallbackData = [
                    { id: 0, name: "Инициализация", color: "#1890ff" },
                    { id: 1, name: "В обработке", color: "#faad14" },
                    { id: 5, name: "Отбракован", color: "#ff4d4f" },
                    { id: 6, name: "Авторизован", color: "#52c41a" },
                    { id: 7, name: "Принят", color: "#52c41a" },
                    { id: 8, name: "Отправлен", color: "#722ed1" },
                    { id: 9, name: "Завершен", color: "#52c41a" },
                ];

                setQueryStates(fallbackData);
                setError(null); // Не показываем ошибку при использовании fallback
            } finally {
                setLoading(false);
            }
        };

        fetchQueryStates();
    }, []);

    return { queryStates, loading, error };
};

export default useQueryStates;
