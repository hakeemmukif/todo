import { format, getDayOfYear, startOfYear, addDays as addDaysFns, parseISO, startOfDay as startOfDayFns } from 'date-fns';

export const startOfDay = (date: Date): Date => {
  return startOfDayFns(date);
};

export { addDaysFns as addDays };

export const getDayOfYearFromDate = (date: Date): number => {
  return getDayOfYear(date);
};

export const getDateFromDayOfYear = (dayOfYear: number, year?: number): Date => {
  const targetYear = year || new Date().getFullYear();
  const yearStart = startOfYear(new Date(targetYear, 0, 1));
  return addDaysFns(yearStart, dayOfYear - 1);
};

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDateDisplay = (date: Date): string => {
  return format(date, 'EEEE, MMMM d, yyyy');
};

export const getTodayDayOfYear = (): number => {
  return getDayOfYear(new Date());
};

export const parseDate = (dateString: string): Date => {
  return parseISO(dateString);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

export const isFuture = (date: Date): boolean => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date > today;
};
