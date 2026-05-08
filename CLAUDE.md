# Pomotimer — context for Claude

A Pomodoro + study tracker built for Denis (BAC + Politehnica prep, May–Jul 2026).
**Stack:** React 19 + TS + Vite + Electron 41. Plain CSS variables + `motion`.
**Owner preference:** simplicity. Don't add features unprompted, don't over-abstract.

Repo: `https://github.com/do4x/pomotimer` · branch `main` · git user `ncdenis2k`.

---

## What the app does today

- **Single-focus Pomodoro:** `idle → focus → shortBreak → focus → … → longBreak (every N) → loop`. No more `timerA`/`timerB` distinction.
- **3 subjects:** Math / Informatică / Română. Picked manually via `SubjectPicker`. Switches what gets credited.
- **Per-subject time tracking** in `useStudyStats`. **Skip credits zero seconds.** Time only accrues from `setInterval` while `phase === 'focus' && status === 'running'` (or `overtime`).
- **Pre-end notification at 30 s** + **Overtime mode** (count-up `+MM:SS`, OVERTIME pill, "End Session" replaces Skip).
- **Daily + weekly per-subject goals.** DailyProgress + WeeklyProgress in StreakSidebar.
- **Streak** (heatmap + calendar). Daily streak goal cap: **960 min (16 h)**.
- **Manual time entry** (`LogTimeModal`) for sessions outside the app — pick subject + date + h/min, credits the chosen day.
- **RO / EN toggle** in Settings → Limbă (default RO). Subject names + all UI strings translated.
- **FastNumberStepper** everywhere — typeable input + ±1 / ±5 buttons + Shift+Arrow for ±5.

---

## Hard rules — DON'T violate

1. **No per-tick credit on Skip.** Skip dispatches a phase advance which moves out of `focus` instantly; the per-second interval in `useStudyStats` no longer fires. Don't add lump-credit on phase end.
2. **Subject names go through `subjectName(id, lang)`** in `src/types/subject.ts`. Never hardcode "Math" or "Matematică" in JSX.
3. **One `useSettings()` per render tree.** It owns its own `useState` — multiple instances diverge. App.tsx pattern: outer `App` calls `useSettings()`, wraps `<LanguageProvider value={settings.language}>`, passes `settings`/`updateSettings` to `<AppInner>`.
4. **i18n pattern is `t(en, ro)`.** No translation key dictionary; strings live in their components. `useT()` returns the picker function.
5. **Old localStorage shapes are dropped, not migrated.** A/B-keyed task/resource stores reset on first load of new schema; flat-seconds stats migrate into `SUBJECT_IDS[0]`.
6. **Romanian first.** Default `language: 'ro'`.

---

## File map (only the unusual bits)

- `src/i18n/i18n.tsx` — `LanguageProvider`, `useT`, `useLang`. Pattern: `t('English', 'Română')`.
- `src/types/subject.ts` — `SUBJECTS` (3 hardcoded ids: math/info/romana), `subjectName(id, lang)`, `DEFAULT_SUBJECT_GOALS` (weekly), `DEFAULT_SUBJECT_DAILY_GOALS`.
- `src/hooks/useTimerMachine.ts` — single `focus` phase, overtime fields on state, `PRE_END_THRESHOLD_SECONDS = 30`. Has pre-existing ref-during-render lint warnings — leave them unless refactoring the whole hook.
- `src/hooks/useStudyStats.ts` — per-subject `dailyRecords`, exposes `addManualSeconds(date, subjectId, seconds)`. Same lint warnings as above.
- `src/hooks/useActiveSubject.ts` — persisted active subject id.
- `src/components/log/LogTimeModal.tsx` — manual time entry.
- `src/components/subjects/{SubjectPicker,WeeklyProgress,DailyProgress}.tsx`.
- `src/components/timer/{PreEndBanner,OvertimeIndicator}.tsx` — overtime UI.
- `src/components/settings/FastNumberStepper.tsx` — typeable + ±1 / ±5.
- `electron/main.cjs` — minimal Electron shim. No preload, no IPC. Notifications use renderer Web API.

---

## Commands

```
npm run dev                # Vite dev (http://localhost:5173)
npm run electron:dev       # Electron + Vite together
npm run build              # tsc -b && vite build
npm run lint               # ~7–8 pre-existing ref/setState lint warnings; ignore unless touching those files
npm run electron:build     # produces release/Pomotimer 1.0.0.exe (88 MB portable, gitignored)
```

`release/` and `build/` are gitignored. The .exe is *not* committed.

---

## Recent commits (newest first)

- `375a257` Localization (RO/EN), daily goals per subject, manual time entry
- `ea323fa` Add overtime mode with pre-end notification
- `27df420` Add 3-subject focus tracking with weekly goals
- `04effd4` Added streak Feature
- `733c755` Merge remote main and resolve README conflict
- `1cf0665` Initial commit: Pomotimer app

---

## What got tried + reverted — DO NOT re-propose unless asked

A previous BAC integration was built and rolled back to commit `27df420` because user said it "ruined the simplicity it had". That work added: subjects+topics+phases, BAC Mode queue, 22+ content components (TopicPickerModal, MethodologyCard, FrameworkPanel, WeeklyReview, NonNegotiables, etc.), error log capture, weekly review forms, daily checklist. **Don't add any of that back unless explicitly requested.**

Markdown plan files for that direction live in `implementation_plan/` (untracked). Leave them — user kept them as reference.

---

## Postponed (user's own words, RO)

- **Cloud / web version with sync.** User said: *"ne complicăm și poate o facem mai târziu"*. Don't propose unprompted.

---

## Style notes for working with the user

- **Native Romanian.** Writes in Romanian a lot. Reply in Romanian when they do.
- **Brief, direct.** No hedge words, no "I'd be happy to". Get to the point.
- **Will tell you when something is over-engineered.** Default to less, not more.
- **Builds + git pushes only when explicitly requested.** Don't preempt.
- **Localization-sensitive.** When adding any UI string, wrap in `t('English', 'Română')`. Same for subject names — use `subjectName(id, lang)`.
