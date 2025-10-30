import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { DEFAULT_COLORS, PROJECT_ICONS } from '../types/task';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string; // If provided, we're editing; otherwise, adding new
}

export const ProjectModal = ({ isOpen, onClose, projectId }: ProjectModalProps) => {
  const { projects, addProject, updateProject } = useTaskStore();

  const existingProject = projectId ? projects.find((p) => p.id === projectId) : null;

  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [icon, setIcon] = useState(PROJECT_ICONS[0]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Load existing project data when editing
  useEffect(() => {
    if (existingProject) {
      setName(existingProject.name);
      setColor(existingProject.color);
      setIcon(existingProject.icon || PROJECT_ICONS[0]);
      setIsFavorite(existingProject.isFavorite);
    } else {
      // Reset for new project
      setName('');
      setColor(DEFAULT_COLORS[0]);
      setIcon(PROJECT_ICONS[0]);
      setIsFavorite(false);
    }
  }, [existingProject, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (projectId) {
      // Edit existing
      updateProject(projectId, {
        name: name.trim(),
        color,
        icon,
        isFavorite,
      });
    } else {
      // Add new
      addProject({
        name: name.trim(),
        color,
        icon,
        isFavorite,
        isArchived: false,
        order: projects.length,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-minimal-bg dark:bg-[#1A1A1A] border border-minimal-border dark:border-[#2A2A2A] w-full max-w-md p-6">
        <h2 className="text-lg font-medium mb-6 text-minimal-text dark:text-[#FAFAFA]">
          {projectId ? 'Edit Project' : 'Add Project'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
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

          {/* Icon Picker */}
          <div className="mb-4">
            <label className="block text-xs opacity-60 mb-2 text-minimal-text dark:text-[#FAFAFA]">Icon</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 border text-lg flex items-center justify-center transition-all ${
                    icon === i
                      ? 'border-minimal-text dark:border-[#FAFAFA] bg-minimal-hover dark:bg-[#2A2A2A]'
                      : 'border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A]'
                  }`}
                  title={i}
                >
                  {i}
                </button>
              ))}
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
              disabled={!name.trim()}
              className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-minimal-text dark:text-[#FAFAFA]"
            >
              {projectId ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
