export interface ScaleValidationResult {
  isCorrect: boolean;
  isInBox: boolean | null;
  normalizedNote: string | null;
  message: string;
}

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
  boxNotes?: readonly string[],
): ScaleValidationResult {
  const normalizedNote = normalizeNoteName(noteName);

  if (!normalizedNote) {
    return {
      isCorrect: false,
      isInBox: null,
      normalizedNote: null,
      message: "Play a note",
    };
  }

  const normalizedScaleNotes = scaleNotes
    .map((scaleNote) => normalizeNoteName(scaleNote))
    .filter((scaleNote): scaleNote is string => scaleNote !== null);
  const isCorrect = normalizedScaleNotes.includes(normalizedNote);
  const normalizedBoxNotes =
    boxNotes
      ?.map((boxNote) => normalizeNoteName(boxNote))
      .filter((boxNote): boxNote is string => boxNote !== null) ?? null;
  const isInBox = normalizedBoxNotes
    ? normalizedBoxNotes.includes(normalizedNote)
    : null;
  const message = getScaleMessage({
    isCorrect,
    isInBox,
    normalizedNote,
    scaleLabel,
  });

  return {
    isCorrect,
    isInBox,
    normalizedNote,
    message,
  };
}

function getScaleMessage({
  isCorrect,
  isInBox,
  normalizedNote,
  scaleLabel,
}: {
  isCorrect: boolean;
  isInBox: boolean | null;
  normalizedNote: string;
  scaleLabel: string;
}): string {
  if (!isCorrect) {
    return `Outside scale - ${normalizedNote} is not in ${scaleLabel}`;
  }

  if (isInBox === false) {
    return `In scale, but outside selected box`;
  }

  return `Good - ${normalizedNote} is in this box`;
}
