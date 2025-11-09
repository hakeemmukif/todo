import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import type { Section } from '../types/task';

interface SectionHeaderProps {
  section: Section | null;
  taskCount: number;
  isCollapsed: boolean;
  onToggle: () => void;
  onRename?: (newName: string) => void;
  onDelete?: () => void;
  isNoSection?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  section,
  taskCount,
  isCollapsed,
  onToggle,
  onRename,
  onDelete,
  isNoSection = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(section?.name || '');
  const [isHovered, setIsHovered] = useState(false);

  const handleNameClick = () => {
    if (!isNoSection && onRename) {
      setIsEditing(true);
      setEditValue(section?.name || '');
    }
  };

  const handleSave = () => {
    if (editValue.trim() && onRename) {
      onRename(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(section?.name || '');
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Delete this section? Tasks will be moved to "No Section".')) {
      onDelete();
    }
  };

  const displayName = isNoSection ? 'No Section' : section?.name || 'Untitled Section';

  return (
    <div
      className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onToggle}
        className="p-1 hover:bg-gray-200 rounded transition-colors"
        aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm font-semibold border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <button
          onClick={handleNameClick}
          className={`flex-1 text-left text-sm font-semibold text-gray-700 ${
            !isNoSection ? 'hover:text-gray-900 cursor-pointer' : 'cursor-default'
          }`}
          disabled={isNoSection}
        >
          {displayName}
        </button>
      )}

      <span className="text-xs text-gray-500 font-medium">
        {taskCount}
      </span>

      {!isNoSection && isHovered && onDelete && (
        <button
          onClick={handleDelete}
          className="p-1 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Delete section"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      )}
    </div>
  );
};
