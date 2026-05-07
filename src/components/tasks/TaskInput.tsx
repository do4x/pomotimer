import { useState } from 'react';
import { motion } from 'motion/react';
import { useT } from '../../i18n/i18n';
import './TaskInput.css';

interface Props {
  onAdd: (text: string) => void;
  accentColor: string;
}

export function TaskInput({ onAdd, accentColor }: Props) {
  const t = useT();
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  return (
    <form className="task-input-form" onSubmit={handleSubmit}>
      <motion.div
        className="task-input-bullet"
        animate={{ backgroundColor: value ? accentColor : 'rgba(255,255,255,0.1)' }}
        transition={{ duration: 0.2 }}
      />
      <input
        type="text"
        className="task-input"
        placeholder={t('Add a task...', 'Adaugă un task...')}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      {value && (
        <motion.button
          type="submit"
          className="task-input-btn"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{ color: accentColor }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>
      )}
    </form>
  );
}
