import { useEffect, useState } from 'react';
import './FastNumberStepper.css';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function FastNumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 480,
  unit = 'min',
}: Props) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n)) onChange(clamp(n, min, max));
    else setDraft(String(value));
  };

  const apply = (delta: number) => onChange(clamp(value + delta, min, max));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.shiftKey && e.key === 'ArrowUp') {
      e.preventDefault();
      apply(5);
    } else if (e.shiftKey && e.key === 'ArrowDown') {
      e.preventDefault();
      apply(-5);
    }
  };

  return (
    <div className="setting-row">
      {label && <span className="setting-label">{label}</span>}
      <div className="fast-stepper">
        <button type="button" className="fast-stepper-btn fast-stepper-big" onClick={() => apply(-5)} aria-label="Decrease 5">−5</button>
        <button type="button" className="fast-stepper-btn" onClick={() => apply(-1)} aria-label="Decrease 1">−1</button>
        <input
          type="number"
          className="fast-stepper-input"
          min={min}
          max={max}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => {
            onKeyDown(e);
            if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
          }}
        />
        <span className="fast-stepper-unit">{unit}</span>
        <button type="button" className="fast-stepper-btn" onClick={() => apply(1)} aria-label="Increase 1">+1</button>
        <button type="button" className="fast-stepper-btn fast-stepper-big" onClick={() => apply(5)} aria-label="Increase 5">+5</button>
      </div>
    </div>
  );
}
