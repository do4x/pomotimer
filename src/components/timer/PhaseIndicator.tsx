import { motion } from 'motion/react';
import type { TimerPhase } from '../../types/timer';
import type { Subject } from '../../types/subject';
import { getPhaseColors, PHASE_COLORS } from '../../utils/constants';
import './PhaseIndicator.css';

interface Props {
  phase: TimerPhase;
  activeSubject: Subject | null;
}

export function PhaseIndicator({ phase, activeSubject }: Props) {
  const focusActive = phase === 'focus';
  const breakActive = phase === 'shortBreak' || phase === 'longBreak';
  const focusColor = getPhaseColors('focus', activeSubject);

  return (
    <div className="phase-indicator">
      <motion.div
        className={`phase-pip ${focusActive ? 'phase-pip-active' : ''}`}
        animate={{
          backgroundColor: focusActive ? focusColor.primary : 'rgba(255,255,255,0.08)',
          scale: focusActive ? 1 : 0.9,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="phase-pip-label">{activeSubject?.name || 'Focus'}</span>
      </motion.div>
      <motion.div
        className={`phase-pip ${breakActive ? 'phase-pip-active' : ''}`}
        animate={{
          backgroundColor: breakActive ? PHASE_COLORS.shortBreak.primary : 'rgba(255,255,255,0.08)',
          scale: breakActive ? 1 : 0.9,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="phase-pip-label">Break</span>
      </motion.div>
    </div>
  );
}
