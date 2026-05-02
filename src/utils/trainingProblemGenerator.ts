import {
  getReusableScaleBoxByName,
  getTransposedBoxNotes,
  scales,
} from "../data/scales";
import type { Scale } from "../types/scale";
import type {
  ChordQuality,
  TrainingTargetProblem,
} from "../types/training";
import { getAcceptedMidiNumbers } from "./fretboardNoteUtils";

const KEYS = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"] as const;
const BOX_NAMES = ["Box 1", "Box 2", "Box 3", "Box 4", "Box 5"] as const;

const CHORD_QUALITIES: readonly {
  quality: ChordQuality;
  suffix: string;
  degrees: string[];
  intervals: number[];
}[] = [
  { quality: "major", suffix: "", degrees: ["1", "3", "5"], intervals: [0, 4, 7] },
  { quality: "minor", suffix: "m", degrees: ["1", "b3", "5"], intervals: [0, 3, 7] },
  { quality: "dominant7", suffix: "7", degrees: ["1", "3", "5", "b7"], intervals: [0, 4, 7, 10] },
  { quality: "minor7", suffix: "m7", degrees: ["1", "b3", "5", "b7"], intervals: [0, 3, 7, 10] },
  { quality: "major7", suffix: "maj7", degrees: ["1", "3", "5", "7"], intervals: [0, 4, 7, 11] },
];

const CHROMATIC_SCALE: Scale = {
  id: "chromatic-training-grid",
  name: "Chromatic Training Grid",
  category: "mode",
  formula: ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"],
  intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  description: "Internal grid scale for training fretboard coverage.",
  difficulty: "beginner",
  mood: "neutral",
  recommendedFor: "Training grid generation.",
};

export function generateRandomToneProblem(): TrainingTargetProblem {
  const key = pickRandom(KEYS);
  const scale = pickRandom(scales);
  const boxName = pickRandom(BOX_NAMES);
  const box = getRequiredBox(boxName);
  const targetDegree = pickRandom(scale.formula);
  const fretboardNotes = getTransposedBoxNotes(scale, box, key, "auto");
  const targetFretboardNotes = fretboardNotes.filter(
    (note) => note.degree === targetDegree && note.isInBox,
  );

  return {
    id: createProblemId("degree"),
    mode: "degree",
    key,
    scaleId: scale.id,
    scaleName: scale.name,
    boxName,
    targetDegree,
    fretboardNotes,
    targetFretboardNotes,
    targetMidiNumbers: getTargetMidiNumbers(targetFretboardNotes),
    targetNoteNames: getTargetNoteNames(targetFretboardNotes),
  };
}

export function generateChordToneProblem(): TrainingTargetProblem {
  const key = pickRandom(KEYS);
  const boxName = pickRandom(BOX_NAMES);
  const box = getRequiredBox(boxName);
  const chord = pickRandom(CHORD_QUALITIES);
  const chordScale: Scale = {
    id: `training-${chord.quality}`,
    name: `${key}${chord.suffix}`,
    category: "mode",
    formula: chord.degrees,
    intervals: chord.intervals,
    description: "Internal chord-tone scale for training problem generation.",
    difficulty: "intermediate",
    mood: "focused",
    recommendedFor: "Chord tone recognition.",
  };
  const fretboardNotes = getTransposedBoxNotes(CHROMATIC_SCALE, box, key, "auto");
  const targetFretboardNotes = getTransposedBoxNotes(chordScale, box, key, "auto")
    .filter((note) => note.isInBox);

  return {
    id: createProblemId("chord"),
    mode: "chord",
    key,
    scaleId: chordScale.id,
    scaleName: chordScale.name,
    boxName,
    chord: {
      root: key,
      quality: chord.quality,
      label: `${key}${chord.suffix}`,
      degrees: chord.degrees,
    },
    fretboardNotes,
    targetFretboardNotes,
    targetMidiNumbers: getTargetMidiNumbers(targetFretboardNotes),
    targetNoteNames: getTargetNoteNames(targetFretboardNotes),
  };
}

function getTargetMidiNumbers(notes: TrainingTargetProblem["targetFretboardNotes"]): number[] {
  const midiNumbers = new Set<number>();

  notes.forEach((note) => {
    getAcceptedMidiNumbers(note).forEach((midi) => midiNumbers.add(midi));
  });

  return [...midiNumbers];
}

function getTargetNoteNames(notes: TrainingTargetProblem["targetFretboardNotes"]): string[] {
  return [...new Set(notes.map((note) => note.note))];
}

function getRequiredBox(boxName: string) {
  const box = getReusableScaleBoxByName(boxName);

  if (!box) {
    throw new Error(`Unsupported training box: ${boxName}`);
  }

  return box;
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function createProblemId(mode: string): string {
  return `${mode}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
