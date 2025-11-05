import { Label } from '../../types/task';
import { TaskFormField } from './TaskFormField';

interface LabelSelectorProps {
  selectedLabels: string[];
  onChange: (labelIds: string[]) => void;
  labels: Label[];
}

export const LabelSelector = ({
  selectedLabels,
  onChange,
  labels,
}: LabelSelectorProps) => {
  const handleToggle = (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      onChange(selectedLabels.filter((id) => id !== labelId));
    } else {
      onChange([...selectedLabels, labelId]);
    }
  };

  if (labels.length === 0) {
    return null;
  }

  return (
    <TaskFormField label={`Labels (${selectedLabels.length} selected)`}>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Task labels"
      >
        {labels.map((label) => (
          <button
            key={label.id}
            type="button"
            onClick={() => handleToggle(label.id)}
            aria-pressed={selectedLabels.includes(label.id)}
            className={`px-3 py-1 text-xs border transition-all text-minimal-text dark:text-[#FAFAFA] ${
              selectedLabels.includes(label.id)
                ? 'border-minimal-text dark:border-[#FAFAFA] bg-minimal-hover dark:bg-[#1A1A1A]'
                : 'border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A]'
            }`}
            style={{
              borderLeftColor: label.color,
              borderLeftWidth: '3px',
            }}
          >
            @{label.name}
          </button>
        ))}
      </div>
    </TaskFormField>
  );
};
