import { useEffect, useState } from 'react';
import { useTaskStore } from './store/taskStore';
import { Priority, TaskStatus, PRIORITY_ICONS, ViewType } from './types/task';
import { Sidebar } from './components/Sidebar';
import { EnhancedTaskForm } from './components/EnhancedTaskForm';
import { ProductivityDashboard } from './components/ProductivityDashboard';
import { startReminderScheduler, stopReminderScheduler } from './utils/reminderScheduler';

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

  const tasks = getTasksForCurrentView();
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
        return 'inbox';
      case ViewType.TODAY:
        return 'today';
      case ViewType.UPCOMING:
        return 'upcoming';
      case ViewType.PROJECT:
        const project = projects.find((p) => p.id === viewState.projectId);
        return project?.name || 'project';
      case ViewType.LABEL:
        const label = labels.find((l) => l.id === viewState.labelId);
        return `@${label?.name || 'label'}`;
      case ViewType.FILTER:
        return 'filter';
      case ViewType.INSIGHTS:
        return 'insights';
      default:
        return 'tasks';
    }
  };

  return (
    <div className="min-h-screen bg-minimal-bg flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-6 max-w-4xl py-12">
          <header className="mb-12">
            <h1 className="text-2xl font-normal text-minimal-text mb-2">
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
                    placeholder="[+ quick_add_task]"
                    className="flex-1 px-3 py-2 border border-minimal-border focus:outline-none focus:border-minimal-text bg-transparent text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm border border-minimal-border hover:bg-minimal-hover transition-colors"
                  >
                    add
                  </button>
                </form>
                <button
                  onClick={() => setIsTaskFormOpen(true)}
                  className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                >
                  or [+ add_with_details]
                </button>
              </div>

              <div className="border-t border-minimal-border my-8" />

              {/* Task List */}
              <div className="space-y-1">
                <h2 className="text-sm font-medium mb-4 opacity-60">
                  {getViewTitle()} ({tasks.length})
                </h2>

                {tasks.length === 0 ? (
                  <div className="text-xs opacity-40 py-8">
                    no tasks for {getViewTitle()}
                  </div>
                ) : (
                  <div className="space-y-0">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`py-3 flex items-start gap-3 ${
                          task.completed ? 'opacity-40' : ''
                        }`}
                      >
                        <button
                          onClick={() => toggleTaskCompletion(task.id)}
                          className="text-xs mt-0.5 hover:opacity-60"
                        >
                          {task.completed ? '☑' : '☐'}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <span className="text-xs opacity-60">
                              {PRIORITY_ICONS[task.priority]}
                            </span>
                            <span
                              className={`text-sm ${
                                task.completed ? 'line-through' : ''
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs opacity-60 mt-1 ml-6">
                              {task.description}
                            </p>
                          )}

                          {task.dueDate && (
                            <div className="text-xs opacity-40 mt-1 ml-6">
                              due: {task.dueDate}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
      </div>
      </div>
    </div>
  );
}

export default App;
