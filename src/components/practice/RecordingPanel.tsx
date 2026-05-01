interface RecordingPanelProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export function RecordingPanel({
  isRecording,
  onToggleRecording,
}: RecordingPanelProps) {
  return (
    <section className="mode-card recording-panel">
      <div className="section-heading">
        <h2>Recording</h2>
        <span>{isRecording ? "Running" : "Ready"}</span>
      </div>
      <button
        className={`record-button ${isRecording ? "recording" : ""}`}
        type="button"
        onClick={onToggleRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <p>
        Captured notes will appear in the timeline without grading the
        performance.
      </p>
    </section>
  );
}
