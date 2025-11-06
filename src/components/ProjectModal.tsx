import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTaskStore } from '../store/taskStore';
import { DEFAULT_COLORS } from '../types/task';
import type { Project } from '../types/task';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string; // If provided, we're editing; otherwise, adding new
}

// Color names mapping for dropdown display
const COLOR_NAMES: Record<string, string> = {
  '#CC0000': 'Red',
  '#FF9800': 'Orange',
  '#FFC107': 'Amber',
  '#4CAF50': 'Green',
  '#00BCD4': 'Cyan',
  '#2196F3': 'Blue',
  '#673AB7': 'Deep Purple',
  '#9C27B0': 'Purple',
  '#E91E63': 'Pink',
  '#795548': 'Brown',
  '#607D8B': 'Blue Gray',
  '#999999': 'Gray',
};

export const ProjectModal = ({ isOpen, onClose, projectId }: ProjectModalProps) => {
  const { projects, addProject, updateProject } = useTaskStore();

  const existingProject = projectId ? projects.find((p) => p.id === projectId) : null;

  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [viewStyle, setViewStyle] = useState<'list' | 'board' | 'calendar'>('list');
  const [isFavorite, setIsFavorite] = useState(false);

  // Get available parent projects (exclude self and descendants when editing)
  const availableParents = projects.filter((p) => {
    if (p.isArchived) return false;
    if (projectId && p.id === projectId) return false;
    // TODO: Also exclude descendants to prevent circular dependencies
    return true;
  });

  // Load existing project data when editing
  useEffect(() => {
    if (existingProject) {
      setName(existingProject.name);
      setColor(existingProject.color);
      setParentId(existingProject.parentId || null);
      setViewStyle(existingProject.viewStyle || 'list');
      setIsFavorite(existingProject.isFavorite);
    } else {
      // Reset for new project
      setName('');
      setColor(DEFAULT_COLORS[0]);
      setParentId(null);
      setViewStyle('list');
      setIsFavorite(false);
    }
  }, [existingProject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      if (projectId) {
        // Edit existing
        await updateProject(projectId, {
          name: name.trim(),
          color,
          parentId,
          viewStyle,
          isFavorite,
        });
      } else {
        // Add new
        await addProject({
          name: name.trim(),
          color,
          parentId,
          viewStyle,
          isFavorite,
          isArchived: false,
          order: projects.length,
        });
      }

      onClose();
    } catch (error) {
      // Error toast already shown by store
      console.error('Project save error:', error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-minimal-bg dark:bg-[#1A1A1A] border border-minimal-border dark:border-[#2A2A2A] w-full max-w-md p-6">
        <h2 className="text-lg font-medium mb-6 text-minimal-text dark:text-[#FAFAFA]">
          {projectId ? 'Edit Project' : 'Add Project'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA] placeholder:text-minimal-text placeholder:dark:text-[#FAFAFA] placeholder:opacity-40"
              autoFocus
              maxLength={120}
            />
          </div>

          {/* Color Dropdown */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
              Color
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA] appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                paddingRight: '2.5rem',
              }}
            >
              {DEFAULT_COLORS.map((c) => (
                <option key={c} value={c}>
                  {COLOR_NAMES[c] || c}
                </option>
              ))}
            </select>
            {/* Color preview dot */}
            <div className="mt-2 flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-minimal-border dark:border-[#2A2A2A]"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs opacity-60 text-minimal-text dark:text-[#FAFAFA]">
                Selected color
              </span>
            </div>
          </div>

          {/* Parent Project Dropdown */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
              Parent Project
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-minimal-bg dark:bg-[#0A0A0A] text-sm text-minimal-text dark:text-[#FAFAFA] appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                paddingRight: '2.5rem',
              }}
            >
              <option value="">No Parent</option>
              {availableParents.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Favorite Toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-minimal-text dark:text-[#FAFAFA]">
                Add to Favorites
              </span>
            </label>
          </div>

          {/* Layout/View Selection */}
          <div className="mb-6">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">
              Layout
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* List View */}
              <button
                type="button"
                onClick={() => setViewStyle('list')}
                className={`flex flex-col items-center gap-2 p-3 border-2 transition-all ${
                  viewStyle === 'list'
                    ? 'border-minimal-text dark:border-[#FAFAFA] bg-minimal-hover dark:bg-[#2A2A2A]'
                    : 'border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A]'
                }`}
              >
                <svg className="w-6 h-6 text-minimal-text dark:text-[#FAFAFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-xs text-minimal-text dark:text-[#FAFAFA]">List</span>
              </button>

              {/* Board View */}
              <button
                type="button"
                onClick={() => setViewStyle('board')}
                className={`flex flex-col items-center gap-2 p-3 border-2 transition-all ${
                  viewStyle === 'board'
                    ? 'border-minimal-text dark:border-[#FAFAFA] bg-minimal-hover dark:bg-[#2A2A2A]'
                    : 'border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A]'
                }`}
              >
                <svg className="w-6 h-6 text-minimal-text dark:text-[#FAFAFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span className="text-xs text-minimal-text dark:text-[#FAFAFA]">Board</span>
              </button>

              {/* Calendar View */}
              <button
                type="button"
                onClick={() => setViewStyle('calendar')}
                className={`flex flex-col items-center gap-2 p-3 border-2 transition-all ${
                  viewStyle === 'calendar'
                    ? 'border-minimal-text dark:border-[#FAFAFA] bg-minimal-hover dark:bg-[#2A2A2A]'
                    : 'border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A]'
                }`}
              >
                <svg className="w-6 h-6 text-minimal-text dark:text-[#FAFAFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-minimal-text dark:text-[#FAFAFA]">Calendar</span>
              </button>
            </div>
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
              disabled={!name.trim()}
              className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-minimal-text dark:text-[#FAFAFA]"
            >
              {projectId ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
