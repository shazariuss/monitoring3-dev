// Утилита для очистки фильтров перед отправкой
export const cleanFiltersForAPI = (filters) => {
    const cleaned = {};

    Object.keys(filters).forEach((key) => {
        const value = filters[key];

        // Пропускаем null, undefined, пустые строки
        if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            typeof value !== "undefined"
        ) {
            // Для булевых значений
            if (key === "errorsOnly") {
                cleaned[key] = Boolean(value).toString();
            }
            // Для остальных значений
            else {
                cleaned[key] = value;
            }
        }
    });

    return cleaned;
};
