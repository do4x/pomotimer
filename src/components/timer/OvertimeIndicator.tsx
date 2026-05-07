import { motion } from 'motion/react';
import './OvertimeIndicator.css';

interface Props {
  color: string;
}

export function OvertimeIndicator({ color }: Props) {
  return (
    <motion.div
      className="overtime-indicator"
      style={{ color, borderColor: color }}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="overtime-dot" style={{ backgroundColor: color }} />
      OVERTIME
    </motion.div>
  );
}
