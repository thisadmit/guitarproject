const NOTE_NAMES: readonly string[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export interface NoteInfo {
  note: string;
  octave: number;
  fullName: string;
  midi: number;
  targetFrequency: number;
  cents: number;
}

export function frequencyToNote(frequency: number): NoteInfo | null {
  if (!Number.isFinite(frequency) || frequency <= 0) {
    return null;
  }

  // MIDI note 69 is A4 at 440 Hz.
  const exactMidi = 69 + 12 * Math.log2(frequency / 440);
  const midi = Math.round(exactMidi);
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const targetFrequency = 440 * 2 ** ((midi - 69) / 12);
  const cents = 1200 * Math.log2(frequency / targetFrequency);
  const note = NOTE_NAMES[noteIndex];

  return {
    note,
    octave,
    fullName: `${note}${octave}`,
    midi,
    targetFrequency,
    cents,
  };
}

export function clampCents(cents: number): number {
  return Math.max(-50, Math.min(50, cents));
}
