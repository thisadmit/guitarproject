import type { FretboardNote } from "../../types/scale";
import type { NoteInfo } from "../../utils/noteUtils";
import { getAcceptedMidiNumbers } from "../../utils/fretboardNoteUtils";

interface TrainingRevealFretboardProps {
  currentInput: NoteInfo | null;
  fretboardNotes: readonly FretboardNote[];
  revealedNotes: readonly FretboardNote[];
  showAnswers: boolean;
  targetFretboardNotes: readonly FretboardNote[];
  temporaryWrongInput: NoteInfo | null;
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

export function TrainingRevealFretboard({
  currentInput,
  fretboardNotes,
  revealedNotes,
  showAnswers,
  targetFretboardNotes,
  temporaryWrongInput,
}: TrainingRevealFretboardProps) {
  const frets = fretboardNotes.map((note) => note.displayFret);
  const minFret = frets.length > 0 ? Math.min(...frets) : 0;
  const maxFret = frets.length > 0 ? Math.max(...frets) : 0;
  const fretRange = Array.from(
    { length: maxFret - minFret + 1 },
    (_, index) => minFret + index,
  );
  const gridTemplateColumns = `72px repeat(${Math.max(
    fretRange.length,
    1,
  )}, minmax(58px, 1fr))`;
  const visibleNotes = showAnswers ? targetFretboardNotes : revealedNotes;

  return (
    <section className="training-reveal-fretboard" aria-label="Training reveal fretboard">
      <div className="section-heading compact">
        <h2>Fretboard Test</h2>
        <span>{minFret}-{maxFret} frets</span>
      </div>

      <div className="box-fretboard">
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
              const revealedNote = visibleNotes.find(
                (note) =>
                  note.stringNumber === stringNumber &&
                  note.displayFret === fret,
              );
              const wrongNote = temporaryWrongInput
                ? fretboardNotes.find(
                    (note) =>
                      note.stringNumber === stringNumber &&
                      note.displayFret === fret &&
                      getAcceptedMidiNumbers(note).includes(temporaryWrongInput.midi),
                  )
                : null;
              const isCurrent =
                revealedNote !== undefined &&
                currentInput !== null &&
                getAcceptedMidiNumbers(revealedNote).includes(currentInput.midi);

              return (
                <div className="box-fret-cell" key={`${stringNumber}-${fret}`}>
                  <span className="box-string-line" />
                  {revealedNote ? (
                    <span
                      className={`fret-note ${
                        isCurrent ? "fret-note--current" : "fret-note--target"
                      }`}
                      title={`${revealedNote.fullName} - string ${stringNumber}, fret ${revealedNote.displayFret}`}
                    >
                      {revealedNote.degree}
                      {isCurrent ? <small>NOW</small> : null}
                    </span>
                  ) : wrongNote ? (
                    <span
                      className="fret-note fret-note--wrong"
                      title={`${temporaryWrongInput?.fullName ?? "Wrong input"} - string ${stringNumber}, fret ${fret}`}
                    >
                      {temporaryWrongInput?.note ?? "X"}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
