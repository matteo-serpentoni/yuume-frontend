export const formatPrice = (price, currency = "EUR") => {
    if (typeof price !== "number") return price || "Prezzo non disponibile";

    if (currency === "EUR") return `€${price}`;
    return `${currency} ${price}`;
};

export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
};

export const extractProductName = (title = "") => {
    return title.split(" - ")[0].replace(/[""]/g, "");
};

export const parseMessageFormat = (message) => {
    if (!message) return { content: "", hasMarkdown: false, hasHTML: false };

    const hasMarkdown = /[*_`[\]#>|]/.test(message);
    const hasHTML = /<[^>]+>/.test(message);

    return {
        content: message,
        hasMarkdown,
        hasHTML
    };
};