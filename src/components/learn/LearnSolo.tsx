import { useState } from "react";
import { scales } from "../../data/scales";
import type { Scale } from "../../types/scale";
import { FeedbackPanel } from "./FeedbackPanel";
import { TargetDisplay } from "./TargetDisplay";

export function LearnSolo() {
  const [selectedScale, setSelectedScale] = useState<Scale>(scales[0]);

  return (
    <div className="mode-panel learn-solo-panel">
      <section className="mode-card goal-picker">
        <div className="section-heading">
          <h2>Solo Goal</h2>
          <span>Scale</span>
        </div>
        <div className="scale-list">
          {scales.map((scale) => (
            <button
              key={scale.id}
              className={`scale-button ${
                selectedScale.id === scale.id ? "selected" : ""
              }`}
              type="button"
              onClick={() => setSelectedScale(scale)}
            >
              <strong>{scale.name}</strong>
              <span>{scale.notes.join(" - ")}</span>
            </button>
          ))}
        </div>
      </section>

      <TargetDisplay
        title="Target Scale"
        label={selectedScale.name}
        notes={selectedScale.notes}
        description={selectedScale.description}
      />

      <section className="mode-card evaluation-card">
        <div className="section-heading">
          <h2>Played Notes</h2>
          <span>Comparison</span>
        </div>
        <div className="note-lane placeholder-lane">
          <span>A</span>
          <span>C</span>
          <span>D</span>
          <span className="outside">F</span>
          <span>E</span>
        </div>
        <p>Scale-out notes will be highlighted once real note tracking is connected.</p>
      </section>

      <FeedbackPanel
        status="incorrect"
        title="Scale Feedback"
        message="The learning flow will identify notes outside the selected scale and explain why they sound unstable."
        details={[
          "Outside notes appear in amber.",
          "Target notes remain visible for comparison.",
          "Future feedback will suggest safer landing notes.",
        ]}
      />
    </div>
  );
}
