interface NoteTimelineProps {
  notes: readonly string[];
}

export function NoteTimeline({ notes }: NoteTimelineProps) {
  return (
    <div className="note-timeline" aria-label="Note timeline">
      {notes.map((note, index) => (
        <span key={`${note}-${index}`}>{note}</span>
      ))}
    </div>
  );
}
