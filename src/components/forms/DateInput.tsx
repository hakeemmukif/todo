import { useRef, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { TaskFormField } from './TaskFormField';
import { DatePickerDropdown } from '../DatePickerDropdown';
import { formatDateForDisplay } from '../../utils/naturalLanguage';

interface DateInputProps {
  value: string;
  parsedDate: Date | null;
  onChange: (value: string) => void;
  onDateSelect: (date: Date) => void;
  placeholder?: string;
}

export const DateInput = ({
  value,
  parsedDate,
  onChange,
  onDateSelect,
  placeholder = 'Today, tomorrow, next Monday...',
}: DateInputProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateInputRef = useRef<HTMLDivElement>(null);

  return (
    <TaskFormField
      label="Due Date"
      helper={parsedDate ? undefined : 'Examples: today, tomorrow, next Friday, in 2 weeks'}
    >
      <div className="relative" ref={dateInputRef}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Due date (natural language)"
          aria-describedby={parsedDate ? "parsed-date-display" : "due-date-hint"}
          className="w-full px-3 py-2 pr-10 border border-minimal-border dark:border-[#2A2A2A]
                     focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA]
                     bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA]"
        />
        {parsedDate && (
          <span
            id="parsed-date-display"
            className="absolute left-3 -bottom-5 text-xs opacity-60 text-minimal-text dark:text-[#FAFAFA]"
            aria-live="polite"
          >
            → {formatDateForDisplay(parsedDate)}
          </span>
        )}
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          aria-label="Open date picker"
          aria-expanded={showDatePicker}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-minimal-hover
                     dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
        >
          <CalendarIcon size={16} />
        </button>

        <DatePickerDropdown
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          selectedDate={parsedDate}
          onSelectDate={onDateSelect}
          position="bottom-left"
        />
      </div>
    </TaskFormField>
  );
};
