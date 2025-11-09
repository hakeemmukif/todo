import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTaskStore } from '../store/taskStore';
import { Priority, TaskStatus } from '../types/task';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

export const TaskDetailModal = ({ isOpen, onClose, taskId }: TaskDetailModalProps) => {
  const { tasks, projects, labels, updateTask, deleteTask } = useTaskStore();

  const task = tasks.find(t => t.id === taskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.P4);
  const [projectId, setProjectId] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
      setPriority(task.priority);
      setProjectId(task.projectId);
      setSelectedLabels(task.labelIds || []);
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!task || !title.trim()) return;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority,
      projectId,
      labelIds: selectedLabels,
      status,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!task) return;

    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  if (!isOpen || !task) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-minimal-bg dark:bg-[#0A0A0A] border border-minimal-border dark:border-[#2A2A2A]
                   w-full max-w-lg p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-minimal-text dark:text-[#FAFAFA]">
            Edit Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="opacity-60 hover:opacity-100 text-minimal-text dark:text-[#FAFAFA] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Task Title */}
            <div>
              <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
                Task Name*
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task name"
                className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA] placeholder:opacity-40"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                rows={3}
                className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA] placeholder:opacity-40 resize-none"
              />
            </div>

            {/* Due Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs opacity-60 mb-1.5 text-minimal-text dark:text-[#FAFAFA]">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA]"
                />
              </div>
              <div>
                <label className="block text-xs opacity-60 mb-1.5 text-minimal-text dark:text-[#FAFAFA]">
                  Due Time
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA]"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs opacity-60 mb-1.5 text-minimal-text dark:text-[#FAFAFA]">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[Priority.P1, Priority.P2, Priority.P3, Priority.P4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-2 py-1.5 text-xs border transition-colors ${
                      priority === p
                        ? 'border-minimal-text dark:border-[#FAFAFA] bg-minimal-hover dark:bg-[#2A2A2A]'
                        : 'border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A]'
                    } text-minimal-text dark:text-[#FAFAFA]`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Project & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs opacity-60 mb-1.5 text-minimal-text dark:text-[#FAFAFA]">
                  Project
                </label>
                <select
                  value={projectId || ''}
                  onChange={(e) => setProjectId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA] appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Inbox</option>
                  {projects.filter(p => !p.isArchived).map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs opacity-60 mb-1.5 text-minimal-text dark:text-[#FAFAFA]">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA] appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value={TaskStatus.TODO}>To Do</option>
                  <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TaskStatus.DONE}>Done</option>
                </select>
              </div>
            </div>

            {/* Labels */}
            {labels.length > 0 && (
              <div>
                <label className="block text-xs opacity-60 mb-1.5 text-minimal-text dark:text-[#FAFAFA]">
                  Labels
                </label>
                <div className="flex flex-wrap gap-2">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={`px-2 py-1 text-xs border transition-colors ${
                        selectedLabels.includes(label.id)
                          ? 'border-minimal-text dark:border-[#FAFAFA] bg-minimal-hover dark:bg-[#2A2A2A]'
                          : 'border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A]'
                      } text-minimal-text dark:text-[#FAFAFA]`}
                    >
                      @{label.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-minimal-border dark:border-[#2A2A2A] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-xs border border-red-500 hover:bg-red-500 hover:text-white transition-colors text-red-500"
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-3 py-2 text-xs border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-minimal-text dark:text-[#FAFAFA]"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
