import { useEffect } from 'react';
import { motion } from 'motion/react';
import { EXAMS, daysUntil, examProgress, type Exam } from '../../types/exams';
import { useT, useLang } from '../../i18n/i18n';
import './ExamCountdownIntro.css';

interface Props {
  onDismiss: () => void;
}

export function ExamCountdownIntro({ onDismiss }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      onDismiss();
    };
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [onDismiss]);

  const t = useT();

  return (
    <motion.div
      className="exam-intro"
      role="dialog"
      aria-modal="true"
      onClick={onDismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="exam-intro-bg" />

      <motion.div
        className="exam-intro-content"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      >
        <div className="exam-intro-title">{t('Your exams', 'Examenele tale')}</div>

        <div className="exam-intro-circles">
          {EXAMS.map((exam, i) => (
            <ExamCircle key={exam.id} exam={exam} delay={0.15 + i * 0.1} />
          ))}
        </div>

        <div className="exam-intro-hint">
          {t('Press any key to continue', 'Apasă orice tastă pentru a continua')}
        </div>
      </motion.div>
    </motion.div>
  );
}

const SIZE = 220;
const STROKE = 4;
const GLOW_STROKE = 10;
const RADIUS = (SIZE - GLOW_STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ExamCircle({ exam, delay }: { exam: Exam; delay: number }) {
  const t = useT();
  const lang = useLang();
  const days = daysUntil(exam.date);
  const progress = examProgress(exam.date);
  const targetDashOffset = CIRCUMFERENCE * (1 - progress);

  const nameLabel =
    exam.id === 'bac'
      ? t('BAC', 'BAC')
      : t('College Entrance', 'Politehnica');

  const dateLabel = new Intl.DateTimeFormat(lang === 'ro' ? 'ro-RO' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(exam.date);

  const daysWord = lang === 'ro' ? (days === 1 ? 'zi' : 'zile') : (days === 1 ? 'day' : 'days');
  const percent = Math.round(progress * 100);
  const progressPct = progress * 100;
  const fadeSpan = 6;
  const fadeStart = Math.max(0, progressPct - fadeSpan);
  const tipMask = `conic-gradient(#000 0%, #000 ${fadeStart}%, transparent ${progressPct}%, transparent 100%)`;

  return (
    <motion.div
      className="exam-circle"
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <div
        className="exam-circle-ambient"
        style={{ background: `radial-gradient(circle, ${exam.glow}1F 0%, transparent 65%)` }}
      />

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="exam-circle-svg">
        {/* faint background ring */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />
      </svg>

      <div
        className="exam-circle-progress"
        style={{ maskImage: tipMask, WebkitMaskImage: tipMask }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={exam.color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: targetDashOffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: delay + 0.1 }}
            style={{
              rotate: '-90deg',
              transformOrigin: 'center',
              filter: `drop-shadow(0 0 3px ${exam.color}) drop-shadow(0 0 8px ${exam.glow}CC) drop-shadow(0 0 18px ${exam.glow}66)`,
            }}
          />
        </svg>
      </div>

      <div className="exam-circle-center">
        <div className="exam-circle-days">{days}</div>
        <div className="exam-circle-unit" style={{ color: exam.glow }}>{daysWord}</div>
        <div className="exam-circle-percent">{percent}%</div>
      </div>

      <div className="exam-circle-footer">
        <div className="exam-circle-name" style={{ color: exam.glow }}>{nameLabel}</div>
        <div className="exam-circle-date">{dateLabel}</div>
      </div>
    </motion.div>
  );
}
