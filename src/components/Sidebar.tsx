import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { ViewType } from '../types/task';
import { ProjectModal } from './ProjectModal';
import { LabelModal } from './LabelModal';
import { FilterModal } from './FilterModal';

export const Sidebar = () => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const {
    projects,
    labels,
    filters,
    viewState,
    goToInbox,
    goToToday,
    goToUpcoming,
    goToProject,
    goToLabel,
    goToFilter,
    goToInsights,
    karma,
  } = useTaskStore();

  const favoriteProjects = projects.filter((p) => p.isFavorite && !p.isArchived);
  const otherProjects = projects.filter((p) => !p.isFavorite && !p.isArchived);
  const favoriteLabels = labels.filter((l) => l.isFavorite);

  const isViewActive = (type: ViewType, id?: string): boolean => {
    if (viewState.type !== type) return false;
    if (id && viewState.projectId !== id && viewState.labelId !== id && viewState.filterId !== id) {
      return false;
    }
    return true;
  };

  return (
    <div className="w-64 border-r border-minimal-border bg-minimal-bg flex flex-col h-full">
      {/* User/Karma Section */}
      <div className="p-4 border-b border-minimal-border">
        <div className="text-xs opacity-60">
          <div>level {karma.level}</div>
          <div className="mt-1">{karma.totalPoints} pts • {karma.currentStreak} streak</div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Quick Views */}
          <div className="mb-4">
            <button
              onClick={goToInbox}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover transition-colors ${
                isViewActive(ViewType.INBOX) ? 'bg-minimal-hover' : ''
              }`}
            >
              <span className="mr-2">📥</span>
              inbox
            </button>

            <button
              onClick={goToToday}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover transition-colors ${
                isViewActive(ViewType.TODAY) ? 'bg-minimal-hover' : ''
              }`}
            >
              <span className="mr-2">📅</span>
              today
            </button>

            <button
              onClick={goToUpcoming}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover transition-colors ${
                isViewActive(ViewType.UPCOMING) ? 'bg-minimal-hover' : ''
              }`}
            >
              <span className="mr-2">📆</span>
              upcoming
            </button>

            <button
              onClick={goToInsights}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover transition-colors ${
                isViewActive(ViewType.INSIGHTS) ? 'bg-minimal-hover' : ''
              }`}
            >
              <span className="mr-2">📊</span>
              insights
            </button>
          </div>

          {/* Favorite Projects */}
          {favoriteProjects.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1 text-xs opacity-40 uppercase tracking-wider">
                favorites
              </div>
              {favoriteProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => goToProject(project.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover transition-colors flex items-center gap-2 ${
                    isViewActive(ViewType.PROJECT, project.id) ? 'bg-minimal-hover' : ''
                  }`}
                >
                  <span
                    style={{ color: project.color }}
                    className="text-sm"
                  >
                    {project.icon || '#'}
                  </span>
                  <span className="flex-1 truncate">{project.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* All Projects */}
          {otherProjects.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1 text-xs opacity-40 uppercase tracking-wider">
                projects
              </div>
              {otherProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => goToProject(project.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover transition-colors flex items-center gap-2 ${
                    isViewActive(ViewType.PROJECT, project.id) ? 'bg-minimal-hover' : ''
                  }`}
                >
                  <span
                    style={{ color: project.color }}
                    className="text-sm"
                  >
                    {project.icon || '#'}
                  </span>
                  <span className="flex-1 truncate">{project.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Labels */}
          {labels.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1 text-xs opacity-40 uppercase tracking-wider">
                labels
              </div>
              {favoriteLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => goToLabel(label.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover transition-colors flex items-center gap-2 ${
                    isViewActive(ViewType.LABEL, label.id) ? 'bg-minimal-hover' : ''
                  }`}
                >
                  <span
                    style={{ color: label.color }}
                    className="text-xs"
                  >
                    ●
                  </span>
                  <span className="flex-1 truncate">@{label.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Filters */}
          {filters.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1 text-xs opacity-40 uppercase tracking-wider">
                filters
              </div>
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => goToFilter(filter.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover transition-colors flex items-center gap-2 ${
                    isViewActive(ViewType.FILTER, filter.id) ? 'bg-minimal-hover' : ''
                  }`}
                >
                  <span
                    style={{ color: filter.color }}
                    className="text-xs"
                  >
                    ◆
                  </span>
                  <span className="flex-1 truncate">{filter.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-minimal-border">
        <button
          onClick={() => setIsProjectModalOpen(true)}
          className="w-full text-left px-3 py-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
        >
          [+ add_project]
        </button>
        <button
          onClick={() => setIsLabelModalOpen(true)}
          className="w-full text-left px-3 py-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
        >
          [+ add_label]
        </button>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="w-full text-left px-3 py-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
        >
          [+ add_filter]
        </button>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
      <LabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />
    </div>
  );
};
