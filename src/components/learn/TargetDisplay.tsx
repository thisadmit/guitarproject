interface TargetDisplayProps {
  title: string;
  label: string;
  notes: readonly string[];
  description: string;
}

export function TargetDisplay({
  title,
  label,
  notes,
  description,
}: TargetDisplayProps) {
  return (
    <section className="mode-card target-display">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>Target</span>
      </div>
      <strong>{label}</strong>
      <p>{description}</p>
      <div className="note-chip-row">
        {notes.map((note) => (
          <span className="note-chip" key={note}>
            {note}
          </span>
        ))}
      </div>
    </section>
  );
}
