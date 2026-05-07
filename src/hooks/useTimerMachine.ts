import { useReducer, useRef, useCallback, useEffect } from 'react';
import type { TimerState, TimerAction, TimerPhase } from '../types/timer';
import type { AppSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';

export const PRE_END_THRESHOLD_SECONDS = 30;

function getPhaseTime(phase: TimerPhase, settings: AppSettings): number {
  switch (phase) {
    case 'focus': return settings.focusDuration * 60;
    case 'shortBreak': return settings.shortBreakDuration * 60;
    case 'longBreak': return settings.longBreakDuration * 60;
    default: return 0;
  }
}

function getNextPhase(state: TimerState, settings: AppSettings): { phase: TimerPhase; autoStart: boolean } {
  switch (state.phase) {
    case 'idle':
      return { phase: 'focus', autoStart: true };
    case 'focus': {
      const newCompleted = state.completedCycles + 1;
      if (newCompleted > 0 && newCompleted % settings.cyclesBeforeLongBreak === 0) {
        return { phase: 'longBreak', autoStart: settings.autoStartBreaks };
      }
      return { phase: 'shortBreak', autoStart: settings.autoStartBreaks };
    }
    case 'shortBreak':
      return { phase: 'focus', autoStart: settings.autoStartTimers };
    case 'longBreak':
      return { phase: 'cycleComplete', autoStart: false };
    case 'cycleComplete':
      return { phase: 'focus', autoStart: settings.autoLoopCycles };
    default:
      return { phase: 'idle', autoStart: false };
  }
}

const initialState: TimerState = {
  phase: 'idle',
  status: 'idle',
  timeRemaining: 0,
  totalTime: 0,
  cycleCount: 0,
  completedCycles: 0,
  overtime: false,
  overtimeSeconds: 0,
  overtimeArmed: false,
  preEndNotified: false,
};

function advanceFromFocusOrSkip(state: TimerState, settings: AppSettings): TimerState {
  const isFocus = state.phase === 'focus';
  const newCompletedCycles = isFocus ? state.completedCycles + 1 : state.completedCycles;
  const stateWithCycles = { ...state, completedCycles: newCompletedCycles };
  const { phase: nextPhase, autoStart } = getNextPhase(stateWithCycles, settings);

  if (nextPhase === 'cycleComplete' && !settings.autoLoopCycles) {
    return {
      ...state,
      phase: 'cycleComplete',
      status: 'idle',
      timeRemaining: 0,
      totalTime: 0,
      completedCycles: newCompletedCycles,
      cycleCount: state.cycleCount + (isFocus ? 1 : 0),
      overtime: false,
      overtimeSeconds: 0,
      overtimeArmed: false,
      preEndNotified: false,
    };
  }

  const totalTime = getPhaseTime(nextPhase, settings);
  return {
    ...state,
    phase: nextPhase,
    status: autoStart ? 'running' : 'paused',
    timeRemaining: totalTime,
    totalTime,
    completedCycles: newCompletedCycles,
    cycleCount: isFocus ? state.cycleCount + 1 : state.cycleCount,
    overtime: false,
    overtimeSeconds: 0,
    overtimeArmed: false,
    preEndNotified: false,
  };
}

function createReducer(settings: AppSettings) {
  return function timerReducer(state: TimerState, action: TimerAction): TimerState {
    switch (action.type) {
      case 'START': {
        const phase: TimerPhase = state.phase === 'idle' ? 'focus' : state.phase;
        const totalTime = getPhaseTime(phase, settings);
        return {
          ...state,
          phase,
          status: 'running',
          timeRemaining: totalTime,
          totalTime,
          overtime: false,
          overtimeSeconds: 0,
          overtimeArmed: false,
          preEndNotified: false,
        };
      }

      case 'PAUSE':
        if (state.status !== 'running') return state;
        return { ...state, status: 'paused' };

      case 'RESUME':
        if (state.status !== 'paused') return state;
        return { ...state, status: 'running' };

      case 'TICK': {
        if (state.status !== 'running') return state;

        if (state.overtime) {
          return { ...state, overtimeSeconds: state.overtimeSeconds + 1 };
        }

        const newTime = state.timeRemaining - 1;
        if (newTime <= 0) {
          // Phase boundary — if overtime was armed, flip to count-up instead of advancing.
          if (state.overtimeArmed && state.phase === 'focus') {
            return {
              ...state,
              overtime: true,
              overtimeArmed: false,
              overtimeSeconds: 0,
              timeRemaining: 0,
            };
          }
          return advanceFromFocusOrSkip(state, settings);
        }
        return { ...state, timeRemaining: newTime };
      }

      case 'SKIP':
        // Skip during overtime ends overtime cleanly; otherwise normal advance.
        return advanceFromFocusOrSkip(state, settings);

      case 'RESET':
        return { ...initialState };

      case 'ARM_OVERTIME':
        if (state.phase !== 'focus') return state;
        return { ...state, overtimeArmed: true };

      case 'END_OVERTIME':
        if (!state.overtime) return state;
        return advanceFromFocusOrSkip(state, settings);

      case 'MARK_PRE_END_NOTIFIED':
        if (state.preEndNotified) return state;
        return { ...state, preEndNotified: true };

      default:
        return state;
    }
  };
}

export function useTimerMachine(settings: AppSettings = DEFAULT_SETTINGS) {
  const reducerRef = useRef(createReducer(settings));

  useEffect(() => {
    reducerRef.current = createReducer(settings);
  }, [settings]);

  const wrappedReducer = useCallback(
    (state: TimerState, action: TimerAction) => reducerRef.current(state, action),
    []
  );

  const [state, dispatch] = useReducer(wrappedReducer, initialState);
  const intervalRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<TimerPhase>('idle');

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const skip = useCallback(() => dispatch({ type: 'SKIP' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const armOvertime = useCallback(() => dispatch({ type: 'ARM_OVERTIME' }), []);
  const endOvertime = useCallback(() => dispatch({ type: 'END_OVERTIME' }), []);
  const markPreEndNotified = useCallback(() => dispatch({ type: 'MARK_PRE_END_NOTIFIED' }), []);

  const phaseChanged = state.phase !== prevPhaseRef.current;
  const previousPhase = prevPhaseRef.current;
  useEffect(() => {
    prevPhaseRef.current = state.phase;
  }, [state.phase]);

  useEffect(() => {
    if (state.status === 'running') {
      intervalRef.current = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.status]);

  return {
    state,
    start,
    pause,
    resume,
    skip,
    reset,
    armOvertime,
    endOvertime,
    markPreEndNotified,
    phaseChanged,
    previousPhase,
  };
}
