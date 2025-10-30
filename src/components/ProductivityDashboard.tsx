import { useTaskStore } from '../store/taskStore';
import { KARMA_LEVELS } from '../types/task';

export const ProductivityDashboard = () => {
  const { karma, getProductivityStats, tasks } = useTaskStore();
  const stats = getProductivityStats();

  const currentLevel = KARMA_LEVELS.find((l) => l.level === karma.level);
  const nextLevel = KARMA_LEVELS.find((l) => l.level === karma.level + 1);
  const progress = nextLevel
    ? ((karma.totalPoints - currentLevel!.pointsRequired) / (nextLevel.pointsRequired - currentLevel!.pointsRequired)) * 100
    : 100;

  // Calculate completion rate
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';

  // Get tasks by priority
  const p1Tasks = tasks.filter((t) => !t.completed && t.priority === 'p1').length;
  const p2Tasks = tasks.filter((t) => !t.completed && t.priority === 'p2').length;
  const p3Tasks = tasks.filter((t) => !t.completed && t.priority === 'p3').length;
  const p4Tasks = tasks.filter((t) => !t.completed && t.priority === 'p4').length;

  return (
    <div className="space-y-8">
      {/* Karma & Level Progress */}
      <div className="border border-minimal-border p-6">
        <h2 className="text-lg font-medium mb-4">karma & level</h2>

        <div className="space-y-4">
          {/* Current Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-60">current level</span>
              <span className="text-sm font-medium">
                {currentLevel?.title || 'Unknown'} (Level {karma.level})
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-60">total points</span>
              <span className="text-sm font-medium">{karma.totalPoints} pts</span>
            </div>
          </div>

          {/* Progress Bar */}
          {nextLevel && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs opacity-40">next level</span>
                <span className="text-xs opacity-60">
                  {currentLevel!.pointsRequired}/{nextLevel.pointsRequired} pts
                </span>
              </div>
              <div className="w-full h-2 bg-minimal-hover border border-minimal-border">
                <div
                  className="h-full bg-minimal-text transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Streaks */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-minimal-border">
            <div>
              <div className="text-xs opacity-40 mb-1">current streak</div>
              <div className="text-2xl font-medium">{karma.currentStreak}</div>
              <div className="text-xs opacity-40">days</div>
            </div>
            <div>
              <div className="text-xs opacity-40 mb-1">longest streak</div>
              <div className="text-2xl font-medium">{karma.longestStreak}</div>
              <div className="text-xs opacity-40">days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Stats */}
      <div className="border border-minimal-border p-6">
        <h2 className="text-lg font-medium mb-4">productivity stats</h2>

        <div className="space-y-4">
          {/* Completion Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-60">overall completion rate</span>
              <span className="text-sm font-medium">{completionRate}%</span>
            </div>
            <div className="w-full h-2 bg-minimal-hover border border-minimal-border">
              <div
                className="h-full bg-minimal-text transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Task Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs opacity-40 mb-1">total tasks</div>
              <div className="text-xl font-medium">{totalTasks}</div>
            </div>
            <div>
              <div className="text-xs opacity-40 mb-1">completed</div>
              <div className="text-xl font-medium">{completedTasks}</div>
            </div>
          </div>

          {/* Tasks by Period */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-minimal-border">
            <div>
              <div className="text-xs opacity-40 mb-1">today</div>
              <div className="text-lg font-medium">{stats.tasksCompletedToday}</div>
            </div>
            <div>
              <div className="text-xs opacity-40 mb-1">this week</div>
              <div className="text-lg font-medium">{stats.tasksCompletedThisWeek}</div>
            </div>
            <div>
              <div className="text-xs opacity-40 mb-1">this month</div>
              <div className="text-lg font-medium">{stats.tasksCompletedThisMonth}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tasks Breakdown */}
      <div className="border border-minimal-border p-6">
        <h2 className="text-lg font-medium mb-4">active tasks by priority</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-60">🔴 P1 (urgent)</span>
            <span className="text-sm font-medium">{p1Tasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-60">🟠 P2 (high)</span>
            <span className="text-sm font-medium">{p2Tasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-60">🔵 P3 (medium)</span>
            <span className="text-sm font-medium">{p3Tasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-60">⚪ P4 (low)</span>
            <span className="text-sm font-medium">{p4Tasks}</span>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="border border-minimal-border p-6">
        <h2 className="text-lg font-medium mb-4">goals</h2>

        <div className="space-y-4">
          {/* Daily Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-60">daily goal</span>
              <span className="text-sm font-medium">
                {stats.tasksCompletedToday}/{karma.dailyGoal}
              </span>
            </div>
            <div className="w-full h-2 bg-minimal-hover border border-minimal-border">
              <div
                className="h-full bg-minimal-text transition-all"
                style={{
                  width: `${Math.min((stats.tasksCompletedToday / karma.dailyGoal) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Weekly Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-60">weekly goal</span>
              <span className="text-sm font-medium">
                {stats.tasksCompletedThisWeek}/{karma.weeklyGoal}
              </span>
            </div>
            <div className="w-full h-2 bg-minimal-hover border border-minimal-border">
              <div
                className="h-full bg-minimal-text transition-all"
                style={{
                  width: `${Math.min((stats.tasksCompletedThisWeek / karma.weeklyGoal) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
