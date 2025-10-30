import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfDay,
  setDay,
  getDay,
  format,
} from 'date-fns';
import { RecurrencePattern, RecurrenceType } from '../types/task';

// ============================================================================
// DATE PARSING
// ============================================================================

export interface ParsedDate {
  date: Date;
  hasTime: boolean;
  time?: string;
}

export interface ParsedRecurrence {
  pattern: RecurrencePattern;
  startDate: Date;
}

/**
 * Parse natural language date input
 * Examples: "today", "tomorrow", "next monday", "in 3 days", "2024-01-15"
 */
export const parseNaturalDate = (input: string): Date | null => {
  const cleaned = input.toLowerCase().trim();
  const today = startOfDay(new Date());

  // Exact date formats
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return new Date(cleaned);
  }

  // Relative days
  if (cleaned === 'today' || cleaned === 'tod') {
    return today;
  }
  if (cleaned === 'tomorrow' || cleaned === 'tmr' || cleaned === 'tom') {
    return addDays(today, 1);
  }
  if (cleaned === 'yesterday') {
    return addDays(today, -1);
  }

  // Days of week
  const dayMatch = cleaned.match(/^(next|this|last)?\s*(mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday)$/);
  if (dayMatch) {
    const [, modifier, day] = dayMatch;
    return parseDayOfWeek(day, modifier || 'next', today);
  }

  // "in X days/weeks/months/years"
  const inMatch = cleaned.match(/^in\s+(\d+)\s+(day|days|week|weeks|month|months|year|years)$/);
  if (inMatch) {
    const [, amount, unit] = inMatch;
    const num = parseInt(amount, 10);

    if (unit.startsWith('day')) return addDays(today, num);
    if (unit.startsWith('week')) return addWeeks(today, num);
    if (unit.startsWith('month')) return addMonths(today, num);
    if (unit.startsWith('year')) return addYears(today, num);
  }

  // "X days/weeks from now"
  const fromNowMatch = cleaned.match(/^(\d+)\s+(day|days|week|weeks|month|months|year|years)\s+from\s+now$/);
  if (fromNowMatch) {
    const [, amount, unit] = fromNowMatch;
    const num = parseInt(amount, 10);

    if (unit.startsWith('day')) return addDays(today, num);
    if (unit.startsWith('week')) return addWeeks(today, num);
    if (unit.startsWith('month')) return addMonths(today, num);
    if (unit.startsWith('year')) return addYears(today, num);
  }

  return null;
};

/**
 * Parse day of week with modifier
 */
const parseDayOfWeek = (day: string, modifier: string, baseDate: Date): Date => {
  const dayMap: Record<string, number> = {
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tuesday: 2,
    wed: 3, wednesday: 3,
    thu: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6,
  };

  const targetDay = dayMap[day];
  const currentDay = getDay(baseDate);

  if (modifier === 'next') {
    // Next occurrence of this day (could be today if it's that day)
    if (targetDay === currentDay) {
      return addWeeks(baseDate, 1);
    }
    return setDay(baseDate, targetDay, { weekStartsOn: 0 });
  } else if (modifier === 'last') {
    // Previous occurrence
    if (targetDay === currentDay) {
      return addWeeks(baseDate, -1);
    }
    const result = setDay(baseDate, targetDay, { weekStartsOn: 0 });
    return result > baseDate ? addWeeks(result, -1) : result;
  } else {
    // "this" - current week's occurrence
    return setDay(baseDate, targetDay, { weekStartsOn: 0 });
  }
};

// ============================================================================
// RECURRENCE PARSING
// ============================================================================

/**
 * Parse natural language recurrence patterns
 * Examples: "every day", "every weekday", "every monday", "every 2 weeks", "every month"
 */
