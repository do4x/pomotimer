export interface AppSettings {
  timerADuration: number;
  timerBDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
  autoStartTimers: boolean;
  autoStartBreaks: boolean;
  autoLoopCycles: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  timerALabel: string;
  timerBLabel: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  timerADuration: 40,
  timerBDuration: 20,
  shortBreakDuration: 2,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  autoStartTimers: true,
  autoStartBreaks: true,
  autoLoopCycles: true,
  soundEnabled: true,
  soundVolume: 0.7,
  timerALabel: 'Focus A',
  timerBLabel: 'Focus B',
};
