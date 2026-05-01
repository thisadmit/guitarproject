import type { SoloRecordingSummary } from "../../types/solo";

interface RecordingSummaryProps {
  summary: SoloRecordingSummary;
}

export function RecordingSummary({ summary }: RecordingSummaryProps) {
  return (
    <section className="solo-card recording-summary">
      <div className="section-heading">
        <h2>Recording Summary</h2>
        <span>Analysis</span>
      </div>
      <dl className="summary-grid">
        <div>
          <dt>Total time</dt>
          <dd>{summary.durationSeconds}s</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{summary.noteCount}</dd>
        </div>
        <div>
          <dt>Most used</dt>
          <dd>{summary.mostUsedNote ?? "--"}</dd>
        </div>
      </dl>
    </section>
  );
}
