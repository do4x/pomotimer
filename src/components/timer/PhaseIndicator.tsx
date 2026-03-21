import { motion } from 'motion/react';
import type { TimerPhase } from '../../types/timer';
import { PHASE_COLORS } from '../../utils/constants';
import './PhaseIndicator.css';

interface Props {
  phase: TimerPhase;
  timerALabel: string;
  timerBLabel: string;
}

const phases: { key: TimerPhase; fallbackLabel: string }[] = [
  { key: 'timerA', fallbackLabel: 'A' },
  { key: 'shortBreak', fallbackLabel: '·' },
  { key: 'timerB', fallbackLabel: 'B' },
];

export function PhaseIndicator({ phase, timerALabel, timerBLabel }: Props) {
  const getLabel = (key: TimerPhase) => {
    if (key === 'timerA') return timerALabel;
    if (key === 'timerB') return timerBLabel;
    return 'Break';
  };

  const isActive = (key: TimerPhase) => {
    if (key === 'shortBreak') return phase === 'shortBreak' || phase === 'longBreak';
    return phase === key;
  };

  return (
    <div className="phase-indicator">
      {phases.map(({ key }) => {
        const active = isActive(key);
        const colors = PHASE_COLORS[key] || PHASE_COLORS.idle;

        return (
          <motion.div
            key={key}
            className={`phase-pip ${active ? 'phase-pip-active' : ''}`}
            animate={{
              backgroundColor: active ? colors.primary : 'rgba(255,255,255,0.08)',
              scale: active ? 1 : 0.9,
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="phase-pip-label">{getLabel(key)}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
