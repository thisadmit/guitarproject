import type { ReactNode } from "react";
import { Navigation, type AppMode } from "./Navigation";

interface AppShellProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  children: ReactNode;
}

const MODE_COPY: Record<AppMode, { title: string; subtitle: string }> = {
  learn: {
    title: "Solo Guitar Learning Studio",
    subtitle: "Learn scales, fretboard positions, tab shapes, and guided solo exercises.",
  },
  practice: {
    title: "Practice Mode",
    subtitle: "Record solo ideas, review note timelines, and prepare future tab generation.",
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
          <p className="eyebrow">Solo Guitar Learning Studio</p>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <Navigation activeMode={activeMode} onModeChange={onModeChange} />
      </header>

      {children}
    </main>
  );
}
