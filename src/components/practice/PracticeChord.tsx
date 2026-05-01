export function PracticeChord() {
  return (
    <div className="mode-panel practice-chord-panel">
      <section className="mode-card free-play-card">
        <div className="section-heading">
          <h2>Free Chord Play</h2>
          <span>Analysis</span>
        </div>
        <div className="detected-chord">
          <span>Detected chord</span>
          <strong>--</strong>
          <p>Chord recognition placeholder</p>
        </div>
      </section>

      <section className="mode-card sequence-card">
        <div className="section-heading">
          <h2>Recent Sequence</h2>
          <span>No grading</span>
        </div>
        <div className="sequence-row">
          <span>C</span>
          <span>G</span>
          <span>Am</span>
          <span>F</span>
        </div>
        <p>
          This mode records what you played and keeps judgment out of the flow.
        </p>
      </section>
    </div>
  );
}
