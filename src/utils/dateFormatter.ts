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
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    dateStr = 'Yesterday';
  } else {
    // Format as "Mon 15 Jan" or "Mon 15 Jan 2025" if not current year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    if (year === today.getFullYear()) {
      dateStr = `${dayName} ${day} ${month}`;
    } else {
      dateStr = `${dayName} ${day} ${month} ${year}`;
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
