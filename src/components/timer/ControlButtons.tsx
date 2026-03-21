import { motion } from 'motion/react';
import type { TimerPhase, TimerStatus } from '../../types/timer';
import { PHASE_COLORS } from '../../utils/constants';
import './ControlButtons.css';

interface Props {
  phase: TimerPhase;
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReset: () => void;
}

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export function ControlButtons({ phase, status, onStart, onPause, onResume, onSkip, onReset }: Props) {
  const colors = PHASE_COLORS[phase] || PHASE_COLORS.idle;

  return (
    <div className="control-buttons">
      {status === 'idle' && (
        <motion.button
          className="control-btn control-btn-primary"
          style={{ '--btn-color': colors.primary, '--btn-glow': colors.glow } as React.CSSProperties}
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          onClick={onStart}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
          <span>Start</span>
        </motion.button>
      )}

      {status === 'running' && (
        <motion.button
          className="control-btn control-btn-primary"
          style={{ '--btn-color': colors.primary, '--btn-glow': colors.glow } as React.CSSProperties}
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          onClick={onPause}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          <span>Pause</span>
        </motion.button>
      )}

      {status === 'paused' && (
        <motion.button
          className="control-btn control-btn-primary"
          style={{ '--btn-color': colors.primary, '--btn-glow': colors.glow } as React.CSSProperties}
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          onClick={onResume}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
          <span>Resume</span>
        </motion.button>
      )}

      {status !== 'idle' && (
        <>
          <motion.button
            className="control-btn control-btn-secondary"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={onSkip}
            title="Skip to next phase"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
            </svg>
          </motion.button>

          <motion.button
            className="control-btn control-btn-secondary"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={onReset}
            title="Reset"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
          </motion.button>
        </>
      )}
    </div>
  );
}
