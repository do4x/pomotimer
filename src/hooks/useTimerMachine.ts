import { useReducer, useRef, useCallback, useEffect } from 'react';
import type { TimerState, TimerAction, TimerPhase } from '../types/timer';
import type { AppSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';

function getPhaseTime(phase: TimerPhase, settings: AppSettings): number {
  switch (phase) {
    case 'timerA': return settings.timerADuration * 60;
    case 'timerB': return settings.timerBDuration * 60;
    case 'shortBreak': return settings.shortBreakDuration * 60;
    case 'longBreak': return settings.longBreakDuration * 60;
    default: return 0;
  }
}

function getNextPhase(state: TimerState, settings: AppSettings): { phase: TimerPhase; autoStart: boolean } {
  switch (state.phase) {
    case 'idle':
      return { phase: 'timerA', autoStart: true };
    case 'timerA':
      return { phase: 'shortBreak', autoStart: settings.autoStartBreaks };
    case 'shortBreak':
      return { phase: 'timerB', autoStart: settings.autoStartTimers };
    case 'timerB': {
      const newCompleted = state.completedCycles + 1;
      if (newCompleted > 0 && newCompleted % settings.cyclesBeforeLongBreak === 0) {
        return { phase: 'longBreak', autoStart: settings.autoStartBreaks };
      }
      return { phase: 'cycleComplete', autoStart: settings.autoLoopCycles };
    }
    case 'cycleComplete':
      return { phase: 'timerA', autoStart: settings.autoLoopCycles };
    case 'longBreak':
      return { phase: 'timerA', autoStart: settings.autoLoopCycles };
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
};

function createReducer(settings: AppSettings) {
  return function timerReducer(state: TimerState, action: TimerAction): TimerState {
    switch (action.type) {
      case 'START': {
        const phase: TimerPhase = state.phase === 'idle' ? 'timerA' : state.phase;
        const totalTime = getPhaseTime(phase, settings);
        return {
          ...state,
          phase,
          status: 'running',
          timeRemaining: totalTime,
          totalTime,
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
        const newTime = state.timeRemaining - 1;
        if (newTime <= 0) {
          // Phase complete — transition
          const isTimerB = state.phase === 'timerB';
          const newCompletedCycles = isTimerB ? state.completedCycles + 1 : state.completedCycles;
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
              cycleCount: state.cycleCount + 1,
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
            cycleCount: isTimerB ? state.cycleCount + 1 : state.cycleCount,
          };
        }
        return { ...state, timeRemaining: newTime };
      }

      case 'SKIP': {
        const isTimerB = state.phase === 'timerB';
        const newCompletedCycles = isTimerB ? state.completedCycles + 1 : state.completedCycles;
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
            cycleCount: state.cycleCount + 1,
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
          cycleCount: isTimerB ? state.cycleCount + 1 : state.cycleCount,
        };
      }

      case 'RESET':
        return { ...initialState };

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

  // Track phase changes for callbacks
  const phaseChanged = state.phase !== prevPhaseRef.current;
  const previousPhase = prevPhaseRef.current;
  useEffect(() => {
    prevPhaseRef.current = state.phase;
  }, [state.phase]);

  // Tick interval
  useEffect(() => {
    if (state.status === 'running') {
      intervalRef.current = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.status]);

  return {
    state,
    start,
    pause,
    resume,
    skip,
    reset,
    phaseChanged,
    previousPhase,
  };
}
