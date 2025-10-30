import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { ViewType } from '../types/task';
import { ProjectModal } from './ProjectModal';
import { LabelModal } from './LabelModal';
import { FilterModal } from './FilterModal';
import { Inbox, Calendar, CalendarDays, BarChart3, Check, Sun, Moon } from 'lucide-react';

export const Sidebar = () => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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
    goToCompleted,
    toggleTheme,
    theme,
  } = useTaskStore();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate day of year
  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const dayOfYear = getDayOfYear(currentTime);
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });


  const isViewActive = (type: ViewType, id?: string): boolean => {
    if (viewState.type !== type) return false;
    if (id && viewState.projectId !== id && viewState.labelId !== id && viewState.filterId !== id) {
      return false;
    }
    return true;
  };

  return (
    <div className="w-64 border-r border-minimal-border dark:border-[#2A2A2A] bg-minimal-bg dark:bg-[#0A0A0A] flex flex-col h-full transition-colors duration-200">
      {/* Date/Time Section */}
      <div className="p-4 border-b border-minimal-border dark:border-[#2A2A2A] flex items-start justify-between">
        <div className="text-minimal-text dark:text-[#FAFAFA]">
          <div className="text-3xl font-light mb-1">{dayOfYear}</div>
          <div className="text-xs opacity-60">
            <div>{formattedDate}</div>
            <div className="mt-0.5">{formattedTime}</div>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors rounded text-minimal-text dark:text-[#FAFAFA]"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Quick Views */}
          <div className="mb-4">
            <button
              onClick={goToInbox}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA] flex items-center gap-2 ${
                isViewActive(ViewType.INBOX) ? 'bg-minimal-hover dark:bg-[#1A1A1A]' : ''
              }`}
            >
              <Inbox className="w-4 h-4" />
              Inbox
            </button>

            <button
              onClick={goToToday}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA] flex items-center gap-2 ${
                isViewActive(ViewType.TODAY) ? 'bg-minimal-hover dark:bg-[#1A1A1A]' : ''
              }`}
            >
              <Calendar className="w-4 h-4" />
              Today
            </button>

            <button
              onClick={goToUpcoming}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA] flex items-center gap-2 ${
                isViewActive(ViewType.UPCOMING) ? 'bg-minimal-hover dark:bg-[#1A1A1A]' : ''
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Upcoming
            </button>

            <button
              onClick={goToInsights}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA] flex items-center gap-2 ${
                isViewActive(ViewType.INSIGHTS) ? 'bg-minimal-hover dark:bg-[#1A1A1A]' : ''
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Insights
            </button>

            <button
              onClick={goToCompleted}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors text-minimal-text dark:text-[#FAFAFA] flex items-center gap-2 ${
                isViewActive(ViewType.COMPLETED) ? 'bg-minimal-hover dark:bg-[#1A1A1A]' : ''
              }`}
            >
              <Check className="w-4 h-4" />
              Completed
            </button>
          </div>

          {/* Projects */}
          {projects.filter(p => !p.isArchived).length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1 text-xs opacity-40 uppercase tracking-wider text-minimal-text dark:text-[#FAFAFA]">
                Projects
              </div>
              {projects.filter(p => !p.isArchived).map((project) => (
                <button
                  key={project.id}
                  onClick={() => goToProject(project.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 text-minimal-text dark:text-[#FAFAFA] ${
                    isViewActive(ViewType.PROJECT, project.id) ? 'bg-minimal-hover dark:bg-[#1A1A1A]' : ''
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
              <div className="px-3 py-1 text-xs opacity-40 uppercase tracking-wider text-minimal-text dark:text-[#FAFAFA]">
                Labels
              </div>
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => goToLabel(label.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 text-minimal-text dark:text-[#FAFAFA] ${
                    isViewActive(ViewType.LABEL, label.id) ? 'bg-minimal-hover dark:bg-[#1A1A1A]' : ''
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
              <div className="px-3 py-1 text-xs opacity-40 uppercase tracking-wider text-minimal-text dark:text-[#FAFAFA]">
                Filters
              </div>
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => goToFilter(filter.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 text-minimal-text dark:text-[#FAFAFA] ${
                    isViewActive(ViewType.FILTER, filter.id) ? 'bg-minimal-hover dark:bg-[#1A1A1A]' : ''
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
      <div className="p-4 border-t border-minimal-border dark:border-[#2A2A2A]">
        <button
          onClick={() => setIsProjectModalOpen(true)}
          className="w-full text-left px-3 py-2 text-xs opacity-60 hover:opacity-100 transition-opacity text-minimal-text dark:text-[#FAFAFA]"
        >
          [+ Add Project]
        </button>
        <button
          onClick={() => setIsLabelModalOpen(true)}
          className="w-full text-left px-3 py-2 text-xs opacity-60 hover:opacity-100 transition-opacity text-minimal-text dark:text-[#FAFAFA]"
        >
          [+ Add Label]
        </button>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="w-full text-left px-3 py-2 text-xs opacity-60 hover:opacity-100 transition-opacity text-minimal-text dark:text-[#FAFAFA]"
        >
          [+ Add Filter]
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
