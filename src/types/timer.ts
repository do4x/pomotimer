export type TimerPhase =
  | 'idle'
  | 'timerA'
  | 'shortBreak'
  | 'timerB'
  | 'cycleComplete'
  | 'longBreak';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  phase: TimerPhase;
  status: TimerStatus;
  timeRemaining: number; // seconds
  totalTime: number; // seconds for current phase
  cycleCount: number;
  completedCycles: number;
}

export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TICK' }
  | { type: 'SKIP' }
  | { type: 'RESET' }
  | { type: 'PHASE_COMPLETE' }
  | { type: 'SET_SETTINGS'; payload: TimerSettings };

export interface TimerSettings {
  timerADuration: number; // minutes
  timerBDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  cyclesBeforeLongBreak: number;
  autoStartTimers: boolean;
  autoStartBreaks: boolean;
  timerALabel: string;
  timerBLabel: string;
}
