import { useState } from "react";
import { AppShell } from "./components/AppShell";
import type { AppMode } from "./components/Navigation";
import { LearnPage } from "./components/pages/LearnPage";
import { PracticePage } from "./components/pages/PracticePage";
import { TunerPage } from "./components/pages/TunerPage";

function App() {
  const [activeMode, setActiveMode] = useState<AppMode>("learn");

  return (
    <AppShell activeMode={activeMode} onModeChange={setActiveMode}>
      {activeMode === "learn" ? <LearnPage /> : null}
      {activeMode === "practice" ? <PracticePage /> : null}
      {activeMode === "tuner" ? <TunerPage /> : null}
    </AppShell>
  );
}

export default App;
