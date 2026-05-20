import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { useTimerMachine, PRE_END_THRESHOLD_SECONDS } from './hooks/useTimerMachine';
import { useSettings } from './hooks/useSettings';
import { useTaskStore } from './hooks/useTaskStore';
import { useResourceStore } from './hooks/useResourceStore';
import { useStudyStats } from './hooks/useStudyStats';
import { useActiveSubject } from './hooks/useActiveSubject';
import { useNotifier } from './hooks/useNotifier';
import { CircularTimer } from './components/timer/CircularTimer';
import { ControlButtons } from './components/timer/ControlButtons';
import { PhaseIndicator } from './components/timer/PhaseIndicator';
import { CycleCounter } from './components/timer/CycleCounter';
import { PreEndBanner } from './components/timer/PreEndBanner';
import { TaskListPanel } from './components/tasks/TaskListPanel';
import { SettingsOverlay } from './components/settings/SettingsOverlay';
import { ResourceSidebar } from './components/sidebar/ResourceSidebar';
import { StreakSidebar } from './components/stats/StreakSidebar';
import { SubjectPicker } from './components/subjects/SubjectPicker';
import { LogTimeModal } from './components/log/LogTimeModal';
import { ExamCountdownIntro } from './components/exams/ExamCountdownIntro';
import { ExamCountdownMini } from './components/exams/ExamCountdownMini';
import { hasAnyUpcomingExam } from './types/exams';
import { PHASE_LABELS } from './utils/constants';
import { getSubject, SUBJECTS, subjectName } from './types/subject';
import { LanguageProvider, useT } from './i18n/i18n';
import './styles/tokens.css';
import './styles/glass.css';
import './App.css';

