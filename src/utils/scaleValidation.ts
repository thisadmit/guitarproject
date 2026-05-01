export interface ScaleValidationResult {
  isCorrect: boolean;
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

export function isNoteInScale(
  noteName: string | null | undefined,
  scaleNotes: readonly string[],
  scaleLabel = "the selected scale",
): ScaleValidationResult {
  const normalizedNote = normalizeNoteName(noteName);

  if (!normalizedNote) {
    return {
      isCorrect: false,
      normalizedNote: null,
      message: "Play a note",
    };
  }

  const normalizedScaleNotes = scaleNotes
    .map((scaleNote) => normalizeNoteName(scaleNote))
    .filter((scaleNote): scaleNote is string => scaleNote !== null);
  const isCorrect = normalizedScaleNotes.includes(normalizedNote);

  return {
    isCorrect,
    normalizedNote,
    message: isCorrect
      ? `Good - ${normalizedNote} is in ${scaleLabel}`
      : `Outside Scale - ${normalizedNote} is not in ${scaleLabel}`,
  };
}
