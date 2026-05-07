import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { TimerPhase } from '../../types/timer';
import type { Subject } from '../../types/subject';
import type { DailySubjectRecord } from '../../types/stats';
import { getPhaseColors, PHASE_COLORS } from '../../utils/constants';
import { WeeklyProgress } from '../subjects/WeeklyProgress';
import './StreakSidebar.css';

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
  allRecords: Record<string, number>;
  dailyRecords: Record<string, DailySubjectRecord>;
  subjectGoals: Record<string, number>;
  phase: TimerPhase;
  activeSubject: Subject | null;
}

type ViewMode = 'daily' | 'calendar';

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === toDateKey(today)) return 'Today';
  if (dateStr === toDateKey(yesterday)) return 'Yesterday';

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Get sorted daily records (most recent first)
function getSortedDays(records: Record<string, number>): { date: string; seconds: number }[] {
  return Object.entries(records)
    .filter(([, s]) => s > 0)
    .map(([date, seconds]) => ({ date, seconds }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function StreakSidebar({ todaySeconds, streak, streakGoalMinutes, weekData, allRecords, dailyRecords, subjectGoals, phase, activeSubject }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ViewMode>('daily');
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const closeTimeout = useRef<number | null>(null);

  const colors = getPhaseColors(phase, activeSubject) || PHASE_COLORS.idle;
  const goalSeconds = streakGoalMinutes * 60;
  const todayProgress = Math.min(todaySeconds / goalSeconds, 1);
  const maxWeekSeconds = Math.max(...weekData.map(d => d.seconds), goalSeconds);

  const handleEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setIsOpen(true);
  };

  const handleLeave = () => {
    closeTimeout.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const sortedDays = getSortedDays(allRecords);

  // Calendar data
  const daysInMonth = getDaysInMonth(calMonth.year, calMonth.month);
  const firstDay = getFirstDayOfMonth(calMonth.year, calMonth.month);
  const monthLabel = new Date(calMonth.year, calMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCalMonth(prev => {
      const m = prev.month - 1;
      return m < 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: m };
    });
  };

  const nextMonth = () => {
    setCalMonth(prev => {
      const m = prev.month + 1;
      return m > 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: m };
    });
  };

  return (
    <>
      {/* Hover trigger zone */}
      <div
        className="streak-trigger"
        onMouseEnter={handleEnter}
      />

      {/* Sidebar tab — streak badge */}
      <motion.div
        className="streak-tab"
        animate={{ opacity: isOpen ? 0 : 1 }}
        onMouseEnter={handleEnter}
        style={{ borderColor: streak > 0 ? '#F59E0B' : 'rgba(255,255,255,0.1)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C12 2 7 8 7 13C7 16.866 9.239 19 12 19C14.761 19 17 16.866 17 13C17 8 12 2 12 2Z"
            fill={streak > 0 ? '#F59E0B' : '#64748B'}
            stroke={streak > 0 ? '#F97316' : '#475569'}
            strokeWidth="1.5"
          />
        </svg>
        {streak > 0 && <span className="streak-tab-count">{streak}</span>}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="streak-sidebar glass-panel"
            initial={{ x: -340 }}
            animate={{ x: 0 }}
            exit={{ x: -340 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            {/* Header with streak info */}
            <div className="streak-header">
              <div className="streak-hero">
                <motion.div
                  className="streak-flame-large"
                  animate={{
                    scale: streak > 0 ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: streak > 0 ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
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
                <div className="streak-hero-text">
                  <span className="streak-hero-count">{streak}</span>
                  <span className="streak-hero-label">day streak</span>
                </div>
              </div>

              {/* Today's progress */}
              <div className="streak-today">
                <div className="streak-today-row">
                  <span className="streak-today-label">Today</span>
                  <span className="streak-today-value">{formatDuration(todaySeconds)}</span>
                </div>
                <div className="streak-progress-track">
                  <motion.div
                    className="streak-progress-fill"
                    animate={{
                      width: `${todayProgress * 100}%`,
                      backgroundColor: todayProgress >= 1 ? '#22c55e' : colors.primary,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="streak-goal-text">
                  {todayProgress >= 1 ? 'Goal reached!' : `${formatDuration(goalSeconds - todaySeconds)} to goal`}
                </span>
              </div>

              {/* Mini week chart */}
              <div className="streak-week">
                {weekData.map((day, i) => {
                  const height = maxWeekSeconds > 0 ? (day.seconds / maxWeekSeconds) * 100 : 0;
                  const metGoal = day.seconds >= goalSeconds;
                  const isToday = i === weekData.length - 1;
                  return (
                    <div key={day.date} className={`streak-week-day ${isToday ? 'is-today' : ''}`} title={`${day.label}: ${formatDuration(day.seconds)}`}>
                      <div className="streak-week-bar-track">
                        <motion.div
                          className="streak-week-bar-fill"
                          initial={{ height: 0 }}
                          animate={{
                            height: `${Math.max(height, 3)}%`,
                            backgroundColor: metGoal ? '#22c55e' : colors.primary,
                          }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                        />
                      </div>
                      <span className="streak-week-label">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-subject weekly progress */}
            <WeeklyProgress goals={subjectGoals} dailyRecords={dailyRecords} />

            {/* View toggle */}
            <div className="streak-view-toggle">
              <button
                className={`streak-view-btn ${view === 'daily' ? 'active' : ''}`}
                onClick={() => setView('daily')}
              >
                Day by Day
              </button>
              <button
                className={`streak-view-btn ${view === 'calendar' ? 'active' : ''}`}
                onClick={() => setView('calendar')}
              >
                Calendar
              </button>
            </div>

            {/* Content area */}
            <div className="streak-content">
              {view === 'daily' ? (
                <div className="streak-daily-list">
                  {sortedDays.length === 0 && (
                    <div className="streak-empty">No study sessions yet</div>
                  )}
                  {sortedDays.map(day => {
                    const metGoal = day.seconds >= goalSeconds;
                    return (
                      <div key={day.date} className="streak-daily-item">
                        <div className="streak-daily-indicator" style={{ backgroundColor: metGoal ? '#22c55e' : colors.primary, opacity: metGoal ? 1 : 0.4 }} />
                        <span className="streak-daily-date">{formatDateLabel(day.date)}</span>
                        <span className="streak-daily-duration">{formatDuration(day.seconds)}</span>
                        {metGoal && <span className="streak-daily-check">&#10003;</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="streak-calendar">
                  <div className="streak-cal-nav">
                    <button className="streak-cal-nav-btn" onClick={prevMonth}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <span className="streak-cal-month">{monthLabel}</span>
                    <button className="streak-cal-nav-btn" onClick={nextMonth}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>

                  <div className="streak-cal-header">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={i} className="streak-cal-header-day">{d}</span>
                    ))}
                  </div>

                  <div className="streak-cal-grid">
                    {/* Empty cells for offset */}
                    {Array.from({ length: firstDay }, (_, i) => (
                      <div key={`empty-${i}`} className="streak-cal-cell empty" />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const key = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const seconds = allRecords[key] || 0;
                      const metGoal = seconds >= goalSeconds;
                      const hasData = seconds > 0;
                      const isToday = key === toDateKey(new Date());

                      // Intensity: 0 = none, scale from 0.2 to 1 based on how much over goal
                      const intensity = hasData
                        ? Math.min(seconds / goalSeconds, 1)
                        : 0;

                      return (
                        <div
                          key={key}
                          className={`streak-cal-cell ${isToday ? 'is-today' : ''} ${metGoal ? 'met-goal' : ''}`}
                          title={hasData ? `${formatDateLabel(key)}: ${formatDuration(seconds)}` : undefined}
                        >
                          <div
                            className="streak-cal-cell-bg"
                            style={{
                              backgroundColor: hasData
                                ? metGoal ? '#22c55e' : colors.primary
                                : 'transparent',
                              opacity: hasData ? 0.15 + intensity * 0.55 : 0,
                            }}
                          />
                          <span className="streak-cal-day-num">{day}</span>
                          {metGoal && <div className="streak-cal-dot" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="streak-cal-legend">
                    <span className="streak-cal-legend-label">Less</span>
                    <div className="streak-cal-legend-scale">
                      {[0.15, 0.3, 0.5, 0.7, 1].map((op, i) => (
                        <div
                          key={i}
                          className="streak-cal-legend-box"
                          style={{ backgroundColor: colors.primary, opacity: op }}
                        />
                      ))}
                    </div>
                    <span className="streak-cal-legend-label">More</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
