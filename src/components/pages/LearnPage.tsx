import { useState } from "react";
import { LearnChord } from "../learn/LearnChord";
import { LearnSolo } from "../learn/LearnSolo";

type LearnMode = "chord" | "solo";

export function LearnPage() {
  const [learnMode, setLearnMode] = useState<LearnMode>("chord");

  return (
    <section className="mode-layout learn-layout" aria-label="Learn mode">
      <div className="mode-hero learn-mode-hero">
        <div>
          <h2>Learn</h2>
          <strong>Target, evaluation, feedback</strong>
          <p>
            Choose a goal, compare your result, and get a clear explanation of
            what needs work.
          </p>
        </div>
        <div className="submode-tabs" role="tablist" aria-label="Learn sections">
          <button
            className={learnMode === "chord" ? "active" : ""}
            type="button"
            onClick={() => setLearnMode("chord")}
          >
            Chord
          </button>
          <button
            className={learnMode === "solo" ? "active" : ""}
            type="button"
            onClick={() => setLearnMode("solo")}
          >
            Solo
          </button>
        </div>
      </div>

      {learnMode === "chord" ? <LearnChord /> : <LearnSolo />}
    </section>
  );
}
