import { useState, useEffect } from "react";

const useFormTypes = () => {
    const [formTypes, setFormTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFormTypes = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/transactions/form-types");

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("📋 Form types error response:", errorText);
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`
                    );
                }

                const data = await response.json();

                setFormTypes(data || []);
            } catch (err) {
                setError(err.message);
                setFormTypes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFormTypes();
    }, []);

    return { formTypes, loading, error };
};

export default useFormTypes;
