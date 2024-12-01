/**
 * Format a date string into 'DD.MM.YYYY, HH:MM:SS'.
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sk-SK', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(date);
};

/**
 * Format a date string into 'DD.MM.YYYY'.
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sk-SK', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};
