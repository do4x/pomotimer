import { useState } from 'react';
import { motion } from 'motion/react';
import { SUBJECTS, subjectName } from '../../types/subject';
import { useT, useLang } from '../../i18n/i18n';
import './LogTimeModal.css';

interface Props {
  onClose: () => void;
  onSave: (dateKey: string, subjectId: string, seconds: number) => void;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function LogTimeModal({ onClose, onSave }: Props) {
  const t = useT();
  const lang = useLang();
  const [subjectId, setSubjectId] = useState<string>(SUBJECTS[0].id);
  const [date, setDate] = useState<string>(todayKey());
  const [hours, setHours] = useState<string>('1');
  const [minutes, setMinutes] = useState<string>('0');

  const totalSeconds = (() => {
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    return (Number.isFinite(h) ? h * 3600 : 0) + (Number.isFinite(m) ? m * 60 : 0);
  })();

  const canSave = totalSeconds > 0 && !!subjectId && !!date;

  const handleSave = () => {
    if (!canSave) return;
    onSave(date, subjectId, totalSeconds);
    onClose();
  };

  return (
    <>
      <motion.div
        className="logtime-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="logtime-modal glass-panel"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="logtime-header">
          <h2 className="logtime-title">{t('Log study time', 'Adaugă timp de studiu')}</h2>
          <button className="logtime-close" onClick={onClose}>×</button>
        </div>

        <div className="logtime-body">
          <div className="logtime-field">
            <span className="logtime-label">{t('Subject', 'Materie')}</span>
            <div className="logtime-subject-row">
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  className={`logtime-subject ${subjectId === s.id ? 'is-active' : ''}`}
                  style={subjectId === s.id ? { background: s.color, color: '#0F0F14' } : {}}
                  onClick={() => setSubjectId(s.id)}
                >
                  <span className="logtime-subject-dot" style={{ backgroundColor: s.color, opacity: subjectId === s.id ? 0 : 1 }} />
                  {subjectName(s.id, lang)}
                </button>
              ))}
            </div>
          </div>

          <div className="logtime-field">
            <span className="logtime-label">{t('Date', 'Data')}</span>
            <input
              type="date"
              className="logtime-input"
              value={date}
              max={todayKey()}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="logtime-field">
            <span className="logtime-label">{t('Duration', 'Durată')}</span>
            <div className="logtime-duration">
              <input
                type="number"
                className="logtime-input logtime-input-num"
                min={0}
                max={23}
                value={hours}
                onChange={e => setHours(e.target.value)}
              />
              <span className="logtime-unit">{t('h', 'h')}</span>
              <input
                type="number"
                className="logtime-input logtime-input-num"
                min={0}
                max={59}
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
              />
              <span className="logtime-unit">{t('min', 'min')}</span>
            </div>
          </div>
        </div>

        <div className="logtime-actions">
          <button className="logtime-btn logtime-btn-secondary" onClick={onClose}>
            {t('Cancel', 'Anulează')}
          </button>
          <button className="logtime-btn logtime-btn-primary" disabled={!canSave} onClick={handleSave}>
            {t('Save', 'Salvează')}
          </button>
        </div>
      </motion.div>
    </>
  );
}
