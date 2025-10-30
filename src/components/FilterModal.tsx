import { useState, useEffect } from 'react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-minimal-bg border border-minimal-border w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-medium mb-6">
          {filterId ? 'edit_filter' : 'add_filter'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Filter Name */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2">name*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="filter name"
              className="w-full px-3 py-2 border border-minimal-border focus:outline-none focus:border-minimal-text bg-transparent text-sm"
              autoFocus
            />
          </div>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2">color</label>
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
            <label className="block text-xs opacity-60 mb-2">query builder</label>

            {/* Project Filter */}
            <div className="mb-3">
              <label className="block text-xs opacity-40 mb-1">project</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-minimal-border focus:outline-none focus:border-minimal-text bg-minimal-bg text-sm"
              >
                <option value="">any project</option>
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
                <label className="block text-xs opacity-40 mb-1">label</label>
                <select
                  value={labelFilter}
                  onChange={(e) => setLabelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-minimal-border focus:outline-none focus:border-minimal-text bg-minimal-bg text-sm"
                >
                  <option value="">any label</option>
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
              <label className="block text-xs opacity-40 mb-1">priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Priority | '')}
                className="w-full px-3 py-2 border border-minimal-border focus:outline-none focus:border-minimal-text bg-minimal-bg text-sm"
              >
                <option value="">any priority</option>
                <option value={Priority.P1}>P1 (urgent)</option>
                <option value={Priority.P2}>P2 (high)</option>
                <option value={Priority.P3}>P3 (medium)</option>
                <option value={Priority.P4}>P4 (low)</option>
              </select>
            </div>

            {/* Due Date Filter */}
            <div className="mb-3">
              <label className="block text-xs opacity-40 mb-1">due date</label>
              <select
                value={dueDateFilter}
                onChange={(e) => setDueDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-minimal-border focus:outline-none focus:border-minimal-text bg-minimal-bg text-sm"
              >
                <option value="">any time</option>
                <option value="today">today</option>
                <option value="overdue">overdue</option>
                <option value="this_week">this week</option>
                <option value="no_date">no date</option>
              </select>
            </div>
          </div>

          {/* Generated Query */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2">generated query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="project:xyz & label:abc & priority:p1"
              className="w-full px-3 py-2 border border-minimal-border focus:outline-none focus:border-minimal-text bg-transparent text-sm"
            />
            <div className="mt-1 text-xs opacity-40">
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
              <span className="text-sm">add to favorites</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-minimal-border hover:bg-minimal-hover transition-colors"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !query.trim()}
              className="px-4 py-2 text-sm border border-minimal-border hover:bg-minimal-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {filterId ? 'save' : 'add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
