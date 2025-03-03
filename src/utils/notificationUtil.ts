import { ref, readonly } from 'vue';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: number;
    type: NotificationType;
    message: string;
    timeout?: number;
}

const notifications = ref<Notification[]>([]);
let nextId = 1;

export function addNotification(type: NotificationType, message: string, timeout = 5000): number {
    const id = nextId++;
    const notification: Notification = {
        id,
        type,
        message,
        timeout
    };

    notifications.value.push(notification);

    if (timeout > 0) {
        setTimeout(() => {
            removeNotification(id);
        }, timeout);
    }

    return id;
}

export function removeNotification(id: number): void {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
        notifications.value.splice(index, 1);
    }
}

export function clearNotifications(): void {
    notifications.value = [];
}

export function showSuccess(message: string, timeout = 5000): number {
    return addNotification('success', message, timeout);
}

export function showError(message: string, timeout = 8000): number {
    return addNotification('error', message, timeout);
}

export function showInfo(message: string, timeout = 5000): number {
    return addNotification('info', message, timeout);
}

export function showWarning(message: string, timeout = 5000): number {
    return addNotification('warning', message, timeout);
}

export const activeNotifications = readonly(notifications);