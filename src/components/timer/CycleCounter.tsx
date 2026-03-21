import { motion } from 'motion/react';
import { PHASE_COLORS } from '../../utils/constants';
import type { TimerPhase } from '../../types/timer';
import './CycleCounter.css';

interface Props {
  completedCycles: number;
  totalCycles: number;
  phase: TimerPhase;
}

export function CycleCounter({ completedCycles, totalCycles, phase }: Props) {
  const colors = PHASE_COLORS[phase] || PHASE_COLORS.idle;

  return (
    <div className="cycle-counter">
      <span className="cycle-label">Cycles</span>
      <div className="cycle-dots">
        {Array.from({ length: totalCycles }, (_, i) => (
          <motion.div
            key={i}
            className="cycle-dot"
            animate={{
              backgroundColor: i < completedCycles ? colors.primary : 'rgba(255,255,255,0.1)',
              scale: i < completedCycles ? 1 : 0.8,
            }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}
      </div>
      <span className="cycle-count">{completedCycles}/{totalCycles}</span>
    </div>
  );
}
