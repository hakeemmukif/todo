import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getMonthCalendarData,
  getMonthYearLabel,
  getDayNames,
  type CalendarDay,
} from '../utils/datePickerUtils';

interface CalendarProps {
  selectedDate?: Date | null;
  onSelectDate: (date: Date) => void;
  initialYear?: number;
  initialMonth?: number;
}

export const Calendar = ({
  selectedDate,
  onSelectDate,
  initialYear,
  initialMonth,
}: CalendarProps) => {
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth());

  const calendarDays = getMonthCalendarData(year, month, selectedDate);
  const dayNames = getDayNames();

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDateClick = (day: CalendarDay) => {
    onSelectDate(day.date);
  };

  return (
    <div className="w-full">
      {/* Month/Year Header with Navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm font-medium text-minimal-text dark:text-[#FAFAFA]">
          {getMonthYearLabel(year, month)}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((dayName, index) => (
          <div
            key={index}
            className="text-center text-xs opacity-60 py-1 text-minimal-text dark:text-[#FAFAFA]"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isSelected = day.isSelected;
          const isToday = day.isToday;
          const isCurrentMonth = day.isCurrentMonth;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={!isCurrentMonth}
              className={`
                aspect-square flex items-center justify-center text-xs
                transition-colors
                ${
                  isSelected
                    ? 'bg-minimal-text dark:bg-[#FAFAFA] text-minimal-bg dark:text-[#0A0A0A] font-medium'
                    : isToday
                    ? 'border border-minimal-text dark:border-[#FAFAFA] text-minimal-text dark:text-[#FAFAFA]'
                    : isCurrentMonth
                    ? 'hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] text-minimal-text dark:text-[#FAFAFA]'
                    : 'opacity-30 cursor-not-allowed text-minimal-text dark:text-[#FAFAFA]'
                }
              `}
              aria-label={`Select ${day.date.toDateString()}`}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
