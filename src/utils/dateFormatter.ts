/**
 * Format date and time in a human-readable way, similar to Todoist
 */

export const formatDueDate = (dueDate?: string, dueTime?: string): string => {
  if (!dueDate) return '';

  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time parts for comparison
  const resetTime = (d: Date) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const dateOnly = resetTime(new Date(date));
  const todayOnly = resetTime(new Date(today));
  const tomorrowOnly = resetTime(new Date(tomorrow));
  const yesterdayOnly = resetTime(new Date(yesterday));

  let dateStr = '';

  // Check if date is today, tomorrow, or yesterday
  if (dateOnly.getTime() === todayOnly.getTime()) {
    dateStr = 'Today';
  } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    dateStr = 'Tomorrow';
  } else {
    // Calculate if date is within current week (before next Sunday)
    const currentWeekEnd = new Date(today);
    currentWeekEnd.setDate(today.getDate() + (7 - today.getDay())); // Next Sunday
    currentWeekEnd.setHours(23, 59, 59, 999);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // If within current week, show just the day name (e.g., "Friday")
    if (date <= currentWeekEnd && date > today) {
      dateStr = days[date.getDay()];
    } else {
      // Otherwise show date format (e.g., "7 Nov" or "7 Nov 2026" if different year)
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      if (year === today.getFullYear()) {
        dateStr = `${day} ${month}`;
      } else {
        dateStr = `${day} ${month} ${year}`;
      }
    }
  }

  // Add time if provided
  if (dueTime) {
    const [hours, minutes] = dueTime.split(':');
    const hour = parseInt(hours, 10);
    const min = minutes;

    // Format as 12-hour time
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;

    dateStr += ` ${hour12}:${min} ${ampm}`;
  }

  return dateStr;
};

export const isOverdue = (dueDate?: string, dueTime?: string): boolean => {
  if (!dueDate) return false;

  const now = new Date();
  const due = new Date(dueDate);

  if (dueTime) {
    const [hours, minutes] = dueTime.split(':');
    due.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  } else {
    // If no time specified, consider it due at end of day
    due.setHours(23, 59, 59);
  }

  return due < now;
};

export type DateUrgency = 'overdue' | 'today' | 'tomorrow' | 'upcoming';

export const getDateUrgency = (dueDate?: string, dueTime?: string): DateUrgency | null => {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time parts for comparison
  const resetTime = (d: Date) => {
    const newDate = new Date(d);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const dateOnly = resetTime(date);
  const todayOnly = resetTime(today);
  const tomorrowOnly = resetTime(tomorrow);

  // Check if overdue
  if (isOverdue(dueDate, dueTime)) {
    return 'overdue';
  }

  // Check if today
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'today';
  }

  // Check if tomorrow
  if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return 'tomorrow';
  }

  // Otherwise it's upcoming
  return 'upcoming';
};

export const getDateUrgencyColor = (urgency: DateUrgency | null): string => {
  switch (urgency) {
    case 'overdue':
      return 'text-red-600 dark:text-red-500';
    case 'today':
      return 'text-green-600 dark:text-green-500';
    case 'tomorrow':
      return 'text-orange-600 dark:text-orange-500';
    case 'upcoming':
      return 'text-purple-600 dark:text-purple-500'; // Purple/blue like Todoist
    default:
      return 'text-purple-600 dark:text-purple-500';
  }
};