export const parseRecurrence = (input: string): RecurrencePattern | null => {
  const cleaned = input.toLowerCase().trim();
  const today = new Date();

  // Every day
  if (cleaned === 'every day' || cleaned === 'daily') {
    return {
      type: RecurrenceType.DAILY,
      interval: 1,
      naturalLanguage: cleaned,
    };
  }

  // Every X days
  const everyDaysMatch = cleaned.match(/^every\s+(\d+)\s+days?$/);
  if (everyDaysMatch) {
    return {
      type: RecurrenceType.DAILY,
      interval: parseInt(everyDaysMatch[1], 10),
      naturalLanguage: cleaned,
    };
  }

  // Every weekday (Mon-Fri)
  if (cleaned === 'every weekday' || cleaned === 'weekdays') {
    return {
      type: RecurrenceType.WEEKLY,
      interval: 1,
      daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
      naturalLanguage: cleaned,
    };
  }

  // Every weekend
  if (cleaned === 'every weekend' || cleaned === 'weekends') {
    return {
      type: RecurrenceType.WEEKLY,
      interval: 1,
      daysOfWeek: [0, 6], // Sun, Sat
      naturalLanguage: cleaned,
    };
  }

  // Every [day of week]
  const everyDayMatch = cleaned.match(/^every\s+(mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday)$/);
  if (everyDayMatch) {
    const dayMap: Record<string, number> = {
      sun: 0, sunday: 0,
      mon: 1, monday: 1,
      tue: 2, tuesday: 2,
      wed: 3, wednesday: 3,
      thu: 4, thursday: 4,
      fri: 5, friday: 5,
      sat: 6, saturday: 6,
    };

    return {
      type: RecurrenceType.WEEKLY,
      interval: 1,
      daysOfWeek: [dayMap[everyDayMatch[1]]],
      naturalLanguage: cleaned,
    };
  }

  // Every X weeks
  const everyWeeksMatch = cleaned.match(/^every\s+(\d+)\s+weeks?$/);
  if (everyWeeksMatch) {
    return {
      type: RecurrenceType.WEEKLY,
      interval: parseInt(everyWeeksMatch[1], 10),
      daysOfWeek: [getDay(today)], // Current day of week
      naturalLanguage: cleaned,
    };
  }

  // Every X weeks on [day]
  const everyWeeksOnMatch = cleaned.match(/^every\s+(\d+)\s+weeks?\s+on\s+(mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday)$/);
  if (everyWeeksOnMatch) {
    const dayMap: Record<string, number> = {
      sun: 0, sunday: 0,
      mon: 1, monday: 1,
      tue: 2, tuesday: 2,
      wed: 3, wednesday: 3,
      thu: 4, thursday: 4,
      fri: 5, friday: 5,
      sat: 6, saturday: 6,
    };

    return {
      type: RecurrenceType.WEEKLY,
      interval: parseInt(everyWeeksOnMatch[1], 10),
      daysOfWeek: [dayMap[everyWeeksOnMatch[2]]],
      naturalLanguage: cleaned,
    };
  }

  // Every month
  if (cleaned === 'every month' || cleaned === 'monthly') {
    return {
      type: RecurrenceType.MONTHLY,
      interval: 1,
      dayOfMonth: today.getDate(),
      naturalLanguage: cleaned,
    };
  }

  // Every X months
  const everyMonthsMatch = cleaned.match(/^every\s+(\d+)\s+months?$/);
  if (everyMonthsMatch) {
    return {
      type: RecurrenceType.MONTHLY,
      interval: parseInt(everyMonthsMatch[1], 10),
      dayOfMonth: today.getDate(),
      naturalLanguage: cleaned,
    };
  }

  // First/last [day] of month
  const monthlyDayMatch = cleaned.match(/^(first|last)\s+(mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday)\s+of\s+(every\s+)?month$/);
  if (monthlyDayMatch) {
    const dayMap: Record<string, number> = {
      sun: 0, sunday: 0,
      mon: 1, monday: 1,
      tue: 2, tuesday: 2,
      wed: 3, wednesday: 3,
      thu: 4, thursday: 4,
      fri: 5, friday: 5,
      sat: 6, saturday: 6,
    };

    const day = dayMap[monthlyDayMatch[2]];

    // Store as custom pattern with metadata (position stored in naturalLanguage)
    return {
      type: RecurrenceType.CUSTOM,
      interval: 1,
      daysOfWeek: [day],
      naturalLanguage: cleaned,
    };
  }

  // Every year
  if (cleaned === 'every year' || cleaned === 'yearly' || cleaned === 'annually') {
    return {
      type: RecurrenceType.YEARLY,
      interval: 1,
      dayOfMonth: today.getDate(),
      monthOfYear: today.getMonth() + 1,
      naturalLanguage: cleaned,
    };
  }

  return null;
};

// ============================================================================
// COMBINED PARSING (DATE + RECURRENCE)
// ============================================================================

/**
 * Parse combined input that might include both date and recurrence
 * Example: "every monday starting next week"
 */
export const parseTaskDateInput = (input: string): {
  dueDate?: Date;
  recurrence?: RecurrencePattern;
} => {
  const cleaned = input.toLowerCase().trim();

  // Check for recurrence patterns first
  const recurrence = parseRecurrence(cleaned);
  if (recurrence) {
    return { recurrence };
  }

  // Check for simple date
  const date = parseNaturalDate(cleaned);
  if (date) {
    return { dueDate: date };
  }

  return {};
};

// ============================================================================
// NEXT OCCURRENCE CALCULATION
// ============================================================================

/**
 * Calculate the next occurrence of a recurring task
 */
export const getNextOccurrence = (
  pattern: RecurrencePattern,
  fromDate: Date = new Date()
): Date => {
  const base = startOfDay(fromDate);

  switch (pattern.type) {
    case RecurrenceType.DAILY:
      return addDays(base, pattern.interval);

    case RecurrenceType.WEEKLY:
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // Find next occurrence of specified days
        const currentDay = getDay(base);
        const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);

        // Find next day in current week
        const nextDay = sortedDays.find((d) => d > currentDay);
        if (nextDay !== undefined) {
          return setDay(base, nextDay, { weekStartsOn: 0 });
        }

        // Move to next week and use first day
        return setDay(addWeeks(base, pattern.interval), sortedDays[0], {
          weekStartsOn: 0,
        });
      }
      return addWeeks(base, pattern.interval);

    case RecurrenceType.MONTHLY:
      const nextMonth = addMonths(base, pattern.interval);
      if (pattern.dayOfMonth) {
        nextMonth.setDate(pattern.dayOfMonth);
      }
      return nextMonth;

    case RecurrenceType.YEARLY:
      const nextYear = addYears(base, pattern.interval);
      if (pattern.monthOfYear) {
        nextYear.setMonth(pattern.monthOfYear - 1);
      }
      if (pattern.dayOfMonth) {
        nextYear.setDate(pattern.dayOfMonth);
      }
      return nextYear;

    case RecurrenceType.CUSTOM:
      // Handle complex patterns
      return addDays(base, 1); // Fallback

    default:
      return addDays(base, 1);
  }
};

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format a recurrence pattern back to natural language
 */
export const formatRecurrence = (pattern: RecurrencePattern): string => {
  return pattern.naturalLanguage;
};

/**
 * Format a date for display
 */
export const formatDateForDisplay = (date: Date): string => {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diff = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 0 && diff <= 7) return format(date, 'EEEE'); // "Monday"

  return format(date, 'MMM d'); // "Jan 15"
};
