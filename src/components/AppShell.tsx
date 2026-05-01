import type { ReactNode } from "react";
import { Navigation, type AppMode } from "./Navigation";

interface AppShellProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  children: ReactNode;
}

const MODE_COPY: Record<AppMode, { title: string; subtitle: string }> = {
  learn: {
    title: "Guitar Learning Studio",
    subtitle: "Guided chord and solo learning with goals, evaluation, and feedback.",
  },
  practice: {
    title: "Practice Mode",
    subtitle: "Free play analysis and recording without right-or-wrong grading.",
  },
  tuner: {
    title: "Tuner Mode",
    subtitle: "Stable pedal-style tuning for single-note guitar input.",
  },
};

export function AppShell({ activeMode, onModeChange, children }: AppShellProps) {
  const copy = MODE_COPY[activeMode];

  return (
    <main className="app-shell">
      <header className="studio-header">
        <div>
          <p className="eyebrow">Guitar Learning Studio</p>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <Navigation activeMode={activeMode} onModeChange={onModeChange} />
      </header>

      {children}
    </main>
  );
}
