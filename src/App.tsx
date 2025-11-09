import { useEffect, useState } from 'react';
import { useTaskStore } from './store/taskStore';
import { Priority, TaskStatus, ViewType, type Section } from './types/task';
import { Sidebar } from './components/Sidebar';
import { EnhancedTaskForm } from './components/EnhancedTaskForm';
import { ProductivityDashboard } from './components/ProductivityDashboard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { SectionHeader } from './components/SectionHeader';
import { startReminderScheduler, stopReminderScheduler } from './utils/reminderScheduler';
import { formatDueDate, getDateUrgency, getDateUrgencyColor } from './utils/dateFormatter';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { syncService } from './services/syncService';

function App() {
  const { user, loading: authLoading } = useAuth();
  const {
    getTasksForCurrentView,
    getTasksByProject,
    projects,
    labels,
    addTask,
    toggleTaskCompletion,
    goToToday,
    viewState,
    addSection,
    updateSection,
    deleteSection,
  } = useTaskStore();

  const [taskTitle, setTaskTitle] = useState('');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  // Initialize store when authenticated
  useEffect(() => {
    if (user) {
      const initStore = async () => {
        try {
          await useTaskStore.getState().initializeStore();
          goToToday();
        } catch (error) {
          console.error('Failed to initialize store:', error);
        }
      };
      initStore();
    }
  }, [user, goToToday]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const unsubscribe = syncService.subscribeToChanges(
      user.id,
      // On task change
      async (payload: any) => {
        console.log('Real-time task change:', payload);
        // Refresh store data to get latest
        await useTaskStore.getState().initializeStore();
      },
      // On project change
      async (payload: any) => {
        console.log('Real-time project change:', payload);
        // Refresh store data to get latest
        await useTaskStore.getState().initializeStore();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Start reminder scheduler
  useEffect(() => {
    startReminderScheduler(() => useTaskStore.getState().tasks);

    return () => {
      stopReminderScheduler();
    };
  }, []);

  const tasks = getTasksForCurrentView().sort((a, b) => {
    // Sort by priority (p1 first, p4 last)
    const priorityOrder = { p1: 1, p2: 2, p3: 3, p4: 4 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Section management functions
  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleAddSection = async () => {
    if (!newSectionName.trim() || viewState.type !== ViewType.PROJECT || !viewState.projectId) return;

    try {
      await addSection(viewState.projectId, newSectionName.trim());
      setNewSectionName('');
      setIsAddingSection(false);
    } catch (error) {
      console.error('Failed to add section:', error);
    }
  };

  const handleRenameSection = async (sectionId: string, newName: string) => {
    if (!viewState.projectId) return;

    try {
      await updateSection(viewState.projectId, sectionId, newName);
    } catch (error) {
      console.error('Failed to rename section:', error);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!viewState.projectId) return;

    try {
      await deleteSection(viewState.projectId, sectionId);
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  // Group tasks by section when viewing a project
  const getTasksBySection = () => {
    if (viewState.type !== ViewType.PROJECT || !viewState.projectId) {
      return null;
    }

    const project = projects.find(p => p.id === viewState.projectId);
    if (!project) return null;

    const sections = project.sections || [];
    const projectTasks = getTasksByProject(viewState.projectId);

    // Group tasks by section
    const tasksBySectionId = new Map<string | null, typeof projectTasks>();

    // Tasks without section
    tasksBySectionId.set(null, projectTasks.filter(t => !t.sectionId));

    // Tasks by section
    sections.forEach(section => {
      tasksBySectionId.set(
        section.id,
        projectTasks.filter(t => t.sectionId === section.id)
      );
    });

    return { sections, tasksBySectionId };
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    // Determine project and date based on current view
    let projectId: string | null = null;
    let dueDate: string | undefined = undefined;

    if (viewState.type === ViewType.PROJECT) {
      // If viewing a project, add to that project
      projectId = viewState.projectId || null;
    } else if (viewState.type === ViewType.TODAY) {
      // If viewing Today, add to Inbox with today's date
      dueDate = new Date().toISOString().split('T')[0];
    } else if (viewState.type === ViewType.UPCOMING) {
      // If viewing Upcoming, add to Inbox with tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
    }
    // For Inbox, etc., just add to Inbox without date

    addTask({
      title: taskTitle.trim(),
      projectId,
      dueDate,
      status: TaskStatus.TODO,
      priority: Priority.P4,
    });

    setTaskTitle('');
  };

  // Render a single task item
  const renderTaskItem = (task: typeof tasks[0]) => {
    // Priority colors matching Todoist style
    const priorityColors = {
      p1: 'bg-red-500',
      p2: 'bg-orange-500',
      p3: 'bg-blue-500',
      p4: 'bg-gray-400 dark:bg-gray-600'
    };

    return (
      <div
        key={task.id}
        onClick={() => {
          setSelectedTaskId(task.id);
          setIsMobileSidebarOpen(false);
        }}
        className={`py-3.5 px-2 sm:px-2 -mx-2 sm:-mx-2 flex items-start gap-3 border-b border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer ${
          task.completed ? 'opacity-60' : ''
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskCompletion(task.id);
          }}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 ${
            task.completed
              ? `${priorityColors[task.priority]} border-transparent`
              : `border-current ${task.priority === 'p1' ? 'text-red-500' : task.priority === 'p2' ? 'text-orange-500' : task.priority === 'p3' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-600'}`
          }`}
          title={`Priority: ${task.priority.toUpperCase()}`}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm text-minimal-text dark:text-[#FAFAFA] ${
                task.completed ? 'line-through' : ''
              }`}
            >
              {task.title}
            </span>
          </div>

          {task.description && (
            <p className="text-xs opacity-60 mt-1.5 ml-3.5 text-minimal-text dark:text-[#FAFAFA]">
              {task.description}
            </p>
          )}

          {task.dueDate && (
            <div className={`text-xs mt-1.5 ${getDateUrgencyColor(getDateUrgency(task.dueDate, task.dueTime))}`}>
              {formatDueDate(task.dueDate, task.dueTime)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get current view title
  const getViewTitle = () => {
    switch (viewState.type) {
      case ViewType.INBOX:
        return 'Inbox';
      case ViewType.TODAY:
        return 'Today';
      case ViewType.UPCOMING:
        return 'Upcoming';
      case ViewType.PROJECT:
        const project = projects.find((p) => p.id === viewState.projectId);
        return project?.name || 'Project';
      case ViewType.LABEL:
        const label = labels.find((l) => l.id === viewState.labelId);
        return `@${label?.name || 'Label'}`;
      case ViewType.FILTER:
        return 'Filter';
      case ViewType.INSIGHTS:
        return 'Insights';
      case ViewType.COMPLETED:
        return 'Completed';
      default:
        return 'Tasks';
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-minimal-bg dark:bg-[#0A0A0A]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-minimal-text dark:text-[#FAFAFA] opacity-60">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-minimal-bg dark:bg-[#0A0A0A] flex transition-colors duration-200">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          onNavigate={() => setIsMobileSidebarOpen(false)}
          onOpenTaskForm={() => setIsTaskFormOpen(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-6 sm:py-12">
          <header className="mb-8 sm:mb-12 flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors rounded"
            >
              <svg className="w-6 h-6 text-minimal-text dark:text-[#FAFAFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="text-xl sm:text-2xl font-normal text-minimal-text dark:text-[#FAFAFA] flex-1">
              {getViewTitle()}
            </h1>

            {/* Filter Button */}
            <button
              className="px-3 py-1.5 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] text-minimal-text dark:text-[#FAFAFA] transition-colors flex items-center gap-2"
              title="Filter tasks"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filter</span>
            </button>
          </header>

          {/* Show Dashboard or Task List */}
          {viewState.type === ViewType.INSIGHTS ? (
            <ProductivityDashboard />
          ) : (
            <>
              {/* Task Form */}
              <div className="mb-6 sm:mb-8">
                <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Add task..."
                    className="flex-1 px-3 py-2.5 sm:py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA] transition-colors placeholder:opacity-50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 sm:py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] text-minimal-text dark:text-[#FAFAFA] transition-colors whitespace-nowrap"
                  >
                    Add
                  </button>
                </form>
                <button
                  onClick={() => setIsTaskFormOpen(true)}
                  className="text-xs opacity-60 hover:opacity-100 transition-opacity text-minimal-text dark:text-[#FAFAFA]"
                >
                  Or Add With Details
                </button>
              </div>

              <div className="border-t border-minimal-border dark:border-[#2A2A2A] my-6 sm:my-8" />

              {/* Task List */}
              <div className="space-y-2">
                {(() => {
                  const sectionData = getTasksBySection();

                  // Show sectioned view for projects
                  if (sectionData) {
                    const { sections, tasksBySectionId } = sectionData;
                    const totalTasks = Array.from(tasksBySectionId.values()).reduce((sum, tasks) => sum + tasks.length, 0);

                    return (
                      <>
                        <h2 className="text-sm font-medium mb-6 opacity-60 text-minimal-text dark:text-[#FAFAFA]">
                          {totalTasks} {totalTasks === 1 ? 'Task' : 'Tasks'}
                        </h2>

                        {totalTasks === 0 ? (
                          <div className="text-xs opacity-40 py-12 text-center text-minimal-text dark:text-[#FAFAFA]">
                            No tasks in this project
                          </div>
                        ) : (
                          <div className="space-y-4">
                              {/* No Section group */}
                              {tasksBySectionId.get(null) && tasksBySectionId.get(null)!.length > 0 && (
                                <div className="border border-minimal-border dark:border-[#2A2A2A] rounded">
                                  <SectionHeader
                                    section={null}
                                    taskCount={tasksBySectionId.get(null)!.length}
                                    isCollapsed={collapsedSections.has('no-section')}
                                    onToggle={() => toggleSectionCollapse('no-section')}
                                    isNoSection={true}
                                  />
                                  {!collapsedSections.has('no-section') && (
                                    <div className="border-t border-minimal-border dark:border-[#2A2A2A]">
                                      {tasksBySectionId.get(null)!.map(task => renderTaskItem(task))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Sections */}
                              {sections.map((section) => {
                                const sectionTasks = tasksBySectionId.get(section.id) || [];
                                if (sectionTasks.length === 0) return null;

                                return (
                                  <div key={section.id} className="border border-minimal-border dark:border-[#2A2A2A] rounded">
                                    <SectionHeader
                                      section={section}
                                      taskCount={sectionTasks.length}
                                      isCollapsed={collapsedSections.has(section.id)}
                                      onToggle={() => toggleSectionCollapse(section.id)}
                                      onRename={(newName) => handleRenameSection(section.id, newName)}
                                      onDelete={() => handleDeleteSection(section.id)}
                                    />
                                    {!collapsedSections.has(section.id) && (
                                      <div className="border-t border-minimal-border dark:border-[#2A2A2A]">
                                        {sectionTasks.map(task => renderTaskItem(task))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Add Section button */}
                              <div className="pt-4 px-2">
                                {isAddingSection ? (
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleAddSection();
                                    }}
                                    className="flex gap-2 items-center"
                                  >
                                    <input
                                      type="text"
                                      value={newSectionName}
                                      onChange={(e) => setNewSectionName(e.target.value)}
                                      onBlur={() => {
                                        if (!newSectionName.trim()) {
                                          setIsAddingSection(false);
                                        }
                                      }}
                                      placeholder="Section name"
                                      className="flex-1 px-3 py-2 text-sm border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-minimal-bg dark:bg-[#0A0A0A] text-minimal-text dark:text-[#FAFAFA]"
                                      autoFocus
                                    />
                                    <button
                                      type="submit"
                                      className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                                    >
                                      Add
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsAddingSection(false);
                                        setNewSectionName('');
                                      }}
                                      className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] text-minimal-text dark:text-[#FAFAFA] transition-colors whitespace-nowrap"
                                    >
                                      Cancel
                                    </button>
                                  </form>
                                ) : (
                                  <button
                                    onClick={() => setIsAddingSection(true)}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 px-1"
                                  >
                                    <span className="text-lg font-light">+</span>
                                    <span>Add Section</span>
                                  </button>
                                )}
                              </div>
                          </div>
                        )}
                      </>
                    );
                  }

                  // Default flat view for non-project views
                  return (
                    <>
                      <h2 className="text-sm font-medium mb-6 opacity-60 text-minimal-text dark:text-[#FAFAFA]">
                        {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
                      </h2>

                      {tasks.length === 0 ? (
                        <div className="text-xs opacity-40 py-12 text-center text-minimal-text dark:text-[#FAFAFA]">
                          No tasks for {getViewTitle()}
                        </div>
                      ) : (
                        <div className="space-y-0 border-t border-minimal-border dark:border-[#2A2A2A]">
                          {tasks.map(renderTaskItem)}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}

        {/* Enhanced Task Form Modal */}
        <EnhancedTaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
        />

        {/* Task Detail Modal */}
        {selectedTaskId && (
          <TaskDetailModal
            isOpen={!!selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
            taskId={selectedTaskId}
          />
        )}
      </div>
      </div>
    </div>
  );
}

export default App;
