import { ReminderPreset } from '../../types/task';
import { TaskFormField } from './TaskFormField';

interface ReminderManagerProps {
  value: ReminderPreset;
  onChange: (preset: ReminderPreset) => void;
  dueDateSet: boolean;
}

const reminderOptions: { value: ReminderPreset; label: string }[] = [
  { value: 'none', label: 'No reminder' },
  { value: '5min', label: '5 minutes before' },
  { value: '15min', label: '15 minutes before' },
  { value: '30min', label: '30 minutes before' },
  { value: '1hour', label: '1 hour before' },
  { value: '1day', label: '1 day before' },
];

export const ReminderManager = ({
  value,
  onChange,
  dueDateSet,
}: ReminderManagerProps) => {
  return (
    <TaskFormField
      label="Reminder"
      helper={
        !dueDateSet && value !== 'none'
          ? 'Set a due date to enable reminders'
          : undefined
      }
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ReminderPreset)}
        disabled={!dueDateSet && value !== 'none'}
        aria-label="Reminder"
        aria-describedby={!dueDateSet ? "reminder-warning" : undefined}
        className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A]
                   focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA]
                   bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA]
                   appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          paddingRight: '2.5rem'
        }}
      >
        {reminderOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </TaskFormField>
  );
};
