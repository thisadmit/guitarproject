import { useState } from "react";
import { chords } from "../../data/chords";
import type { Chord } from "../../types/chord";
import { TargetDisplay } from "./TargetDisplay";
import { FeedbackPanel } from "./FeedbackPanel";

export function LearnChord() {
  const [selectedChord, setSelectedChord] = useState<Chord>(chords[0]);

  return (
    <div className="mode-panel learn-chord-panel">
      <section className="mode-card goal-picker">
        <div className="section-heading">
          <h2>Chord Goal</h2>
          <span>Choose one</span>
        </div>
        <div className="chord-grid">
          {chords.map((chord) => (
            <button
              key={chord.id}
              className={`chord-button ${
                selectedChord.id === chord.id ? "selected" : ""
              }`}
              type="button"
              onClick={() => setSelectedChord(chord)}
            >
              <strong>{chord.name}</strong>
              <span>{chord.quality}</span>
            </button>
          ))}
        </div>
      </section>

      <TargetDisplay
        title="Target Chord"
        label={selectedChord.name}
        notes={selectedChord.notes}
        description={selectedChord.description}
      />

      <section className="mode-card evaluation-card">
        <div className="section-heading">
          <h2>Current Result</h2>
          <span>Placeholder</span>
        </div>
        <div className="comparison-grid">
          <div>
            <span>Expected</span>
            <strong>{selectedChord.notes.join(" - ")}</strong>
          </div>
          <div>
            <span>Detected</span>
            <strong>Listening model pending</strong>
          </div>
        </div>
        <div className="evaluation-state pending">No evaluation yet</div>
      </section>

      <FeedbackPanel
        status="pending"
        title="Feedback"
        message="Chord recognition will compare your played chord against the target and explain the mismatch."
        details={[
          "Missing notes will be listed here.",
          "Extra or muted strings will be called out separately.",
          selectedChord.beginnerTip,
        ]}
      />
    </div>
  );
}
