import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Priority, TaskStatus } from '../types/task';
import { TitleInput } from './forms/TitleInput';
import { DescriptionInput } from './forms/DescriptionInput';
import { DateInput } from './forms/DateInput';
import { ProjectSelector } from './forms/ProjectSelector';
import { PriorityDropdown } from './forms/PriorityDropdown';
import { LabelSelector } from './forms/LabelSelector';
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
  const { tasks, projects, labels, addTask, updateTask } = useTaskStore();
  const existingTask = taskId ? tasks.find((t) => t.id === taskId) : null;

  // Core fields (always visible)
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');

  // Date management with custom hook
  const dateInput = useDateInput(existingTask?.dueDate);

  // Advanced fields (in "More options")
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(Priority.P4);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const reminderInput = useReminderInput();

  // Load existing task data when editing
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setProjectId(existingTask.projectId);
      setPriority(existingTask.priority);
      setSelectedLabels(existingTask.labelIds || []);

      if (existingTask.dueDate) {
        // Convert ISO date to human-readable format like "Today", "Tomorrow", "Friday"
        const date = new Date(existingTask.dueDate);
        dateInput.setInput(formatDateForDisplay(date));
      }

      // Auto-expand "More options" if task has advanced fields set
      if (
        existingTask.description ||
        (existingTask.labelIds && existingTask.labelIds.length > 0)
      ) {
        setShowMoreOptions(true);
      }
    } else {
      // Reset for new task
      setTitle('');
      setDescription('');
      // Default to first project, or 'inbox' if no projects
      setProjectId(projects[0]?.id || 'inbox');
      setPriority(Priority.P4);
      setSelectedLabels([]);
      dateInput.clearDate();
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

    if (!title.trim() || !projectId) return;

    // Use first project if 'inbox' is selected but no actual inbox project exists
    const finalProjectId = projectId === 'inbox' && !projects.some(p => p.id === 'inbox')
      ? projects[0]?.id || projectId
      : projectId;

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      projectId: finalProjectId,
      status: TaskStatus.TODO,
      priority,
      labelIds: selectedLabels,
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
    selectedLabels.length > 0 ? `${selectedLabels.length} labels` : null,
    reminderInput.hasReminder ? 'Reminder' : null,
  ].filter(Boolean);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-minimal-bg dark:bg-[#0A0A0A] border border-minimal-border dark:border-[#2A2A2A]
                   w-full max-w-lg p-4 shadow-2xl"
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

          <div className="flex gap-2 mb-2">
            {/* Due Date - 40% width */}
            <div className="flex-[4]">
              <DateInput
                value={dateInput.input}
                parsedDate={dateInput.parsedDate}
                onChange={dateInput.setInput}
                onDateSelect={dateInput.handleDateSelect}
              />
            </div>

            {/* Project - 30% width */}
            <div className="flex-[3]">
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

            {/* Priority - 30% width */}
            <div className="flex-[3]">
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

              <LabelSelector
                selectedLabels={selectedLabels}
                onChange={setSelectedLabels}
                labels={labels}
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
