import { Priority } from '../../types/task';
import { TaskFormField } from './TaskFormField';
import { Flag } from 'lucide-react';
import { useState } from 'react';

interface PriorityDropdownProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  showLabel?: boolean;
}

// Todoist-style priority config with lucide-react Flag icons
const priorityConfig = {
  [Priority.P1]: { label: 'Priority 1', color: '#d1453b' }, // Red
  [Priority.P2]: { label: 'Priority 2', color: '#eb8909' }, // Orange
  [Priority.P3]: { label: 'Priority 3', color: '#246fe0' }, // Blue
  [Priority.P4]: { label: 'Priority 4', color: '#6c757d' }, // Gray
};

const priorities = [Priority.P1, Priority.P2, Priority.P3, Priority.P4];

export const PriorityDropdown = ({
  value,
  onChange,
  showLabel = true
}: PriorityDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedConfig = priorityConfig[value];

  return (
    <TaskFormField label={showLabel ? "Priority" : undefined}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A]
                     focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA]
                     bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA]
                     cursor-pointer flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Flag size={14} color={selectedConfig.color} fill={selectedConfig.color} />
            <span style={{ color: selectedConfig.color }}>{selectedConfig.label}</span>
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className="opacity-60"
          >
            <path fill={selectedConfig.color} d="M6 9L1 4h10z" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-minimal-bg dark:bg-[#0A0A0A] border border-minimal-border dark:border-[#2A2A2A] shadow-lg">
            {priorities.map((p) => {
              const config = priorityConfig[p];
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    onChange(p);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors ${
                    value === p ? 'bg-minimal-hover dark:bg-[#1A1A1A]' : ''
                  }`}
                >
                  <Flag size={14} color={config.color} fill={config.color} />
                  <span style={{ color: config.color }}>{config.label}</span>
                  {value === p && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </TaskFormField>
  );
};
