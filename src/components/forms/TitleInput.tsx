import { TaskFormField } from './TaskFormField';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  error?: string;
}

export const TitleInput = ({
  value,
  onChange,
  placeholder = 'Task name',
  autoFocus = true,
  error,
}: TitleInputProps) => {
  return (
    <TaskFormField label="Title" required error={error}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Task title"
        aria-required="true"
        aria-invalid={!!error}
        className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A]
                   focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA]
                   bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA]"
      />
    </TaskFormField>
  );
};
