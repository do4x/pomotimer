import { motion } from 'motion/react';
import './PreEndBanner.css';

interface Props {
  subjectName: string;
  secondsLeft: number;
  onDismiss: () => void;
  onArmOvertime: () => void;
}

export function PreEndBanner({ subjectName, secondsLeft, onDismiss, onArmOvertime }: Props) {
  return (
    <motion.div
      className="pre-end-banner glass-panel"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pre-end-content">
        <span className="pre-end-pulse" />
        <div className="pre-end-text">
          <span className="pre-end-headline">{subjectName} ends in {secondsLeft}s</span>
          <span className="pre-end-sub">Need more time?</span>
        </div>
      </div>
      <div className="pre-end-actions">
        <button className="pre-end-btn pre-end-dismiss" onClick={onDismiss}>Dismiss</button>
        <button className="pre-end-btn pre-end-overtime" onClick={onArmOvertime}>Overtime</button>
      </div>
    </motion.div>
  );
}
