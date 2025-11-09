import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Priority, TaskStatus } from '../types/task';
import { TitleInput } from './forms/TitleInput';
import { DescriptionInput } from './forms/DescriptionInput';
import { DateInput } from './forms/DateInput';
import { ProjectSelector } from './forms/ProjectSelector';
import { PriorityDropdown } from './forms/PriorityDropdown';
import { ReminderManager } from './forms/ReminderManager';
import { useDateInput } from '../hooks/useDateInput';
import { useReminderInput } from '../hooks/useReminderInput';
import { formatDateForDisplay } from '../utils/naturalLanguage';

interface EnhancedTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
}

export const EnhancedTaskForm = ({ isOpen, onClose, taskId }: EnhancedTaskFormProps) => {
  const { tasks, projects, addTask, updateTask, viewState } = useTaskStore();
  const existingTask = taskId ? tasks.find((t) => t.id === taskId) : null;

  // Core fields (always visible)
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);

  // Date management with custom hook
  const dateInput = useDateInput(existingTask?.dueDate);

  // Advanced fields (in "More options")
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(Priority.P4);
  const reminderInput = useReminderInput();

  // Load existing task data when editing
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setProjectId(existingTask.projectId);
      setPriority(existingTask.priority);

      if (existingTask.dueDate) {
        // Convert ISO date to human-readable format like "Today", "Tomorrow", "Friday"
        const date = new Date(existingTask.dueDate);
        dateInput.setInput(formatDateForDisplay(date));
      }

      // Auto-expand "More options" if task has advanced fields set
      if (existingTask.description) {
        setShowMoreOptions(true);
      }
    } else {
      // Reset for new task
      setTitle('');
      setDescription('');

      // Set project and date based on current view
      if (viewState.type === 'project') {
        // If viewing a project, default to that project
        setProjectId(viewState.projectId || null);
      } else {
        // Otherwise default to Inbox
        setProjectId(null);
      }

      // If viewing Today, set today's date
      if (viewState.type === 'today') {
        dateInput.setInput('Today');
      } else if (viewState.type === 'upcoming') {
        // If viewing Upcoming, set tomorrow's date
        dateInput.setInput('Tomorrow');
      } else {
        dateInput.clearDate();
      }

      setPriority(Priority.P4);
      reminderInput.reset();
      setShowMoreOptions(false);
    }
  }, [existingTask, isOpen, projects]);

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter: Submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
    // Escape: Close
    else if (e.key === 'Escape') {
      onClose();
    }
    // Cmd/Ctrl + M: Toggle more options
    else if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault();
      setShowMoreOptions(!showMoreOptions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      projectId: projectId, // Can be null for Inbox
      status: TaskStatus.TODO,
      priority,
      dueDate: dateInput.formattedDate,
    };

    if (taskId) {
      updateTask(taskId, taskData);
    } else {
      addTask(taskData);
    }

    onClose();
  };

  if (!isOpen) return null;

  // Count active advanced options for badge (only collapsed options)
  const activeOptions = [
    description ? 'Description' : null,
    reminderInput.hasReminder ? 'Reminder' : null,
  ].filter(Boolean);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-minimal-bg dark:bg-[#0A0A0A] border border-minimal-border dark:border-[#2A2A2A]
                   w-full max-w-lg p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium text-minimal-text dark:text-[#FAFAFA]">
            {taskId ? 'Edit Task' : 'Quick Add'}
          </h2>
          <button
            onClick={onClose}
            className="opacity-60 hover:opacity-100 text-minimal-text dark:text-[#FAFAFA] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Core Fields - Always Visible */}
          <TitleInput
            value={title}
            onChange={setTitle}
            error={!title.trim() ? undefined : undefined}
          />

          <div className="flex flex-col gap-2 mb-2">
            {/* Due Date - Full width */}
            <div className="w-full">
              <DateInput
                value={dateInput.input}
                parsedDate={dateInput.parsedDate}
                onChange={dateInput.setInput}
                onDateSelect={dateInput.handleDateSelect}
              />
            </div>

            {/* Project and Priority - Side by side */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
                  Project *
                </label>
                <ProjectSelector
                  value={projectId}
                  onChange={setProjectId}
                  projects={projects}
                  showLabel={false}
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
                  Priority
                </label>
                <PriorityDropdown
                  value={priority}
                  onChange={setPriority}
                  showLabel={false}
                />
              </div>
            </div>
          </div>

          {/* More Options Toggle */}
          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="w-full text-left text-sm opacity-60 hover:opacity-100 py-2 flex items-center gap-2
                       text-minimal-text dark:text-[#FAFAFA] transition-opacity"
          >
            <span>{showMoreOptions ? '⋮' : '⋯'}</span>
            <span>More options</span>
            {activeOptions.length > 0 && !showMoreOptions && (
              <span className="ml-auto text-xs opacity-60">
                {activeOptions.join(' • ')}
              </span>
            )}
          </button>

          {/* Advanced Options - Collapsible */}
          {showMoreOptions && (
            <div className="mb-3 pb-3 border-t border-b border-minimal-border dark:border-[#2A2A2A] pt-3 space-y-3">
              <DescriptionInput value={description} onChange={setDescription} />

              <ReminderManager
                value={reminderInput.preset}
                onChange={reminderInput.setPreset}
                dueDateSet={!!dateInput.parsedDate}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-3 border-t border-minimal-border dark:border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A]
                         hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors
                         text-minimal-text dark:text-[#FAFAFA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !projectId}
              className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A]
                         hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed
                         text-minimal-text dark:text-[#FAFAFA]"
            >
              {taskId ? 'Save' : 'Add'}
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="mt-2 text-xs opacity-40 text-center text-minimal-text dark:text-[#FAFAFA]">
            ⌘↵ to save • Esc to cancel • ⌘M for more options
          </div>
        </form>
      </div>
    </div>
  );
};
