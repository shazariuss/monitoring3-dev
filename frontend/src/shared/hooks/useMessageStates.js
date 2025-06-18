import { useState, useEffect } from "react";

const useMessageStates = () => {
    const [messageStates, setMessageStates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMessageStates = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log(
                "📋 Fetching message states... User: tuitshoxrux, Time: 2025-06-18 14:39:50"
            );

            const response = await fetch("/api/transactions/message-states");

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();

            console.log("✅ Message states loaded:", data);

            setMessageStates(data);
        } catch (err) {
            console.error("❌ Error fetching message states:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessageStates();
    }, []);

    return {
        messageStates,
        loading,
        error,
        refetch: fetchMessageStates,
    };
};

export default useMessageStates;
