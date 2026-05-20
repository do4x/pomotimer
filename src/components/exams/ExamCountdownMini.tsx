import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { EXAMS, daysUntil, examProgress, type Exam } from '../../types/exams';
import { useT } from '../../i18n/i18n';
import './ExamCountdownMini.css';

interface Props {
  onClick: () => void;
}

const SIZE = 44;
const STROKE = 2.5;
const GLOW_STROKE = 6;
const RADIUS = (SIZE - GLOW_STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STORAGE_KEY = 'pomotimer.examMini.pos';

interface SavedPos {
  x: number;
  y: number;
}

function loadPos(): SavedPos {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { x: 0, y: 0 };
}

function savePos(pos: SavedPos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // ignore
  }
}

export function ExamCountdownMini({ onClick }: Props) {
  const t = useT();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [initialPos] = useState<SavedPos>(loadPos);
  const x = useMotionValue(initialPos.x);
  const y = useMotionValue(initialPos.y);
  const draggedRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      const el = constraintsRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const maxX = rect.width / 2 - 60;
      const maxY = rect.height - 60;
      const minX = -rect.width / 2 + 60;
      if (x.get() > maxX) x.set(maxX);
      if (x.get() < minX) x.set(minX);
      if (y.get() > maxY) y.set(maxY);
      if (y.get() < 0) y.set(0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x, y]);

  return (
    <div ref={constraintsRef} className="exam-mini-bounds">
      <motion.button
        type="button"
        className="exam-mini"
        onClick={() => {
          if (draggedRef.current) {
            draggedRef.current = false;
            return;
          }
          onClick();
        }}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.18}
        dragMomentum
        dragTransition={{ bounceStiffness: 520, bounceDamping: 28, power: 0.18, timeConstant: 220 }}
        whileDrag={{ scale: 1.04, cursor: 'grabbing' }}
        whileTap={{ scale: 0.98 }}
        onDragStart={() => { draggedRef.current = true; }}
        onDragEnd={() => savePos({ x: x.get(), y: y.get() })}
        style={{ x, y }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        aria-label={t('Show exam countdown · drag to move', 'Arată countdown · trage pentru a muta')}
      >
        {EXAMS.map((exam, i) => (
          <MiniCircle key={exam.id} exam={exam} delay={0.15 + i * 0.08} />
        ))}
      </motion.button>
    </div>
  );
}

function MiniCircle({ exam, delay }: { exam: Exam; delay: number }) {
  const t = useT();
  const days = daysUntil(exam.date);
  const progress = examProgress(exam.date);
  const targetDashOffset = CIRCUMFERENCE * (1 - progress);

  const label = exam.id === 'bac'
    ? t('BAC', 'BAC')
    : t('POLI', 'POLI');

  return (
    <div className="exam-mini-entry">
      <div className="exam-mini-circle">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={STROKE}
          />
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
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay }}
            style={{
              rotate: '-90deg',
              transformOrigin: 'center',
              filter: `drop-shadow(0 0 2px ${exam.color}) drop-shadow(0 0 5px ${exam.glow}AA)`,
            }}
          />
        </svg>
        <div className="exam-mini-days">{days}</div>
      </div>
      <div className="exam-mini-label" style={{ color: exam.glow }}>{label}</div>
    </div>
  );
}
