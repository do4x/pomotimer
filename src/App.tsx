import { useState, useEffect, useCallback } from 'react';
import { useTimerMachine } from './hooks/useTimerMachine';
import { useSettings } from './hooks/useSettings';
import { useTaskStore } from './hooks/useTaskStore';
import { useResourceStore } from './hooks/useResourceStore';
import { CircularTimer } from './components/timer/CircularTimer';
import { ControlButtons } from './components/timer/ControlButtons';
import { PhaseIndicator } from './components/timer/PhaseIndicator';
import { CycleCounter } from './components/timer/CycleCounter';
import { TaskListPanel } from './components/tasks/TaskListPanel';
import { SettingsOverlay } from './components/settings/SettingsOverlay';
import { ResourceSidebar } from './components/sidebar/ResourceSidebar';
import { PHASE_LABELS } from './utils/constants';
import './styles/tokens.css';
import './styles/glass.css';
import './App.css';

function App() {
  const { settings, updateSettings } = useSettings();
  const { state, start, pause, resume, skip, reset } = useTimerMachine(settings);
  const { tasks, addTask, completeTask, deleteTask, allCompleted } = useTaskStore();
  const { resources, addResource, removeResource } = useResourceStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (state.status === 'running') pause();
        else if (state.status === 'paused') resume();
        else if (state.status === 'idle') start();
      }
      if (e.code === 'Escape') {
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.status, pause, resume, start]);

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

  // Detect phase changes for sound
  const [prevPhase, setPrevPhase] = useState(state.phase);
  useEffect(() => {
    if (state.phase !== prevPhase && state.phase !== 'idle') {
      playSound();
    }
    setPrevPhase(state.phase);
  }, [state.phase, prevPhase, playSound]);

  const phaseLabel =
    state.phase === 'timerA' ? settings.timerALabel :
    state.phase === 'timerB' ? settings.timerBLabel :
    PHASE_LABELS[state.phase] || 'Ready';

  return (
    <div className="app">
      {/* Hamburger menu */}
      <button
        className="hamburger-btn"
        onClick={() => setSettingsOpen(true)}
        aria-label="Open settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Main content */}
      <main className="main-content">
        <PhaseIndicator
          phase={state.phase}
          timerALabel={settings.timerALabel}
          timerBLabel={settings.timerBLabel}
        />

        <CircularTimer
          timeRemaining={state.timeRemaining}
          totalTime={state.totalTime}
          phase={state.phase}
          status={state.status}
          phaseLabel={phaseLabel}
        />

        <ControlButtons
          phase={state.phase}
          status={state.status}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onSkip={skip}
          onReset={reset}
        />

        <CycleCounter
          completedCycles={state.completedCycles}
          totalCycles={settings.cyclesBeforeLongBreak}
          phase={state.phase}
        />

        <TaskListPanel
          phase={state.phase}
          tasksA={tasks.A}
          tasksB={tasks.B}
          allCompletedA={allCompleted('A')}
          allCompletedB={allCompleted('B')}
          onAddTask={addTask}
          onCompleteTask={completeTask}
          onDeleteTask={deleteTask}
          timerALabel={settings.timerALabel}
          timerBLabel={settings.timerBLabel}
        />
      </main>

      {/* Settings overlay */}
      <SettingsOverlay
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />

      {/* Resource sidebar */}
      <ResourceSidebar
        phase={state.phase}
        resourcesA={resources.A}
        resourcesB={resources.B}
        onAddResource={addResource}
        onRemoveResource={removeResource}
      />
    </div>
  );
}

export default App;
