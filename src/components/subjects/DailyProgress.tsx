import { motion } from 'motion/react';
import { SUBJECTS, subjectName } from '../../types/subject';
import type { DailySubjectRecord } from '../../types/stats';
import { useT, useLang } from '../../i18n/i18n';
import './WeeklyProgress.css';

interface Props {
  goals: Record<string, number>;        // daily target hours per subject
  todayBySubject: DailySubjectRecord;   // today's seconds per subject
}

function colorForPct(pct: number, base: string): string {
  if (pct >= 1) return '#22c55e';
  if (pct < 0.5) return '#ef4444';
  return base;
}

export function DailyProgress({ goals, todayBySubject }: Props) {
  const t = useT();
  const lang = useLang();

  return (
    <div className="weekly-progress">
      <div className="weekly-progress-header">
        <span className="weekly-progress-title">{t('Today', 'Azi')}</span>
        <span className="weekly-progress-sub">{t('hours / goal', 'ore / obiectiv')}</span>
      </div>
      <div className="weekly-progress-list">
        {SUBJECTS.map(subject => {
          const seconds = todayBySubject[subject.id] || 0;
          const hours = seconds / 3600;
          const target = goals[subject.id] || 0;
          const pct = target > 0 ? hours / target : 0;
          const fillColor = colorForPct(pct, subject.color);
          const widthPct = Math.min(pct, 1) * 100;
          return (
            <div key={subject.id} className="weekly-row">
              <div className="weekly-row-head">
                <span className="weekly-row-dot" style={{ backgroundColor: subject.color }} />
                <span className="weekly-row-name">{subjectName(subject.id, lang)}</span>
                <span className="weekly-row-num">
                  <span className="weekly-row-hours">{hours.toFixed(1)}h</span>
                  <span className="weekly-row-sep">/</span>
                  <span className="weekly-row-target">{target}h</span>
                </span>
              </div>
              <div className="weekly-row-track">
                <motion.div
                  className="weekly-row-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%`, backgroundColor: fillColor }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
