export interface ScaleValidationResult {
  isCorrect: boolean;
  isInBox: boolean | null;
  displayNote: string | null;
  normalizedNote: string | null;
  message: string;
  status: ScaleExerciseStatus;
}

export type ScaleExerciseStatus =
  | "stopped"
  | "no-signal"
  | "in-scale"
  | "outside-box"
  | "wrong";

const ENHARMONIC_NORMALIZATION: Record<string, string> = {
  DB: "C#",
  EB: "D#",
  GB: "F#",
  AB: "G#",
  BB: "A#",
};

export function normalizeNoteName(noteName: string | null | undefined): string | null {
  if (!noteName) {
    return null;
  }

  const match = noteName.trim().toUpperCase().match(/^([A-G](?:#|B)?)/);
  if (!match) {
    return null;
  }

  const pitchClass = match[1];
  return ENHARMONIC_NORMALIZATION[pitchClass] ?? pitchClass;
}

export function normalizeFullNoteName(
  noteName: string | null | undefined,
): string | null {
  if (!noteName) {
    return null;
  }

  const match = noteName.trim().toUpperCase().match(/^([A-G](?:#|B)?)(-?\d+)/);
  if (!match) {
    return null;
  }

  const pitchClass = ENHARMONIC_NORMALIZATION[match[1]] ?? match[1];
  return `${pitchClass}${match[2]}`;
}

export function isNoteInScale(
  noteName: string | null | undefined,
  scaleNotes: readonly string[],
  scaleLabel = "the selected scale",
  boxMidiNumbers?: readonly number[],
  currentMidi?: number | null,
  isExerciseRunning = true,
): ScaleValidationResult {
  if (!isExerciseRunning) {
    return {
      isCorrect: false,
      isInBox: null,
      displayNote: null,
      normalizedNote: null,
      message: "Start exercise to check your notes",
      status: "stopped",
    };
  }

  const normalizedNote = normalizeNoteName(noteName);
  const displayNote = normalizeFullNoteName(noteName) ?? normalizedNote;

  if (!normalizedNote) {
    return {
      isCorrect: false,
      isInBox: null,
      displayNote: null,
      normalizedNote: null,
      message: "Play a note",
      status: "no-signal",
    };
  }

  const normalizedScaleNotes = scaleNotes
    .map((scaleNote) => normalizeNoteName(scaleNote))
    .filter((scaleNote): scaleNote is string => scaleNote !== null);
  const isCorrect = normalizedScaleNotes.includes(normalizedNote);
  const isInBox = boxMidiNumbers && currentMidi !== null && currentMidi !== undefined
    ? boxMidiNumbers.includes(currentMidi)
    : null;
  const status = getScaleStatus(isCorrect, isInBox);
  const message = getScaleMessage({
    displayNote: displayNote ?? normalizedNote,
    isCorrect,
    isInBox,
    scaleLabel,
    status,
  });

  return {
    isCorrect,
    isInBox,
    displayNote,
    normalizedNote,
    message,
    status,
  };
}

function getScaleStatus(
  isCorrect: boolean,
  isInBox: boolean | null,
): ScaleExerciseStatus {
  if (!isCorrect) {
    return "wrong";
  }

  if (isInBox === false) {
    return "outside-box";
  }

  return "in-scale";
}

function getScaleMessage({
  displayNote,
  isCorrect,
  isInBox,
  scaleLabel,
  status,
}: {
  displayNote: string;
  isCorrect: boolean;
  isInBox: boolean | null;
  scaleLabel: string;
  status: ScaleExerciseStatus;
}): string {
  if (status === "wrong") {
    return `${displayNote} is outside ${scaleLabel}`;
  }

  if (status === "outside-box") {
    return `${displayNote} is in the scale, but not in the selected box`;
  }

  return `Good - ${displayNote} is in this box`;
}