function AppInner({ settings, updateSettings }: { settings: ReturnType<typeof useSettings>['settings']; updateSettings: ReturnType<typeof useSettings>['updateSettings'] }) {
  const t = useT();
  const {
    state, start, pause, resume, skip, reset,
    armOvertime, endOvertime, markPreEndNotified,
  } = useTimerMachine(settings);
  const { activeId, setActive } = useActiveSubject();
  const activeSubject = getSubject(activeId) || SUBJECTS[0];
  const { tasksFor, allCompleted, addTask, completeTask, deleteTask } = useTaskStore();
  const { resourcesFor, addResource, removeResource } = useResourceStore();
  const studyStats = useStudyStats(state.phase, state.status, activeSubject.id, state.overtime);
  const { notifyPreEnd } = useNotifier();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logTimeOpen, setLogTimeOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => hasAnyUpcomingExam());

  // Pre-end notification + banner trigger at 30s left in a focus phase.
  useEffect(() => {
    if (
      state.phase === 'focus' &&
      state.status === 'running' &&
      !state.overtime &&
      !state.preEndNotified &&
      state.timeRemaining === PRE_END_THRESHOLD_SECONDS
    ) {
      notifyPreEnd(subjectName(activeSubject.id, settings.language), PRE_END_THRESHOLD_SECONDS);
      markPreEndNotified();
    }
  }, [state.phase, state.status, state.overtime, state.preEndNotified, state.timeRemaining, activeSubject.id, settings.language, notifyPreEnd, markPreEndNotified]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (showIntro) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.status === 'running') pause();
        else if (state.status === 'paused') resume();
        else if (state.status === 'idle') start();
      }
      if (e.code === 'Escape') {
        setSettingsOpen(false);
        setLogTimeOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.status, pause, resume, start, showIntro]);

  // Sound on phase change
  const playSound = useCallback(() => {
    if (!settings.soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(680, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(settings.soundVolume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* ignore audio errors */ }
  }, [settings.soundEnabled, settings.soundVolume]);

  const [prevPhase, setPrevPhase] = useState(state.phase);
  useEffect(() => {
    if (state.phase !== prevPhase && state.phase !== 'idle') {
      playSound();
    }
    setPrevPhase(state.phase);
  }, [state.phase, prevPhase, playSound]);

  const phaseLabel =
    state.phase === 'focus' ? subjectName(activeSubject.id, settings.language) :
    state.phase === 'shortBreak' ? t('Break', 'Pauză') :
    state.phase === 'longBreak' ? t('Long Break', 'Pauză lungă') :
    state.phase === 'cycleComplete' ? t('Cycle Complete', 'Ciclu complet') :
    state.phase === 'idle' ? t('Ready', 'Gata') :
    PHASE_LABELS[state.phase] || 'Ready';

  const showPreEndBanner =
    state.phase === 'focus' &&
    state.status === 'running' &&
    state.preEndNotified &&
    !state.overtimeArmed &&
    !state.overtime &&
    state.timeRemaining > 0;

  return (
    <div className="app">
      <button
        className="hamburger-btn"
        onClick={() => setSettingsOpen(true)}
        aria-label={t('Open settings', 'Deschide setările')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {hasAnyUpcomingExam() && !showIntro && (
        <ExamCountdownMini onClick={() => setShowIntro(true)} />
      )}

      <main className="main-content">
        <SubjectPicker activeId={activeSubject.id} onPick={setActive} />

        <PhaseIndicator phase={state.phase} activeSubject={activeSubject} />

        <CircularTimer
          timeRemaining={state.timeRemaining}
          totalTime={state.totalTime}
          phase={state.phase}
          status={state.status}
          phaseLabel={phaseLabel}
          activeSubject={activeSubject}
          overtime={state.overtime}
          overtimeSeconds={state.overtimeSeconds}
        />

        <ControlButtons
          phase={state.phase}
          status={state.status}
          activeSubject={activeSubject}
          overtime={state.overtime}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onSkip={skip}
          onReset={reset}
          onEndOvertime={endOvertime}
        />

        <CycleCounter
          completedCycles={state.completedCycles}
          totalCycles={settings.cyclesBeforeLongBreak}
          phase={state.phase}
          activeSubject={activeSubject}
        />

        <TaskListPanel
          activeSubject={activeSubject}
          tasks={tasksFor(activeSubject.id)}
          allCompleted={allCompleted(activeSubject.id)}
          onAddTask={addTask}
          onCompleteTask={completeTask}
          onDeleteTask={deleteTask}
        />
      </main>

      <AnimatePresence>
        {showIntro && (
          <ExamCountdownIntro onDismiss={() => setShowIntro(false)} />
        )}
        {showPreEndBanner && (
          <PreEndBanner
            subjectName={subjectName(activeSubject.id, settings.language)}
            secondsLeft={state.timeRemaining}
            onDismiss={markPreEndNotified}
            onArmOvertime={armOvertime}
          />
        )}
        {logTimeOpen && (
          <LogTimeModal
            onClose={() => setLogTimeOpen(false)}
            onSave={(date, subjectId, seconds) => studyStats.addManualSeconds(date, subjectId, seconds)}
          />
        )}
      </AnimatePresence>

      <SettingsOverlay
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
        streakGoalMinutes={studyStats.streakGoalMinutes}
        onStreakGoalChange={studyStats.updateGoal}
      />

      <StreakSidebar
        todaySeconds={studyStats.todaySeconds}
        todayBySubject={studyStats.todayBySubject}
        streak={studyStats.streak}
        streakGoalMinutes={studyStats.streakGoalMinutes}
        weekData={studyStats.weekData}
        allRecords={studyStats.allRecords}
        dailyRecords={studyStats.dailyRecords}
        subjectGoals={settings.subjectGoals}
        subjectDailyGoals={settings.subjectDailyGoals}
        phase={state.phase}
        activeSubject={activeSubject}
        onOpenLogTime={() => setLogTimeOpen(true)}
      />

      <ResourceSidebar
        activeSubject={activeSubject}
        resources={resourcesFor(activeSubject.id)}
        onAddResource={addResource}
        onRemoveResource={removeResource}
      />
    </div>
  );
}

function App() {
  const { settings, updateSettings } = useSettings();
  return (
    <LanguageProvider value={settings.language}>
      <AppInner settings={settings} updateSettings={updateSettings} />
    </LanguageProvider>
  );
}

export default App;
