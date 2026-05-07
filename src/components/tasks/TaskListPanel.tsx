import { AnimatePresence, motion } from 'motion/react';
import type { Task } from '../../types/task';
import type { Subject } from '../../types/subject';
import { subjectName } from '../../types/subject';
import { TaskItem } from './TaskItem';
import { TaskInput } from './TaskInput';
import { CompletionBanner } from './CompletionBanner';
import { useT, useLang } from '../../i18n/i18n';
import './TaskListPanel.css';

interface Props {
  activeSubject: Subject;
  tasks: Task[];
  allCompleted: boolean;
  onAddTask: (subjectId: string, text: string) => void;
  onCompleteTask: (subjectId: string, id: string) => void;
  onDeleteTask: (subjectId: string, id: string) => void;
}

export function TaskListPanel({ activeSubject, tasks, allCompleted, onAddTask, onCompleteTask, onDeleteTask }: Props) {
  const t = useT();
  const lang = useLang();
  const accent = activeSubject.color;
  const subjectId = activeSubject.id;
  const activeTasks = tasks.filter(t => !t.completed);
  const subjName = subjectName(activeSubject.id, lang);

  return (
    <div className="task-list-panel">
      <div className="task-list-header">
        <motion.div
          className="task-list-accent"
          animate={{ backgroundColor: accent }}
          transition={{ duration: 0.4 }}
        />
        <span className="task-list-title">{t(`${subjName} Tasks`, `Task-uri ${subjName}`)}</span>
        <span className="task-list-count">{activeTasks.length}</span>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={subjectId}
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
                onComplete={id => onCompleteTask(subjectId, id)}
                onDelete={id => onDeleteTask(subjectId, id)}
                accentColor={accent}
              />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {allCompleted && activeTasks.length === 0 && tasks.length > 0 && (
              <CompletionBanner accentColor={accent} />
            )}
          </AnimatePresence>

          <TaskInput
            onAdd={text => onAddTask(subjectId, text)}
            accentColor={accent}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
