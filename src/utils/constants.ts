import type { Subject } from '../types/subject';

export interface PhaseColorTokens {
  primary: string;
  glow: string;
  surface: string;
  text: string;
}

export const PHASE_COLORS: Record<string, PhaseColorTokens> = {
  focus: {
    primary: '#5B8DEE',
    glow: '#93B5F8',
    surface: 'rgba(91, 141, 238, 0.08)',
    text: '#C8DBFA',
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
};

export const PHASE_LABELS: Record<string, string> = {
  idle: 'Ready',
  focus: 'Focus',
  shortBreak: 'Break',
  cycleComplete: 'Cycle Complete',
  longBreak: 'Long Break',
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const expanded = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const bigint = parseInt(expanded, 16);
  return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
}

/**
 * Resolve display colors for a phase. In `focus` we use the active subject's color.
 */
export function getPhaseColors(phase: string, activeSubject?: Subject | null): PhaseColorTokens {
  if (phase === 'focus' && activeSubject) {
    return {
      primary: activeSubject.color,
      glow: activeSubject.glow,
      surface: hexToRgba(activeSubject.color, 0.08),
      text: activeSubject.glow,
    };
  }
  return PHASE_COLORS[phase] || PHASE_COLORS.idle;
}
