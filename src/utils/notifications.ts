/**
 * Browser Notifications Utility
 * Handles permission requests and notification display
 */

export type NotificationPermission = 'granted' | 'denied' | 'default';

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  }

  return Notification.permission as NotificationPermission;
};

/**
 * Show a browser notification
 */
export const showNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return null;
  }

  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }

  return null;
};

/**
 * Show a task reminder notification
 */
export const showTaskReminder = (taskTitle: string, dueDate?: string) => {
  const body = dueDate
    ? `Due: ${dueDate}`
    : 'Time to work on this task';

  return showNotification('Task Reminder', {
    body: `${taskTitle}\n\n${body}`,
    tag: `task-reminder-${Date.now()}`,
    requireInteraction: false,
    silent: false,
  });
};

/**
 * Check if notifications are supported
 */
export const notificationsSupported = (): boolean => {
  return 'Notification' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission as NotificationPermission;
};
