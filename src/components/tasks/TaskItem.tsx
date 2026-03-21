import { motion } from 'motion/react';
import { useState } from 'react';
import './TaskItem.css';

interface Props {
  id: string;
  text: string;
  completed: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  accentColor: string;
}

export function TaskItem({ id, text, completed, onComplete, onDelete, accentColor }: Props) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClick = () => {
    if (completed || isExiting) return;
    setIsExiting(true);
    onComplete(id);
  };

  return (
    <motion.div
      layout
      className={`task-item ${completed ? 'task-completed' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={
        isExiting
          ? { x: 40, opacity: 0, transition: { duration: 0.3, delay: 0.3 } }
          : { opacity: 1, x: 0 }
      }
      exit={{ x: -60, opacity: 0, transition: { duration: 0.25, ease: [0.7, 0, 0.84, 0] } }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleClick}
      onAnimationComplete={() => {
        if (isExiting) {
          onDelete(id);
        }
      }}
    >
      <motion.div
        className="task-bullet"
        animate={{ backgroundColor: completed ? accentColor : 'rgba(255,255,255,0.15)' }}
        transition={{ duration: 0.2 }}
      />
      <span className="task-text">{text}</span>
      {completed && (
        <motion.div
          className="task-strikethrough"
          style={{ backgroundColor: accentColor }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </motion.div>
  );
}
