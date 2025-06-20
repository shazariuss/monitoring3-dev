export const cleanFiltersForAPI = (filters) => {
    const cleaned = {};

    Object.keys(filters).forEach((key) => {
        const value = filters[key];

        if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            typeof value !== "undefined"
        ) {
            if (key === "errorsOnly") {
                cleaned[key] = Boolean(value).toString();
            } else {
                cleaned[key] = value;
            }
        }
    });

    return cleaned;
};
