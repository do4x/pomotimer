export type TimerPhase =
  | 'idle'
  | 'focus'
  | 'shortBreak'
  | 'cycleComplete'
  | 'longBreak';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  phase: TimerPhase;
  status: TimerStatus;
  timeRemaining: number;
  totalTime: number;
  cycleCount: number;
  completedCycles: number;
}

export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TICK' }
  | { type: 'SKIP' }
  | { type: 'RESET' };
