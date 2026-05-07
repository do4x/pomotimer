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
  // Overtime
  overtime: boolean;
  overtimeSeconds: number;
  overtimeArmed: boolean;     // user clicked "Overtime" while pre-end banner was showing
  preEndNotified: boolean;    // dedupe pre-end notification per phase
}

export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TICK' }
  | { type: 'SKIP' }
  | { type: 'RESET' }
  | { type: 'ARM_OVERTIME' }
  | { type: 'END_OVERTIME' }
  | { type: 'MARK_PRE_END_NOTIFIED' };
