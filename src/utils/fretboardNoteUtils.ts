import type { FretboardNote } from "../types/scale";

export function getPlayableBoxMidiNumbers(
  fretboardNotes: readonly FretboardNote[],
): number[] {
  const midiNumbers = new Set<number>();

  fretboardNotes
    .filter((note) => note.isInBox)
    .forEach((note) => {
      getAcceptedMidiNumbers(note).forEach((midi) => midiNumbers.add(midi));
    });

  return [...midiNumbers];
}

export function isFretboardNoteInputMatch(
  note: FretboardNote,
  inputMidi: number,
): boolean {
  return getAcceptedMidiNumbers(note).includes(inputMidi);
}

export function getDisplayMidi(note: FretboardNote): number {
  return note.midi + note.displayFret - note.fret;
}

export function getAcceptedMidiNumbers(note: FretboardNote): number[] {
  const displayMidi = getDisplayMidi(note);

  return note.midi === displayMidi ? [note.midi] : [note.midi, displayMidi];
}
