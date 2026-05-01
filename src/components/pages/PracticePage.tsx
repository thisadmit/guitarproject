import { useState } from "react";
import { PracticeChord } from "../practice/PracticeChord";
import { PracticeSolo } from "../practice/PracticeSolo";

type PracticeMode = "chord" | "solo";

export function PracticePage() {
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("chord");

  return (
    <section className="mode-layout practice-layout" aria-label="Practice mode">
      <div className="mode-hero practice-mode-hero">
        <div>
          <h2>Practice</h2>
          <strong>Play, analyze, remember</strong>
          <p>
            Free-play mode records and organizes what you did without marking
            it right or wrong.
          </p>
        </div>
        <div
          className="submode-tabs"
          role="tablist"
          aria-label="Practice sections"
        >
          <button
            className={practiceMode === "chord" ? "active" : ""}
            type="button"
            onClick={() => setPracticeMode("chord")}
          >
            Chord
          </button>
          <button
            className={practiceMode === "solo" ? "active" : ""}
            type="button"
            onClick={() => setPracticeMode("solo")}
          >
            Solo
          </button>
        </div>
      </div>

      {practiceMode === "chord" ? <PracticeChord /> : <PracticeSolo />}
    </section>
  );
}
