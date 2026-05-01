import { useState } from "react";
import { NoteTimeline } from "./NoteTimeline";
import { RecordingPanel } from "./RecordingPanel";

const PLACEHOLDER_NOTES = ["A", "C", "D", "E", "G", "A", "C"];

export function PracticeSolo() {
  const [isRecording, setIsRecording] = useState<boolean>(false);

  return (
    <div className="mode-panel practice-solo-panel">
      <RecordingPanel
        isRecording={isRecording}
        onToggleRecording={() => setIsRecording((current) => !current)}
      />

      <section className="mode-card timeline-card">
        <div className="section-heading">
          <h2>Note Timeline</h2>
          <span>Live soon</span>
        </div>
        <NoteTimeline notes={PLACEHOLDER_NOTES} />
      </section>

      <section className="mode-card analysis-card">
        <div className="section-heading">
          <h2>Solo Analysis</h2>
          <span>Placeholder</span>
        </div>
        <div className="analysis-grid">
          <div>
            <span>Likely key</span>
            <strong>A minor</strong>
          </div>
          <div>
            <span>Tab generation</span>
            <strong>Coming soon</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
