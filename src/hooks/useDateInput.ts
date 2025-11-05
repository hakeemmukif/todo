import { useState, useMemo } from 'react';
import { parseNaturalDate, formatDateForDisplay } from '../utils/naturalLanguage';
import { formatDate } from '../utils/dateUtils';

export const useDateInput = (initialValue?: string) => {
  const [input, setInput] = useState(initialValue || '');

  // Memoize parsed date to avoid re-parsing on every render
  const parsedDate = useMemo(() => {
    if (!input.trim()) return null;
    return parseNaturalDate(input.trim());
  }, [input]);

  // Format parsed date to ISO string for storage
  const formattedDate = parsedDate ? formatDate(parsedDate) : undefined;

  const handleDateSelect = (date: Date) => {
    // Use human-readable format like "Today", "Tomorrow", "Friday"
    setInput(formatDateForDisplay(date));
  };

  const clearDate = () => {
    setInput('');
  };

  return {
    input,
    setInput,
    parsedDate,
    formattedDate,
    handleDateSelect,
    clearDate,
    isValid: !!parsedDate,
  };
};
