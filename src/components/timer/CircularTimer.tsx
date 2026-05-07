import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect, useRef } from 'react';
import type { TimerPhase } from '../../types/timer';
import type { Subject } from '../../types/subject';
import { getPhaseColors } from '../../utils/constants';
import { formatTime } from '../../utils/formatTime';
import './CircularTimer.css';

interface Props {
  timeRemaining: number;
  totalTime: number;
  phase: TimerPhase;
  status: 'idle' | 'running' | 'paused';
  phaseLabel: string;
  activeSubject: Subject | null;
}

const SIZE = 280;
const STROKE = 6;
const GLOW_STROKE = 10;
const RADIUS = (SIZE - GLOW_STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularTimer({ timeRemaining, totalTime, phase, status, phaseLabel, activeSubject }: Props) {
  const colors = getPhaseColors(phase, activeSubject);
  const progress = useMotionValue(totalTime > 0 ? 1 - timeRemaining / totalTime : 0);
  const dashOffset = useTransform(progress, [0, 1], [CIRCUMFERENCE, 0]);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    const target = totalTime > 0 ? 1 - timeRemaining / totalTime : 0;
    animate(progress, target, { duration: 0.5, ease: 'easeOut' });
  }, [timeRemaining, totalTime, progress]);

  const phaseChanged = phase !== prevPhaseRef.current;
  useEffect(() => {
    prevPhaseRef.current = phase;
  }, [phase]);

  return (
    <div className="circular-timer">
      <motion.div
        className="timer-ambient-glow"
        animate={{ background: `radial-gradient(circle, ${colors.primary}20 0%, transparent 70%)` }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="timer-svg">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />

        <motion.circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none" stroke={colors.glow} strokeWidth={GLOW_STROKE} strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: dashOffset, rotate: '-90deg', transformOrigin: 'center', filter: 'blur(8px)', opacity: 0.4 }}
        />

        <motion.circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none" animate={{ stroke: colors.primary }} transition={{ duration: 0.6 }}
          strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: dashOffset, rotate: '-90deg', transformOrigin: 'center' }}
        />

        {status === 'running' && totalTime > 0 && (
          <motion.circle
            cx={SIZE / 2} cy={SIZE / 2} r={4} fill={colors.glow}
            style={{ filter: 'blur(2px)', opacity: 0.8 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </svg>

      <div className="timer-center">
        <motion.div
          className="timer-time"
          key={phase}
          initial={phaseChanged ? { scale: 0.9, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {status === 'idle' && phase === 'idle' ? '--:--' : formatTime(timeRemaining)}
        </motion.div>

        <motion.div
          className="timer-phase-label"
          animate={{ color: colors.text }}
          transition={{ duration: 0.6 }}
        >
          {phaseLabel}
        </motion.div>

        {status === 'paused' && (
          <motion.div
            className="timer-paused-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            PAUSED
          </motion.div>
        )}
      </div>
    </div>
  );
}
