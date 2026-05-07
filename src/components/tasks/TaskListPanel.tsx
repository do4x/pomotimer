import { AnimatePresence, motion } from 'motion/react';
import type { Task, TimerTarget } from '../../types/task';
import type { TimerPhase } from '../../types/timer';
import { PHASE_COLORS } from '../../utils/constants';
import { TaskItem } from './TaskItem';
import { TaskInput } from './TaskInput';
import { CompletionBanner } from './CompletionBanner';
import './TaskListPanel.css';

interface Props {
  phase: TimerPhase;
  tasksA: Task[];
  tasksB: Task[];
  allCompletedA: boolean;
  allCompletedB: boolean;
  onAddTask: (timer: TimerTarget, text: string) => void;
  onCompleteTask: (timer: TimerTarget, id: string) => void;
  onDeleteTask: (timer: TimerTarget, id: string) => void;
  timerALabel: string;
  timerBLabel: string;
}

export function TaskListPanel({
  phase, tasksA, tasksB,
  allCompletedA, allCompletedB,
  onAddTask, onCompleteTask, onDeleteTask,
  timerALabel, timerBLabel,
}: Props) {
  const isTimerB = phase === 'timerB';
  const activeTimer: TimerTarget = isTimerB ? 'B' : 'A';
  const tasks = isTimerB ? tasksB : tasksA;
  const allCompleted = isTimerB ? allCompletedB : allCompletedA;
  const label = isTimerB ? timerBLabel : timerALabel;
  const colors = isTimerB ? PHASE_COLORS.timerB : PHASE_COLORS.timerA;
  const activeTasks = tasks.filter(t => !t.completed);

  return (
    <div className="task-list-panel">
      <div className="task-list-header">
        <motion.div
          className="task-list-accent"
          animate={{ backgroundColor: colors.primary }}
          transition={{ duration: 0.4 }}
        />
        <span className="task-list-title">{label} Tasks</span>
        <span className="task-list-count">{activeTasks.length}</span>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeTimer}
          className="task-list-content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <AnimatePresence mode="popLayout">
            {activeTasks.map(task => (
              <TaskItem
                key={task.id}
                id={task.id}
                text={task.text}
                completed={task.completed}
                onComplete={(id) => onCompleteTask(activeTimer, id)}
                onDelete={(id) => onDeleteTask(activeTimer, id)}
                accentColor={colors.primary}
              />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {allCompleted && activeTasks.length === 0 && tasks.length > 0 && (
              <CompletionBanner accentColor={colors.primary} />
            )}
          </AnimatePresence>

          <TaskInput
            onAdd={(text) => onAddTask(activeTimer, text)}
            accentColor={colors.primary}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
