import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { ViewType } from '../types/task';
import { ProjectModal } from './ProjectModal';
import { LabelModal } from './LabelModal';
import { FilterModal } from './FilterModal';
import { SettingsModal } from './SettingsModal';
import { useAuth } from '../contexts/AuthContext';
import { Inbox, Calendar, CalendarDays, BarChart3, Check, Sun, Moon, Plus, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  onNavigate?: () => void;
  onOpenTaskForm?: () => void;
}

export const Sidebar = ({ onNavigate, onOpenTaskForm }: SidebarProps = {}) => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { user, signOut } = useAuth();

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
    themeColor,
  } = useTaskStore();

  // Update time every second for real-time display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
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
    second: '2-digit',
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
    <div className="w-64 border-r border-minimal-border dark:border-[#2A2A2A] bg-minimal-bg dark:bg-[#0A0A0A] flex flex-col h-screen transition-colors duration-200">
      {/* Date/Time Section */}
      <div className="p-4 border-b border-minimal-border dark:border-[#2A2A2A] flex items-start justify-between">
        <div className="text-minimal-text dark:text-[#FAFAFA]">
          <div className="text-3xl font-light mb-1">{dayOfYear}</div>
          <div className="text-xs opacity-60">
            <div>{formattedDate}</div>
            <div className="mt-0.5">{formattedTime}</div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors rounded text-minimal-text dark:text-[#FAFAFA]"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors rounded text-minimal-text dark:text-[#FAFAFA]"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Create Task Button */}
      <div className="p-4">
        <button
          onClick={() => onOpenTaskForm?.()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded hover:bg-minimal-hover dark:hover:bg-[#1A1A1A]"
          style={{
            color: themeColor
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Quick Views */}
          <div className="mb-4">
            <button
              onClick={() => {
                goToInbox();
                onNavigate?.();
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 ${
                isViewActive(ViewType.INBOX)
                  ? 'bg-minimal-hover dark:bg-[#1A1A1A]'
                  : 'text-minimal-text dark:text-[#FAFAFA]'
              }`}
              style={isViewActive(ViewType.INBOX) ? { color: themeColor } : {}}
            >
              <Inbox className="w-4 h-4" />
              Inbox
            </button>

            <button
              onClick={() => {
                goToToday();
                onNavigate?.();
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 ${
                isViewActive(ViewType.TODAY)
                  ? 'bg-minimal-hover dark:bg-[#1A1A1A]'
                  : 'text-minimal-text dark:text-[#FAFAFA]'
              }`}
              style={isViewActive(ViewType.TODAY) ? { color: themeColor } : {}}
            >
              <Calendar className="w-4 h-4" />
              Today
            </button>

            <button
              onClick={goToUpcoming}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 ${
                isViewActive(ViewType.UPCOMING)
                  ? 'bg-minimal-hover dark:bg-[#1A1A1A]'
                  : 'text-minimal-text dark:text-[#FAFAFA]'
              }`}
              style={isViewActive(ViewType.UPCOMING) ? { color: themeColor } : {}}
            >
              <CalendarDays className="w-4 h-4" />
              Upcoming
            </button>

            <button
              onClick={goToInsights}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 ${
                isViewActive(ViewType.INSIGHTS)
                  ? 'bg-minimal-hover dark:bg-[#1A1A1A]'
                  : 'text-minimal-text dark:text-[#FAFAFA]'
              }`}
              style={isViewActive(ViewType.INSIGHTS) ? { color: themeColor } : {}}
            >
              <BarChart3 className="w-4 h-4" />
              Insights
            </button>

            <button
              onClick={goToCompleted}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 ${
                isViewActive(ViewType.COMPLETED)
                  ? 'bg-minimal-hover dark:bg-[#1A1A1A]'
                  : 'text-minimal-text dark:text-[#FAFAFA]'
              }`}
              style={isViewActive(ViewType.COMPLETED) ? { color: themeColor } : {}}
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
              {(() => {
                const activeProjects = projects.filter(p => !p.isArchived);

                // Separate top-level and child projects
                const topLevelProjects = activeProjects.filter(p => !p.parentId);
                const childProjects = activeProjects.filter(p => p.parentId);

                // Helper function to render a project and its children
                const renderProject = (project: any, level: number = 0) => {
                  const children = childProjects.filter(child => child.parentId === project.id);

                  return (
                    <div key={project.id}>
                      <button
                        onClick={() => goToProject(project.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 ${
                          isViewActive(ViewType.PROJECT, project.id)
                            ? 'bg-minimal-hover dark:bg-[#1A1A1A]'
                            : 'text-minimal-text dark:text-[#FAFAFA]'
                        }`}
                        style={{
                          paddingLeft: `${0.75 + (level * 0.75)}rem`,
                          color: isViewActive(ViewType.PROJECT, project.id) ? themeColor : undefined
                        }}
                      >
                        <span
                          style={{ color: isViewActive(ViewType.PROJECT, project.id) ? themeColor : project.color }}
                          className="text-sm"
                        >
                          #
                        </span>
                        <span className="flex-1 truncate">{project.name}</span>
                      </button>
                      {/* Render children recursively */}
                      {children.map(child => renderProject(child, level + 1))}
                    </div>
                  );
                };

                // Render all top-level projects (and their children)
                return topLevelProjects.map(project => renderProject(project, 0));
              })()}
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
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 ${
                    isViewActive(ViewType.LABEL, label.id)
                      ? 'bg-minimal-hover dark:bg-[#1A1A1A]'
                      : 'text-minimal-text dark:text-[#FAFAFA]'
                  }`}
                  style={isViewActive(ViewType.LABEL, label.id) ? { color: themeColor } : {}}
                >
                  <span
                    style={{ color: isViewActive(ViewType.LABEL, label.id) ? themeColor : label.color }}
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
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 ${
                    isViewActive(ViewType.FILTER, filter.id)
                      ? 'bg-minimal-hover dark:bg-[#1A1A1A]'
                      : 'text-minimal-text dark:text-[#FAFAFA]'
                  }`}
                  style={isViewActive(ViewType.FILTER, filter.id) ? { color: themeColor } : {}}
                >
                  <span
                    style={{ color: isViewActive(ViewType.FILTER, filter.id) ? themeColor : filter.color }}
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

        {/* User Info and Logout */}
        {user && (
          <div className="mt-4 pt-4 border-t border-minimal-border dark:border-[#2A2A2A]">
            <div className="px-3 py-2 text-xs opacity-60 text-minimal-text dark:text-[#FAFAFA] truncate">
              {user.email}
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs opacity-60 hover:opacity-100 transition-opacity text-minimal-text dark:text-[#FAFAFA]"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        )}
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
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
