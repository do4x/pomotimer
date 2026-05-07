import { motion } from 'motion/react';
import { SUBJECTS, subjectName } from '../../types/subject';
import { useLang } from '../../i18n/i18n';
import './SubjectPicker.css';

interface Props {
  activeId: string;
  onPick: (id: string) => void;
}

export function SubjectPicker({ activeId, onPick }: Props) {
  const lang = useLang();
  return (
    <div className="subject-picker">
      {SUBJECTS.map(s => {
        const active = s.id === activeId;
        return (
          <motion.button
            key={s.id}
            className={`subject-pill ${active ? 'is-active' : ''}`}
            onClick={() => onPick(s.id)}
            animate={{
              backgroundColor: active ? s.color : 'rgba(255,255,255,0.06)',
              color: active ? '#0F0F14' : 'var(--color-text-secondary)',
              scale: active ? 1 : 0.96,
            }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: active ? 1 : 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="subject-pill-dot" style={{ backgroundColor: s.color, opacity: active ? 0 : 1 }} />
            <span className="subject-pill-name">{subjectName(s.id, lang)}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
