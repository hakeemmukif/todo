import { Priority, PRIORITY_ICONS } from '../../types/task';
import { TaskFormField } from './TaskFormField';

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

const priorities = [Priority.P1, Priority.P2, Priority.P3, Priority.P4];

export const PrioritySelector = ({ value, onChange }: PrioritySelectorProps) => {
  return (
    <TaskFormField label="Priority">
      <div className="flex gap-2" role="radiogroup" aria-label="Task priority">
        {priorities.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            role="radio"
            aria-checked={value === p}
            aria-label={`Priority ${p.toUpperCase()}`}
            className={`flex-1 px-3 py-1.5 border text-sm transition-all text-minimal-text
                       dark:text-[#FAFAFA] ${
              value === p
                ? 'border-minimal-text dark:border-[#FAFAFA] bg-minimal-hover dark:bg-[#1A1A1A]'
                : 'border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A]'
            }`}
          >
            {PRIORITY_ICONS[p]} {p.toUpperCase()}
          </button>
        ))}
      </div>
    </TaskFormField>
  );
};
