import { useMemo } from 'react';
import { motion } from 'motion/react';
import { SUBJECTS } from '../../types/subject';
import type { DailySubjectRecord } from '../../types/stats';
import './WeeklyProgress.css';

interface Props {
  goals: Record<string, number>; // weekly target hours per subject
  dailyRecords: Record<string, DailySubjectRecord>;
}

function weekStartKey(now: Date = new Date()): Date {
  const d = new Date(now);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // Monday-anchored
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function colorForPct(pct: number, base: string): string {
  if (pct >= 1) return '#22c55e';
  if (pct < 0.5) return '#ef4444';
  return base;
}

export function WeeklyProgress({ goals, dailyRecords }: Props) {
  const rows = useMemo(() => {
    const start = weekStartKey();
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(dateKey(d));
    }
    return SUBJECTS.map(subject => {
      let totalSeconds = 0;
      for (const k of days) {
        const r = dailyRecords[k];
        if (r && r[subject.id]) totalSeconds += r[subject.id];
      }
      const hours = totalSeconds / 3600;
      const target = goals[subject.id] || 0;
      const pct = target > 0 ? hours / target : 0;
      return { subject, hours, target, pct };
    });
  }, [goals, dailyRecords]);

  return (
    <div className="weekly-progress">
      <div className="weekly-progress-header">
        <span className="weekly-progress-title">This week</span>
        <span className="weekly-progress-sub">hours / goal</span>
      </div>
      <div className="weekly-progress-list">
        {rows.map(({ subject, hours, target, pct }) => {
          const fillColor = colorForPct(pct, subject.color);
          const widthPct = Math.min(pct, 1) * 100;
          return (
            <div key={subject.id} className="weekly-row">
              <div className="weekly-row-head">
                <span className="weekly-row-dot" style={{ backgroundColor: subject.color }} />
                <span className="weekly-row-name">{subject.name}</span>
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
