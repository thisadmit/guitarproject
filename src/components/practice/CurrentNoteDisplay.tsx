interface CurrentNoteDisplayProps {
  note: string | null;
}

export function CurrentNoteDisplay({ note }: CurrentNoteDisplayProps) {
  return (
    <section className="solo-card current-note-display">
      <div className="section-heading">
        <h2>Current Note</h2>
        <span>Live input</span>
      </div>
      <strong>{note ?? "--"}</strong>
      <p>Realtime note detection will connect here during solo recording.</p>
    </section>
  );
}
