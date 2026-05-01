import { useState } from "react";
import { CurrentNoteDisplay } from "../practice/CurrentNoteDisplay";
import { NoteTimeline } from "../practice/NoteTimeline";
import { RecordingPanel } from "../practice/RecordingPanel";
import { RecordingSummary } from "../practice/RecordingSummary";
import { TabGeneratorPreview } from "../practice/TabGeneratorPreview";
import type { RecordedNote, SoloRecordingSummary } from "../../types/solo";

const PLACEHOLDER_NOTES: readonly RecordedNote[] = [
  { note: "A", timestampMs: 0 },
  { note: "C", timestampMs: 420 },
  { note: "D", timestampMs: 810 },
  { note: "E", timestampMs: 1180 },
  { note: "G", timestampMs: 1540 },
];

export function PracticePage() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedNotes, setRecordedNotes] =
    useState<readonly RecordedNote[]>(PLACEHOLDER_NOTES);

  const summary: SoloRecordingSummary = {
    durationSeconds: recordedNotes.length > 0 ? 18 : 0,
    noteCount: recordedNotes.length,
    mostUsedNote: recordedNotes.length > 0 ? "A" : null,
  };

  return (
    <section className="mode-layout practice-layout" aria-label="Practice mode">
      <div className="mode-hero practice-mode-hero">
        <div>
          <h2>Practice</h2>
          <strong>Record, review, visualize</strong>
          <p>
            Free solo practice records what you play and turns it into note
            timelines and future tab suggestions.
          </p>
        </div>
        <div className="mode-focus-badge practice">
          Solo Practice
        </div>
      </div>

      <div className="solo-practice-grid">
        <RecordingPanel
          isRecording={isRecording}
          onToggleRecording={() => setIsRecording((current) => !current)}
          onClearRecording={() => setRecordedNotes([])}
        />
        <CurrentNoteDisplay note={isRecording ? "A" : null} />
        <section className="solo-card timeline-card">
          <div className="section-heading">
            <h2>Note Timeline</h2>
            <span>Sequence</span>
          </div>
          <NoteTimeline notes={recordedNotes.map((entry) => entry.note)} />
        </section>
        <RecordingSummary summary={summary} />
        <TabGeneratorPreview />
      </div>
    </section>
  );
}
