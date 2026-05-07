import { motion } from 'motion/react';
import { getPhaseColors } from '../../utils/constants';
import type { TimerPhase } from '../../types/timer';
import type { Subject } from '../../types/subject';
import { useT } from '../../i18n/i18n';
import './CycleCounter.css';

interface Props {
  completedCycles: number;
  totalCycles: number;
  phase: TimerPhase;
  activeSubject: Subject | null;
}

export function CycleCounter({ completedCycles, totalCycles, phase, activeSubject }: Props) {
  const t = useT();
  const colors = getPhaseColors(phase, activeSubject);

  return (
    <div className="cycle-counter">
      <span className="cycle-label">{t('Cycles', 'Cicluri')}</span>
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
