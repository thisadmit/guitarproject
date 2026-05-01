import type { FretboardNote } from "../types/scale";

export function getPlayableBoxMidiNumbers(
  fretboardNotes: readonly FretboardNote[],
): number[] {
  const midiNumbers = new Set<number>();

  fretboardNotes.forEach((note) => {
    midiNumbers.add(note.midi);
    midiNumbers.add(note.midi + note.displayFret - note.fret);
  });

  return [...midiNumbers];
}
