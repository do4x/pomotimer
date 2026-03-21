export const PHASE_COLORS = {
  timerA: {
    primary: '#4F46E5',
    glow: '#818CF8',
    surface: 'rgba(79, 70, 229, 0.08)',
    text: '#C7D2FE',
  },
  timerB: {
    primary: '#14B8A6',
    glow: '#5EEAD4',
    surface: 'rgba(20, 184, 166, 0.08)',
    text: '#99F6E4',
  },
  shortBreak: {
    primary: '#F59E0B',
    glow: '#FCD34D',
    surface: 'rgba(245, 158, 11, 0.08)',
    text: '#FDE68A',
  },
  longBreak: {
    primary: '#F59E0B',
    glow: '#FCD34D',
    surface: 'rgba(245, 158, 11, 0.08)',
    text: '#FDE68A',
  },
  idle: {
    primary: '#64748B',
    glow: '#94A3B8',
    surface: 'rgba(100, 116, 139, 0.08)',
    text: '#CBD5E1',
  },
  cycleComplete: {
    primary: '#A855F7',
    glow: '#C084FC',
    surface: 'rgba(168, 85, 247, 0.08)',
    text: '#E9D5FF',
  },
} as const;

export const PHASE_LABELS: Record<string, string> = {
  idle: 'Ready',
  timerA: 'Focus A',
  shortBreak: 'Break',
  timerB: 'Focus B',
  cycleComplete: 'Cycle Complete',
  longBreak: 'Long Break',
};
