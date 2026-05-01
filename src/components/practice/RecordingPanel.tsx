interface RecordingPanelProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onClearRecording: () => void;
}

export function RecordingPanel({
  isRecording,
  onToggleRecording,
  onClearRecording,
}: RecordingPanelProps) {
  return (
    <section className="mode-card recording-panel">
      <div className="section-heading">
        <h2>Recording</h2>
        <span>{isRecording ? "Running" : "Ready"}</span>
      </div>
      <div className="recording-actions">
        <button
          className={`record-button ${isRecording ? "recording" : ""}`}
          type="button"
          onClick={onToggleRecording}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        <button className="secondary-button" type="button" onClick={onClearRecording}>
          Clear Recording
        </button>
      </div>
      <p>
        Captured notes will appear in the timeline without grading the
        performance.
      </p>
    </section>
  );
}
