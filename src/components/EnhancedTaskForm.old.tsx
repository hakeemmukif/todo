import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Priority, TaskStatus, PRIORITY_ICONS, Reminder } from '../types/task';
import { parseNaturalDate, parseRecurrence, formatDateForDisplay } from '../utils/naturalLanguage';
import { formatDate } from '../utils/dateUtils';
import { calculateReminderDatetime } from '../utils/reminderScheduler';
import { DatePickerDropdown } from './DatePickerDropdown';

interface EnhancedTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string; // If provided, we're editing
}

interface ReminderInput {
  type: 'absolute' | 'relative';
  absoluteDatetimeInput: string;
  relativeDays: number;
}

export const EnhancedTaskForm = ({ isOpen, onClose, taskId }: EnhancedTaskFormProps) => {
  const { tasks, projects, labels, addTask, updateTask, addReminder, deleteReminder } = useTaskStore();

  const existingTask = taskId ? tasks.find((t) => t.id === taskId) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [parsedDueDate, setParsedDueDate] = useState<Date | null>(null);
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState(Priority.P4);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [recurrenceInput, setRecurrenceInput] = useState('');
  const [parsedRecurrence, setParsedRecurrence] = useState<any>(null);
  const [reminderInput, setReminderInput] = useState<ReminderInput>({
    type: 'relative',
    absoluteDatetimeInput: '',
    relativeDays: 1,
  });
  const [tempReminders, setTempReminders] = useState<Reminder[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateInputRef = useRef<HTMLDivElement>(null);

  // Load existing task data when editing
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setProjectId(existingTask.projectId);
      setPriority(existingTask.priority);
      setSelectedLabels(existingTask.labelIds || []);

      if (existingTask.dueDate) {
        setDueDateInput(existingTask.dueDate);
        // Try to parse the stored date
        try {
          const date = new Date(existingTask.dueDate);
          setParsedDueDate(date);
        } catch (e) {
          setParsedDueDate(null);
        }
      }

      if (existingTask.recurrence) {
        setRecurrenceInput(existingTask.recurrence.naturalLanguage);
        setParsedRecurrence(existingTask.recurrence);
      }

      setTempReminders(existingTask.reminders || []);
    } else {
      // Reset for new task
      setTitle('');
      setDescription('');
      setDueDateInput('');
      setParsedDueDate(null);
      setProjectId(projects[0]?.id || '');
      setPriority(Priority.P4);
      setSelectedLabels([]);
      setRecurrenceInput('');
      setParsedRecurrence(null);
      setTempReminders([]);
    }
  }, [existingTask, isOpen, projects]);

  // Parse due date as user types
  useEffect(() => {
    if (dueDateInput.trim()) {
      const date = parseNaturalDate(dueDateInput.trim());
      setParsedDueDate(date);
    } else {
      setParsedDueDate(null);
    }
  }, [dueDateInput]);

  // Parse recurrence as user types
  useEffect(() => {
    if (recurrenceInput.trim()) {
      const pattern = parseRecurrence(recurrenceInput.trim());
      setParsedRecurrence(pattern);
    } else {
      setParsedRecurrence(null);
    }
  }, [recurrenceInput]);

  const handleLabelToggle = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleAddReminder = () => {
    const datetime = calculateReminderDatetime(
      reminderInput.type,
      reminderInput.absoluteDatetimeInput || null,
      reminderInput.relativeDays,
      parsedDueDate ? formatDate(parsedDueDate) : null
    );

    if (datetime) {
      const newReminder: Reminder = {
        id: crypto.randomUUID(),
        taskId: taskId || 'temp',
        datetime,
        type: reminderInput.type,
        relativeDays: reminderInput.type === 'relative' ? reminderInput.relativeDays : undefined,
        isRecurring: false,
        createdAt: new Date().toISOString(),
      };

      setTempReminders([...tempReminders, newReminder]);

      // Reset reminder input
      setReminderInput({
        type: 'relative',
        absoluteDatetimeInput: '',
        relativeDays: 1,
      });
    }
  };

  const handleDeleteReminder = (reminderId: string) => {
    setTempReminders(tempReminders.filter((r) => r.id !== reminderId));
  };

  const handleDateSelect = (date: Date) => {
    setParsedDueDate(date);
    setDueDateInput(formatDate(date));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !projectId) return;

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      projectId,
      status: TaskStatus.TODO,
      priority,
      labelIds: selectedLabels.length > 0 ? selectedLabels : [],
      dueDate: parsedDueDate ? formatDate(parsedDueDate) : undefined,
      recurrence: parsedRecurrence || undefined,
    };

    if (taskId) {
      updateTask(taskId, taskData);

      // Update reminders for existing task
      // Remove old reminders and add new ones
      const existingReminderIds = existingTask?.reminders.map((r) => r.id) || [];
      existingReminderIds.forEach((id) => deleteReminder(taskId, id));
      tempReminders.forEach((reminder) => {
        addReminder(taskId, {
          datetime: reminder.datetime,
          type: reminder.type,
          relativeDays: reminder.relativeDays,
          isRecurring: reminder.isRecurring,
        });
      });
    } else {
      addTask(taskData);
      // For new tasks, reminders will be added after task is created
      // This is a limitation - we'd need to get the new task ID back from addTask
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-minimal-bg dark:bg-[#0A0A0A] border border-minimal-border dark:border-[#2A2A2A] w-full max-w-2xl p-5">
        <h2 className="text-lg font-medium mb-4 text-minimal-text dark:text-[#FAFAFA]">
          {taskId ? 'Edit Task' : 'Add Task'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Task Title */}
          <div className="mb-3">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">Title*</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
              className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA]"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={2}
              className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm resize-none text-minimal-text dark:text-[#FAFAFA]"
            />
          </div>

          {/* Due Date with NLP and Visual Picker */}
          <div className="mb-3" ref={dateInputRef}>
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
              Due Date
              {parsedDueDate && (
                <span className="ml-2 text-minimal-text dark:text-[#FAFAFA]">
                  → {formatDateForDisplay(parsedDueDate)}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                placeholder="Today, tomorrow, next Monday, in 3 days..."
                className="w-full px-3 py-2 pr-10 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA]"
              />
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
                aria-label="Open date picker"
              >
                <CalendarIcon size={16} />
              </button>

              <DatePickerDropdown
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                selectedDate={parsedDueDate}
                onSelectDate={handleDateSelect}
                position="bottom-left"
              />
            </div>
            <div className="mt-1 text-xs opacity-40 text-minimal-text dark:text-[#FAFAFA]">
              Examples: today, tomorrow, next Friday, in 2 weeks, 2024-12-25
            </div>
          </div>

          {/* Recurrence with NLP */}
          <div className="mb-3">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
              Recurrence
              {parsedRecurrence && (
                <span className="ml-2 text-minimal-text dark:text-[#FAFAFA]">
                  ✓ pattern recognized
                </span>
              )}
            </label>
            <input
              type="text"
              value={recurrenceInput}
              onChange={(e) => setRecurrenceInput(e.target.value)}
              placeholder="Every day, every weekday, every 2 weeks..."
              className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA]"
            />
            <div className="mt-1 text-xs opacity-40 text-minimal-text dark:text-[#FAFAFA]">
              Examples: every day, every weekday, every Monday, every 2 weeks
            </div>
          </div>

          {/* Project Selector */}
          <div className="mb-3">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">Project*</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA] appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                paddingRight: '2.5rem'
              }}
            >
              {projects.filter(p => !p.isArchived).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.icon} {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Selector */}
          <div className="mb-3">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">Priority</label>
            <div className="flex gap-2">
              {[Priority.P1, Priority.P2, Priority.P3, Priority.P4].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 px-3 py-2 border text-sm transition-all text-minimal-text dark:text-[#FAFAFA] ${
                    priority === p
                      ? 'border-minimal-text dark:border-[#FAFAFA] bg-minimal-hover dark:bg-[#1A1A1A]'
                      : 'border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A]'
                  }`}
                >
                  {PRIORITY_ICONS[p]} {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Labels Selector */}
          {labels.length > 0 && (
            <div className="mb-3">
              <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
                labels ({selectedLabels.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => handleLabelToggle(label.id)}
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
            </div>
          )}

          {/* Reminders */}
          <div className="mb-3">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
              Reminders ({tempReminders.length})
            </label>

            {/* Existing Reminders */}
            {tempReminders.length > 0 && (
              <div className="mb-3 space-y-2">
                {tempReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] text-xs text-minimal-text dark:text-[#FAFAFA]"
                  >
                    <span>
                      {reminder.type === 'relative'
                        ? `${reminder.relativeDays} day${reminder.relativeDays !== 1 ? 's' : ''} before due date`
                        : new Date(reminder.datetime).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="text-xs opacity-60 hover:opacity-100 text-minimal-text dark:text-[#FAFAFA]"
                    >
                      remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Reminder */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <select
                  value={reminderInput.type}
                  onChange={(e) =>
                    setReminderInput({ ...reminderInput, type: e.target.value as 'absolute' | 'relative' })
                  }
                  className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-minimal-bg dark:bg-[#0A0A0A] text-sm mb-2 text-minimal-text dark:text-[#FAFAFA] appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="relative">Relative (Days Before Due Date)</option>
                  <option value="absolute">Absolute (Specific Date/Time)</option>
                </select>

                {reminderInput.type === 'relative' ? (
                  <input
                    type="number"
                    min="0"
                    value={reminderInput.relativeDays}
                    onChange={(e) =>
                      setReminderInput({ ...reminderInput, relativeDays: parseInt(e.target.value, 10) })
                    }
                    placeholder="days before"
                    className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA]"
                  />
                ) : (
                  <input
                    type="datetime-local"
                    value={reminderInput.absoluteDatetimeInput}
                    onChange={(e) =>
                      setReminderInput({ ...reminderInput, absoluteDatetimeInput: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA]"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={handleAddReminder}
                className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
              >
                Add Reminder
              </button>
            </div>
            <div className="mt-1 text-xs opacity-40 text-minimal-text dark:text-[#FAFAFA]">
              {reminderInput.type === 'relative'
                ? 'reminder will be shown X days before the task is due'
                : 'reminder will be shown at the specific date and time'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-minimal-border dark:border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !projectId}
              className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-minimal-text dark:text-[#FAFAFA]"
            >
              {taskId ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
