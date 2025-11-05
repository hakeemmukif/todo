import { useState, useRef } from 'react';
import { Clock, Repeat, Calendar as CalendarIcon, Sun, Gamepad2, CalendarRange } from 'lucide-react';
import { Calendar } from './Calendar';
import { getQuickDateOptions } from '../utils/datePickerUtils';
import { useClickOutside, useEscapeKey } from '../hooks/useClickOutside';

interface DatePickerDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
  onSelectDate: (date: Date) => void;
  onOpenTimeSettings?: () => void;
  onOpenRepeatSettings?: () => void;
  position?: 'bottom-left' | 'bottom-right';
}

export const DatePickerDropdown = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  onOpenTimeSettings,
  onOpenRepeatSettings,
  position = 'bottom-left',
}: DatePickerDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showTimeInput, setShowTimeInput] = useState(false);

  useClickOutside(dropdownRef, onClose);
  useEscapeKey(onClose);

  if (!isOpen) return null;

  const quickDateOptions = getQuickDateOptions();

  const handleQuickDateClick = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  const handleCalendarDateSelect = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  const handleTimeClick = () => {
    setShowTimeInput(!showTimeInput);
    if (onOpenTimeSettings) {
      onOpenTimeSettings();
    }
  };

  const handleRepeatClick = () => {
    if (onOpenRepeatSettings) {
      onOpenRepeatSettings();
    }
  };

  const positionClasses =
    position === 'bottom-left' ? 'left-0' : 'right-0';

  const getQuickDateIcon = (index: number) => {
    const iconClass = "opacity-60";
    switch (index) {
      case 0: // Today
        return <CalendarIcon size={16} className={iconClass} />;
      case 1: // Tomorrow
        return <Sun size={16} className={iconClass} />;
      case 2: // This weekend
        return <Gamepad2 size={16} className={iconClass} />;
      case 3: // Next week
        return <CalendarRange size={16} className={iconClass} />;
      default:
        return <CalendarIcon size={16} className={iconClass} />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`absolute ${positionClasses} top-full mt-1 z-50 w-80 bg-minimal-bg dark:bg-[#0A0A0A] border border-minimal-border dark:border-[#2A2A2A] shadow-sm`}
    >
      {/* Quick Date Options */}
      <div className="p-2 border-b border-minimal-border dark:border-[#2A2A2A]">
        {quickDateOptions.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleQuickDateClick(option.date)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-left text-minimal-text dark:text-[#FAFAFA]"
          >
            <span className="flex items-center gap-2">
              {getQuickDateIcon(index)}
              <span>{option.label}</span>
            </span>
            <span className="text-xs opacity-60">{option.sublabel}</span>
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="p-3 border-b border-minimal-border dark:border-[#2A2A2A]">
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={handleCalendarDateSelect}
        />
      </div>

      {/* Time & Repeat Options */}
      <div className="p-2 flex gap-2">
        <button
          type="button"
          onClick={handleTimeClick}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
        >
          <Clock size={14} />
          <span>Time</span>
        </button>
        <button
          type="button"
          onClick={handleRepeatClick}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
        >
          <Repeat size={14} />
          <span>Repeat</span>
        </button>
      </div>

      {/* Time Input (conditionally shown) */}
      {showTimeInput && (
        <div className="p-3 border-t border-minimal-border dark:border-[#2A2A2A]">
          <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
            Time
          </label>
          <input
            type="time"
            className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
