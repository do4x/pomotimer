import { motion } from 'motion/react';
import { useT } from '../../i18n/i18n';
import './CompletionBanner.css';

interface Props {
  accentColor: string;
}

export function CompletionBanner({ accentColor }: Props) {
  const t = useT();
  return (
    <motion.div
      className="completion-banner"
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="completion-icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>
      <motion.span
        className="completion-text"
        style={{ color: accentColor }}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {t('Well done', 'Bravo')}
      </motion.span>
    </motion.div>
  );
}
