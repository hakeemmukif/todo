import {
  startOfDay,
  addDays,
  addWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday as isTodayFns,
  getDay,
  setDay,
} from 'date-fns';

export interface QuickDateOption {
  label: string;
  sublabel: string;
  date: Date;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isPast: boolean;
}

/**
 * Get quick date options for the picker
 */
export const getQuickDateOptions = (): QuickDateOption[] => {
  const today = startOfDay(new Date());

  return [
    {
      label: 'Today',
      sublabel: format(today, 'EEE'),
      date: today,
    },
    {
      label: 'Tomorrow',
      sublabel: format(addDays(today, 1), 'EEE'),
      date: addDays(today, 1),
    },
    {
      label: 'This weekend',
      sublabel: format(getThisWeekend(today), 'EEE'),
      date: getThisWeekend(today),
    },
    {
      label: 'Next week',
      sublabel: format(getNextWeek(today), 'EEE d MMM'),
      date: getNextWeek(today),
    },
  ];
};

/**
 * Get this weekend's date (Saturday)
 */
export const getThisWeekend = (fromDate: Date): Date => {
  const today = startOfDay(fromDate);
  const currentDay = getDay(today);

  // If today is Sunday (0) or Saturday (6), get next Saturday
  if (currentDay === 0 || currentDay === 6) {
    return setDay(addWeeks(today, 1), 6);
  }

  // Otherwise get this week's Saturday
  return setDay(today, 6);
};

/**
 * Get next week's Monday
 */
export const getNextWeek = (fromDate: Date): Date => {
  const today = startOfDay(fromDate);
  const currentDay = getDay(today);

  // If today is Monday, get next Monday
  if (currentDay === 1) {
    return addWeeks(today, 1);
  }

  // Get next Monday
  const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
  return addDays(today, daysUntilMonday);
};

/**
 * Generate calendar data for a given month
 */
export const getMonthCalendarData = (
  year: number,
  month: number,
  selectedDate?: Date | null
): CalendarDay[] => {
  const firstDayOfMonth = startOfMonth(new Date(year, month));
  const lastDayOfMonth = endOfMonth(new Date(year, month));

  // Get the start of the week for the first day (Sunday)
  const calendarStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
  // Get the end of the week for the last day
  const calendarEnd = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });

  // Get all days in the calendar view
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days.map((date) => ({
    date,
    isCurrentMonth: isSameMonth(date, firstDayOfMonth),
    isToday: isTodayFns(date),
    isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
    isPast: date < startOfDay(new Date()),
  }));
};

/**
 * Get month name and year for display
 */
export const getMonthYearLabel = (year: number, month: number): string => {
  return format(new Date(year, month), 'MMMM yyyy');
};

/**
 * Get abbreviated day names for calendar header
 */
export const getDayNames = (): string[] => {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  return eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, 6),
  }).map((date) => format(date, 'EEEEE')); // Single letter (M, T, W, T, F, S, S)
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  return isTodayFns(date);
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date): boolean => {
  return date < startOfDay(new Date());
};

/**
 * Format date for display in input
 */
export const formatDateForInput = (date: Date | null): string => {
  if (!date) return '';

  const today = startOfDay(new Date());
  const targetDate = startOfDay(date);

  if (isSameDay(targetDate, today)) {
    return 'Today';
  }

  if (isSameDay(targetDate, addDays(today, 1))) {
    return 'Tomorrow';
  }

  if (isSameDay(targetDate, addDays(today, -1))) {
    return 'Yesterday';
  }

  // Within next 7 days, show day name
  const daysDiff = Math.floor(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff > 0 && daysDiff <= 7) {
    return format(date, 'EEEE'); // "Monday"
  }

  // Otherwise show full date
  return format(date, 'MMM d, yyyy');
};
