import { Task, Reminder } from '../types/task';
import { showTaskReminder, requestNotificationPermission } from './notifications';
import { parseISO, isBefore, isAfter, subMinutes } from 'date-fns';

/**
 * Reminder Scheduler
 * Checks for due reminders and triggers notifications
 */

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
const CHECK_INTERVAL_MS = 60000; // Check every minute
const shownReminders = new Set<string>();

/**
 * Check if a reminder is due now (within the last minute)
 */
const isReminderDue = (reminder: Reminder, task: Task): boolean => {
  try {
    let reminderTime: Date;

    if (reminder.type === 'absolute' && reminder.dateTime) {
      reminderTime = parseISO(reminder.dateTime);
    } else if (reminder.type === 'relative' && reminder.relativeMinutes !== null && task.dueDate) {
      const dueDate = parseISO(task.dueDate);
      reminderTime = subMinutes(dueDate, reminder.relativeMinutes);
    } else {
      return false;
    }

    const now = new Date();
    const oneMinuteAgo = subMinutes(now, 1);

    // Reminder is due if it's between 1 minute ago and now
    return isAfter(reminderTime, oneMinuteAgo) && isBefore(reminderTime, now);
  } catch (error) {
    console.error('Error parsing reminder time:', error);
    return false;
  }
};

/**
 * Process a single reminder
 */
const processReminder = (task: Task, reminder: Reminder) => {
  const reminderKey = `${task.id}-${reminder.id}`;

  // Skip if already shown or already triggered
  if (shownReminders.has(reminderKey) || reminder.isTriggered) {
    return;
  }

  if (isReminderDue(reminder, task)) {
    showTaskReminder(task.title, task.dueDate);
    shownReminders.add(reminderKey);

    // Clear from shown reminders after 2 minutes
    setTimeout(() => {
      shownReminders.delete(reminderKey);
    }, 120000);
  }
};

/**
 * Check all tasks for due reminders
 */
export const checkReminders = (tasks: Task[]) => {
  tasks.forEach((task) => {
    if (!task.completed && task.reminders.length > 0) {
      task.reminders.forEach((reminder) => {
        processReminder(task, reminder);
      });
    }
  });
};

/**
 * Start the reminder scheduler
 * Automatically requests notification permission on first start
 */
export const startReminderScheduler = async (getTasks: () => Task[]) => {
  // Request permission if not already granted
  await requestNotificationPermission();

  // Clear any existing interval
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  // Check immediately
  checkReminders(getTasks());

  // Then check every minute
  schedulerInterval = setInterval(() => {
    checkReminders(getTasks());
  }, CHECK_INTERVAL_MS);

  console.log('[Reminder Scheduler] Started');
};

/**
 * Stop the reminder scheduler
 */
export const stopReminderScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Reminder Scheduler] Stopped');
  }
};

/**
 * Calculate reminder datetime based on type and task due date
 */
export const calculateReminderDatetime = (
  type: 'absolute' | 'relative',
  absoluteDatetime: string | null,
  relativeMinutes: number | null,
  taskDueDate: string | null
): string | null => {
  if (type === 'absolute' && absoluteDatetime) {
    return absoluteDatetime;
  }

  if (type === 'relative' && relativeMinutes !== null && taskDueDate) {
    try {
      const dueDate = parseISO(taskDueDate);
      const reminderDate = subMinutes(dueDate, relativeMinutes);
      return reminderDate.toISOString();
    } catch (error) {
      console.error('Error calculating relative reminder:', error);
      return null;
    }
  }

  return null;
};
