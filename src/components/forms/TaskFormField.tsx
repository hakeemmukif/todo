import { ReactNode } from 'react';

interface TaskFormFieldProps {
  label?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export const TaskFormField = ({
  label,
  required,
  helper,
  error,
  children,
  className = '',
}: TaskFormFieldProps) => {
  return (
    <div className={`mb-2 ${className}`}>
      {label && (
        <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {helper && !error && (
        <div className="mt-1 text-xs opacity-40 text-minimal-text dark:text-[#FAFAFA]">
          {helper}
        </div>
      )}
      {error && (
        <div className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
