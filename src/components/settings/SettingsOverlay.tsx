import { motion, AnimatePresence } from 'motion/react';
import type { AppSettings } from '../../types/settings';
import './SettingsOverlay.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (partial: Partial<AppSettings>) => void;
  streakGoalMinutes: number;
  onStreakGoalChange: (minutes: number) => void;
}

function NumberStepper({ label, value, onChange, min = 1, max = 120, unit = 'min' }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string;
}) {
  return (
    <div className="setting-row">
      <span className="setting-label">{label}</span>
      <div className="stepper">
        <button className="stepper-btn" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <span className="stepper-value">{value} {unit}</span>
        <button className="stepper-btn" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="setting-row">
      <span className="setting-label">{label}</span>
      <button
        className={`toggle ${value ? 'toggle-on' : ''}`}
        onClick={() => onChange(!value)}
      >
        <motion.div
          className="toggle-knob"
          animate={{ x: value ? 20 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </button>
    </div>
  );
}

function Slider({ label, value, onChange, min = 0, max = 1, step = 0.1 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="setting-row">
      <span className="setting-label">{label}</span>
      <input
        type="range"
        className="setting-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

export function SettingsOverlay({ isOpen, onClose, settings, onUpdate, streakGoalMinutes, onStreakGoalChange }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="settings-panel glass-panel"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="settings-header">
              <h2 className="settings-title">Settings</h2>
              <button className="settings-close" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="settings-body">
              <div className="settings-section">
                <h3 className="settings-section-title" style={{ color: '#818CF8' }}>Timer A</h3>
                <NumberStepper label="Duration" value={settings.timerADuration} onChange={v => onUpdate({ timerADuration: v })} />
                <div className="setting-row">
                  <span className="setting-label">Label</span>
                  <input
                    type="text"
                    className="setting-text-input"
                    value={settings.timerALabel}
                    onChange={e => onUpdate({ timerALabel: e.target.value })}
                  />
                </div>
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title" style={{ color: '#5EEAD4' }}>Timer B</h3>
                <NumberStepper label="Duration" value={settings.timerBDuration} onChange={v => onUpdate({ timerBDuration: v })} />
                <div className="setting-row">
                  <span className="setting-label">Label</span>
                  <input
                    type="text"
                    className="setting-text-input"
                    value={settings.timerBLabel}
                    onChange={e => onUpdate({ timerBLabel: e.target.value })}
                  />
                </div>
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title">Breaks</h3>
                <NumberStepper label="Short break" value={settings.shortBreakDuration} onChange={v => onUpdate({ shortBreakDuration: v })} />
                <NumberStepper label="Long break" value={settings.longBreakDuration} onChange={v => onUpdate({ longBreakDuration: v })} />
                <NumberStepper label="Cycles before long" value={settings.cyclesBeforeLongBreak} onChange={v => onUpdate({ cyclesBeforeLongBreak: v })} min={1} max={12} unit="" />
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title">Automation</h3>
                <Toggle label="Auto-start timers" value={settings.autoStartTimers} onChange={v => onUpdate({ autoStartTimers: v })} />
                <Toggle label="Auto-start breaks" value={settings.autoStartBreaks} onChange={v => onUpdate({ autoStartBreaks: v })} />
                <Toggle label="Auto-loop cycles" value={settings.autoLoopCycles} onChange={v => onUpdate({ autoLoopCycles: v })} />
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title" style={{ color: '#F59E0B' }}>Streak</h3>
                <NumberStepper label="Daily goal" value={streakGoalMinutes} onChange={onStreakGoalChange} min={5} max={480} unit="min" />
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title">Sound</h3>
                <Toggle label="Sound enabled" value={settings.soundEnabled} onChange={v => onUpdate({ soundEnabled: v })} />
                {settings.soundEnabled && (
                  <Slider label="Volume" value={settings.soundVolume} onChange={v => onUpdate({ soundVolume: v })} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
