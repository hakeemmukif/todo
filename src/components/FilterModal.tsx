import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTaskStore } from '../store/taskStore';
import { DEFAULT_COLORS, Priority } from '../types/task';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterId?: string;
}

export const FilterModal = ({ isOpen, onClose, filterId }: FilterModalProps) => {
  const { filters, projects, labels, addFilter, updateFilter } = useTaskStore();

  const existingFilter = filterId ? filters.find((f) => f.id === filterId) : null;

  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [query, setQuery] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Query builder state
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [labelFilter, setLabelFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [dueDateFilter, setDueDateFilter] = useState<string>('');

  useEffect(() => {
    if (existingFilter) {
      setName(existingFilter.name);
      setColor(existingFilter.color);
      setQuery(existingFilter.query);
      setIsFavorite(existingFilter.isFavorite);
    } else {
      // Reset for new filter
      setName('');
      setColor(DEFAULT_COLORS[0]);
      setQuery('');
      setIsFavorite(false);
      setProjectFilter('');
      setLabelFilter('');
      setPriorityFilter('');
      setDueDateFilter('');
    }
  }, [existingFilter, isOpen]);

  // Build query from filters
  useEffect(() => {
    const queryParts: string[] = [];

    if (projectFilter) {
      queryParts.push(`project:${projectFilter}`);
    }
    if (labelFilter) {
      queryParts.push(`label:${labelFilter}`);
    }
    if (priorityFilter) {
      queryParts.push(`priority:${priorityFilter}`);
    }
    if (dueDateFilter) {
      queryParts.push(`due:${dueDateFilter}`);
    }

    setQuery(queryParts.join(' & '));
  }, [projectFilter, labelFilter, priorityFilter, dueDateFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !query.trim()) return;

    if (filterId) {
      updateFilter(filterId, {
        name: name.trim(),
        query: query.trim(),
        color,
        isFavorite,
      });
    } else {
      addFilter({
        name: name.trim(),
        query: query.trim(),
        color,
        isFavorite,
        order: filters.length,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-minimal-bg dark:bg-[#1A1A1A] border border-minimal-border dark:border-[#2A2A2A] w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-medium mb-6 text-minimal-text dark:text-[#FAFAFA]">
          {filterId ? 'Edit Filter' : 'Add Filter'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Filter Name */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">Name*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Filter name"
              className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA] placeholder:text-minimal-text placeholder:dark:text-[#FAFAFA] placeholder:opacity-40"
              autoFocus
            />
          </div>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">Color</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 border-2 transition-all ${
                    color === c ? 'border-minimal-text scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Query Builder */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">Query Builder</label>

            {/* Project Filter */}
            <div className="mb-3">
              <label className="block text-xs opacity-40 mb-1 text-minimal-text dark:text-[#FAFAFA]">Project</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA] appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Any project</option>
                {projects.filter(p => !p.isArchived).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.icon} {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Label Filter */}
            {labels.length > 0 && (
              <div className="mb-3">
                <label className="block text-xs opacity-40 mb-1 text-minimal-text dark:text-[#FAFAFA]">Label</label>
                <select
                  value={labelFilter}
                  onChange={(e) => setLabelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA] appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Any label</option>
                  {labels.map((label) => (
                    <option key={label.id} value={label.id}>
                      @{label.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Priority Filter */}
            <div className="mb-3">
              <label className="block text-xs opacity-40 mb-1 text-minimal-text dark:text-[#FAFAFA]">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Priority | '')}
                className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA] appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Any priority</option>
                <option value={Priority.P1}>P1 (Urgent)</option>
                <option value={Priority.P2}>P2 (High)</option>
                <option value={Priority.P3}>P3 (Medium)</option>
                <option value={Priority.P4}>P4 (Low)</option>
              </select>
            </div>

            {/* Due Date Filter */}
            <div className="mb-3">
              <label className="block text-xs opacity-40 mb-1 text-minimal-text dark:text-[#FAFAFA]">Due Date</label>
              <select
                value={dueDateFilter}
                onChange={(e) => setDueDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA] appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Any time</option>
                <option value="today">Today</option>
                <option value="overdue">Overdue</option>
                <option value="this_week">This week</option>
                <option value="no_date">No date</option>
              </select>
            </div>
          </div>

          {/* Generated Query */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">Generated Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="project:xyz & label:abc & priority:p1"
              className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA] placeholder:text-minimal-text placeholder:dark:text-[#FAFAFA] placeholder:opacity-40"
            />
            <div className="mt-1 text-xs opacity-40 text-minimal-text dark:text-[#FAFAFA]">
              you can also manually edit the query using: project:id, label:id, priority:p1-p4, due:today|overdue|this_week|no_date
            </div>
          </div>

          {/* Favorite Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-minimal-text dark:text-[#FAFAFA]">Add to Favorites</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A] transition-colors text-minimal-text dark:text-[#FAFAFA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !query.trim()}
              className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-minimal-text dark:text-[#FAFAFA]"
            >
              {filterId ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
