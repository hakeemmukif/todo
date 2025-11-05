import { TaskFormField } from './TaskFormField';

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const DescriptionInput = ({
  value,
  onChange,
  placeholder = 'Add details...',
  rows = 3,
}: DescriptionInputProps) => {
  return (
    <TaskFormField label="Description">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        aria-label="Task description"
        className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A]
                   focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA]
                   bg-transparent text-sm resize-none text-minimal-text dark:text-[#FAFAFA]"
      />
    </TaskFormField>
  );
};
