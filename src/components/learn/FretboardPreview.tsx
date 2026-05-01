import type { FretboardNote, Scale, ScaleBox } from "../../types/scale";

interface FretboardPreviewProps {
  currentInputNote: string | null;
  currentPitchClass: string | null;
  fretboardNotes: readonly FretboardNote[];
  scaleNotes: readonly string[];
  selectedBox: ScaleBox | null;
  selectedKey: string;
  selectedPosition: string;
  selectedScale: Scale;
  targetNote: string | null;
}

const STRING_ORDER = [1, 2, 3, 4, 5, 6] as const;
const STRING_LABELS: Record<(typeof STRING_ORDER)[number], string> = {
  1: "e",
  2: "B",
  3: "G",
  4: "D",
  5: "A",
  6: "E",
};

export function FretboardPreview({
  currentInputNote,
  currentPitchClass,
  fretboardNotes,
  scaleNotes,
  selectedBox,
  selectedKey,
  selectedPosition,
  selectedScale,
  targetNote,
}: FretboardPreviewProps) {
  const frets = fretboardNotes.map((note) => note.fret);
  const minFret = frets.length > 0 ? Math.min(...frets) : 0;
  const maxFret = frets.length > 0 ? Math.max(...frets) : 0;
  const fretRange =
    selectedBox && minFret > 0
      ? Array.from({ length: maxFret - minFret + 1 }, (_, index) => minFret + index)
      : [];
  const gridTemplateColumns = `72px repeat(${Math.max(
    fretRange.length,
    1,
  )}, minmax(58px, 1fr))`;

  return (
    <section className="solo-card fretboard-solo-preview">
      <div className="section-heading">
        <h2>Fretboard View</h2>
        <span>{selectedBox ? `${minFret}-${maxFret} frets` : "Placeholder"}</span>
      </div>

      <div className="scale-output-summary">
        <strong>
          {selectedKey} {selectedScale.name}
        </strong>
        <p>
          {selectedPosition} - Notes: {scaleNotes.join(" ")} - Formula:{" "}
          {selectedScale.formula.join(" ")}
        </p>
        <p>
          {selectedBox?.description ??
            "Box data for this scale is prepared as a future expansion."}
        </p>
      </div>

      {selectedBox ? (
        <div className="box-fretboard" aria-label="Selected scale box fretboard">
          <div className="fret-number-row" style={{ gridTemplateColumns }}>
            <span />
            {fretRange.map((fret) => (
              <span key={fret}>{fret}</span>
            ))}
          </div>

          {STRING_ORDER.map((stringNumber) => (
            <div
              className="box-string-row"
              key={stringNumber}
              style={{ gridTemplateColumns }}
            >
              <span className="box-string-label">
                {stringNumber} - {STRING_LABELS[stringNumber]}
              </span>
              {fretRange.map((fret) => {
                const note = fretboardNotes.find(
                  (candidate) =>
                    candidate.stringNumber === stringNumber &&
                    candidate.fret === fret,
                );

                return (
                  <div className="box-fret-cell" key={`${stringNumber}-${fret}`}>
                    <span className="box-string-line" />
                    {note ? (
                      <span
                        className={[
                          "note-dot",
                          note.isRoot ? "root" : "",
                          note.note === targetNote ? "target-note" : "",
                          note.fullName === currentInputNote ? "current-note" : "",
                          note.fullName === currentInputNote && note.note === targetNote
                            ? "success-note"
                            : "",
                          currentInputNote &&
                          note.fullName === currentInputNote &&
                          targetNote &&
                          note.note !== targetNote
                            ? "warning-note"
                            : "",
                        ].join(" ")}
                      >
                        {note.note}
                        {note.fullName === currentInputNote ? (
                          <small>NOW</small>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="root-legend">
            <span className="note-dot root">{selectedKey}</span>
            <p>Root note. Start and resolve phrases here.</p>
          </div>
          {currentPitchClass &&
          !fretboardNotes.some((note) => note.note === currentPitchClass) ? (
            <p className="outside-box-message">
              {currentPitchClass} is in your input, but outside the selected box.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="box-placeholder">
          <strong>Box data coming soon</strong>
          <p>
            Minor Pentatonic Boxes 1-5 are implemented now. Other scale box
            systems will plug into the same view.
          </p>
        </div>
      )}
    </section>
  );
}
