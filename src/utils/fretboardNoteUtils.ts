import type { FretboardNote } from "../types/scale";

export function getPlayableBoxMidiNumbers(
  fretboardNotes: readonly FretboardNote[],
): number[] {
  const midiNumbers = new Set<number>();

  fretboardNotes.forEach((note) => {
    note.acceptedMidiNumbers.forEach((midi) => midiNumbers.add(midi));
  });

  return [...midiNumbers];
}

export function isFretboardNoteInputMatch(
  note: FretboardNote,
  inputMidi: number,
): boolean {
  return note.acceptedMidiNumbers.includes(inputMidi);
}
