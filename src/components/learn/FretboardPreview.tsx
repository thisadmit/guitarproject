import type { FretboardNote, Scale, ScaleBox } from "../../types/scale";
import type { NoteInfo } from "../../utils/noteUtils";
import { isFretboardNoteInputMatch } from "../../utils/fretboardNoteUtils";

interface FretboardPreviewProps {
  currentInput: NoteInfo | null;
  fretboardNotes: readonly FretboardNote[];
  isExerciseRunning: boolean;
  scaleNotes: readonly string[];
  selectedBox: ScaleBox | null;
  selectedKey: string;
  selectedPosition: string;
  positionVariantMessage: string | null;
  selectedScale: Scale;
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

const STRING_OPEN_MIDI: Record<(typeof STRING_ORDER)[number], number> = {
  6: 40,
  5: 45,
  4: 50,
  3: 55,
  2: 59,
  1: 64,
};

export function FretboardPreview({
  currentInput,
  fretboardNotes,
  isExerciseRunning,
  scaleNotes,
  selectedBox,
  selectedKey,
  selectedPosition,
  positionVariantMessage,
  selectedScale,
}: FretboardPreviewProps) {
  const frets = fretboardNotes.map((note) => note.displayFret);
  const minFret = frets.length > 0 ? Math.min(...frets) : 0;
  const maxFret = frets.length > 0 ? Math.max(...frets) : 0;
  const fretRange =
    selectedBox && frets.length > 0 && minFret >= 0
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
        {positionVariantMessage ? <p>{positionVariantMessage}</p> : null}
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
                    candidate.displayFret === fret,
                );
                const isWrongInputCell =
                  isExerciseRunning &&
                  currentInput !== null &&
                  !isCurrentInputInScale(currentInput, scaleNotes) &&
                  STRING_OPEN_MIDI[stringNumber] + fret === currentInput.midi;

                return (
                  <div className="box-fret-cell" key={`${stringNumber}-${fret}`}>
                    <span className="box-string-line" />
                    {note ? (
                      <FretboardDot
                        currentInput={currentInput}
                        isCurrentInScale={isCurrentInputInScale(currentInput, scaleNotes)}
                        isExerciseRunning={isExerciseRunning}
                        note={note}
                      />
                    ) : isWrongInputCell ? (
                      <WrongInputDot currentInput={currentInput} fret={fret} stringNumber={stringNumber} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="root-legend">
            <span className="fret-note fret-note--root">{selectedKey}</span>
            <p>Root note. Start and resolve phrases here.</p>
          </div>
          {isExerciseRunning &&
          currentInput &&
          !fretboardNotes.some((note) =>
            isFretboardNoteInputMatch(note, currentInput.midi),
          ) ? (
            <p
              className={`outside-box-message ${
                isCurrentInputInScale(currentInput, scaleNotes) ? "" : "wrong"
              }`}
            >
              {isCurrentInputInScale(currentInput, scaleNotes)
                ? `${currentInput.fullName} is in the scale, but outside this box.`
                : `${currentInput.fullName} is outside the selected scale.`}
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

function WrongInputDot({
  currentInput,
  fret,
  stringNumber,
}: {
  currentInput: NoteInfo;
  fret: number;
  stringNumber: (typeof STRING_ORDER)[number];
}) {
  return (
    <span
      className="fret-note fret-note--wrong"
      title={`${currentInput.fullName} - string ${stringNumber}, fret ${fret}`}
    >
      {currentInput.note}
      <small>OUT</small>
    </span>
  );
}

function FretboardDot({
  currentInput,
  isCurrentInScale,
  isExerciseRunning,
  note,
}: {
  currentInput: NoteInfo | null;
  isCurrentInScale: boolean;
  isExerciseRunning: boolean;
  note: FretboardNote;
}) {
  const isCurrent =
    currentInput !== null && isFretboardNoteInputMatch(note, currentInput.midi);
  const isWrong = isExerciseRunning && isCurrent && !isCurrentInScale;
  const visualState = getFretNoteVisualState({
    isCurrent,
    isInBox: note.isInBox,
    isRoot: note.isRoot,
    isWrong,
  });

  return (
    <span
      className={`fret-note fret-note--${visualState}`}
      title={`${note.fullName} - string ${note.stringNumber}, fret ${note.displayFret}`}
    >
      {note.note}
      {isCurrent ? <small>NOW</small> : null}
    </span>
  );
}

type FretNoteVisualState = "wrong" | "current" | "root" | "normal" | "outside";

function getFretNoteVisualState({
  isCurrent,
  isInBox,
  isRoot,
  isWrong,
}: {
  isCurrent: boolean;
  isInBox: boolean;
  isRoot: boolean;
  isWrong: boolean;
}): FretNoteVisualState {
  if (isWrong) {
    return "wrong";
  }

  if (isCurrent) {
    return "current";
  }

  if (isRoot) {
    return "root";
  }

  if (!isInBox) {
    return "outside";
  }

  return "normal";
}

function isCurrentInputInScale(
  currentInput: NoteInfo | null,
  scaleNotes: readonly string[],
): boolean {
  if (!currentInput) {
    return false;
  }

  return scaleNotes.includes(currentInput.note);
}
