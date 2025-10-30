import { useEffect, useState } from 'react';
import { useTaskStore } from './store/taskStore';
import { Priority, TaskStatus, PRIORITY_ICONS, ViewType } from './types/task';
import { Sidebar } from './components/Sidebar';
import { EnhancedTaskForm } from './components/EnhancedTaskForm';
import { ProductivityDashboard } from './components/ProductivityDashboard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { startReminderScheduler, stopReminderScheduler } from './utils/reminderScheduler';
import { formatDueDate, isOverdue } from './utils/dateFormatter';

function App() {
  const {
    loadFromStorage,
    getTasksForCurrentView,
    projects,
    labels,
    addTask,
    toggleTaskCompletion,
    goToToday,
    viewState,
  } = useTaskStore();

  const [taskTitle, setTaskTitle] = useState('');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
    goToToday();
  }, [loadFromStorage, goToToday]);

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
  const defaultProject = projects[0]; // Inbox or first project

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !defaultProject) return;

    addTask({
      title: taskTitle.trim(),
      projectId: defaultProject.id,
      status: TaskStatus.TODO,
      priority: Priority.P4,
    });

    setTaskTitle('');
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

  return (
    <div className="min-h-screen bg-minimal-bg dark:bg-[#0A0A0A] flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-6 max-w-4xl py-12">
          <header className="mb-12">
            <h1 className="text-2xl font-normal text-minimal-text dark:text-[#FAFAFA] mb-2">
              {getViewTitle()}
            </h1>
          </header>

          {/* Show Dashboard or Task List */}
          {viewState.type === ViewType.INSIGHTS ? (
            <ProductivityDashboard />
          ) : (
            <>
              {/* Task Form */}
              <div className="mb-8">
                <form onSubmit={handleAddTask} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Add task..."
                    className="flex-1 px-3 py-2 border border-minimal-border dark:border-[#2A2A2A] focus:outline-none focus:border-minimal-text dark:focus:border-[#FAFAFA] bg-transparent text-sm text-minimal-text dark:text-[#FAFAFA] transition-colors placeholder:opacity-50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm border border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] text-minimal-text dark:text-[#FAFAFA] transition-colors"
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

              <div className="border-t border-minimal-border dark:border-[#2A2A2A] my-8" />

              {/* Task List */}
              <div className="space-y-2">
                <h2 className="text-sm font-medium mb-6 opacity-60 text-minimal-text dark:text-[#FAFAFA]">
                  {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
                </h2>

                {tasks.length === 0 ? (
                  <div className="text-xs opacity-40 py-12 text-center text-minimal-text dark:text-[#FAFAFA]">
                    No tasks for {getViewTitle()}
                  </div>
                ) : (
                  <div className="space-y-0 border-t border-minimal-border dark:border-[#2A2A2A]">
                    {tasks.map((task) => {
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
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`py-3.5 px-2 -mx-2 flex items-start gap-3 border-b border-minimal-border dark:border-[#2A2A2A] hover:bg-minimal-hover dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer ${
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
                              <div className={`text-xs mt-1.5 ml-3.5 ${
                                isOverdue(task.dueDate, task.dueTime)
                                  ? 'text-red-500'
                                  : 'opacity-50 text-minimal-text dark:text-[#FAFAFA]'
                              }`}>
                                {formatDueDate(task.dueDate, task.dueTime)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
