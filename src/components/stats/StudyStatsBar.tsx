import { motion } from 'motion/react';
import type { TimerPhase } from '../../types/timer';
import { PHASE_COLORS } from '../../utils/constants';
import './StudyStatsBar.css';

interface DayData {
  label: string;
  seconds: number;
  date: string;
}

interface Props {
  todaySeconds: number;
  streak: number;
  streakGoalMinutes: number;
  weekData: DayData[];
  phase: TimerPhase;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function StudyStatsBar({ todaySeconds, streak, streakGoalMinutes, weekData, phase }: Props) {
  const colors = PHASE_COLORS[phase] || PHASE_COLORS.idle;
  const goalSeconds = streakGoalMinutes * 60;
  const todayProgress = Math.min(todaySeconds / goalSeconds, 1);
  const maxWeekSeconds = Math.max(...weekData.map(d => d.seconds), goalSeconds);

  return (
    <div className="study-stats-bar">
      {/* Today's progress */}
      <div className="stats-today">
        <div className="stats-today-header">
          <span className="stats-label">Today</span>
          <span className="stats-value">{formatDuration(todaySeconds)}</span>
        </div>
        <div className="stats-progress-track">
          <motion.div
            className="stats-progress-fill"
            animate={{
              width: `${todayProgress * 100}%`,
              backgroundColor: todayProgress >= 1 ? '#22c55e' : colors.primary,
            }}
            transition={{ duration: 0.5 }}
          />
          <div
            className="stats-progress-goal"
            style={{ left: '100%' }}
          />
        </div>
        <span className="stats-goal-label">Goal: {streakGoalMinutes}m</span>
      </div>

      {/* Streak */}
      <div className="stats-streak">
        <motion.div
          className="stats-streak-flame"
          animate={{
            scale: streak > 0 ? [1, 1.15, 1] : 1,
            opacity: streak > 0 ? 1 : 0.3,
          }}
          transition={{
            duration: 1.5,
            repeat: streak > 0 ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C12 2 7 8 7 13C7 16.866 9.239 19 12 19C14.761 19 17 16.866 17 13C17 8 12 2 12 2Z"
              fill={streak > 0 ? '#F59E0B' : '#64748B'}
              stroke={streak > 0 ? '#F97316' : '#475569'}
              strokeWidth="1.5"
            />
            <path
              d="M12 10C12 10 10 13 10 15C10 16.657 10.895 17.5 12 17.5C13.105 17.5 14 16.657 14 15C14 13 12 10 12 10Z"
              fill={streak > 0 ? '#FBBF24' : '#94A3B8'}
            />
          </svg>
        </motion.div>
        <div className="stats-streak-info">
          <span className="stats-streak-count">{streak}</span>
          <span className="stats-streak-label">day{streak !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Week chart */}
      <div className="stats-week">
        {weekData.map((day, i) => {
          const height = maxWeekSeconds > 0 ? (day.seconds / maxWeekSeconds) * 100 : 0;
          const metGoal = day.seconds >= goalSeconds;
          const isToday = i === weekData.length - 1;
          return (
            <div key={day.date} className={`stats-week-day ${isToday ? 'is-today' : ''}`}>
              <div className="stats-week-bar-track">
                <motion.div
                  className="stats-week-bar-fill"
                  initial={{ height: 0 }}
                  animate={{
                    height: `${Math.max(height, 2)}%`,
                    backgroundColor: metGoal ? '#22c55e' : colors.primary,
                  }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                />
              </div>
              <span className="stats-week-label">{day.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
