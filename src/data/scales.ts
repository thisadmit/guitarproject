import type { FretboardNote, Scale, ScaleBox } from "../types/scale";

const CHROMATIC_NOTES = [
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
] as const;

const STRING_OPEN_NOTES_BY_NUMBER = {
  6: "E",
  5: "A",
  4: "D",
  3: "G",
  2: "B",
  1: "E",
} as const;

const STRING_OPEN_MIDI_BY_NUMBER = {
  6: 40,
  5: 45,
  4: 50,
  3: 55,
  2: 59,
  1: 64,
} as const;

const MINOR_PENTATONIC_BOXES: readonly ScaleBox[] = [
  {
    id: "box-1",
    name: "Box 1",
    description:
      "Root-position pattern. The 6th-string root anchors the box: A starts at fret 5, C at fret 8, G at fret 3.",
    anchorString: 6,
    anchorDegree: "1",
    anchorRelativeFret: 0,
    difficulty: "beginner",
    pattern: [
      { stringNumber: 6, notes: [{ relativeFret: 0, degree: "1" }, { relativeFret: 3, degree: "b3" }] },
      { stringNumber: 5, notes: [{ relativeFret: 0, degree: "4" }, { relativeFret: 2, degree: "5" }] },
      { stringNumber: 4, notes: [{ relativeFret: 0, degree: "b7" }, { relativeFret: 2, degree: "1" }] },
      { stringNumber: 3, notes: [{ relativeFret: 0, degree: "b3" }, { relativeFret: 2, degree: "4" }] },
      { stringNumber: 2, notes: [{ relativeFret: 0, degree: "5" }, { relativeFret: 3, degree: "b7" }] },
      { stringNumber: 1, notes: [{ relativeFret: 0, degree: "1" }, { relativeFret: 3, degree: "b3" }] },
    ],
  },
  {
    id: "box-2",
    name: "Box 2",
    description:
      "Second connected shape. Its 6th-string anchor is the b3 degree, not a fixed fret.",
    anchorString: 6,
    anchorDegree: "b3",
    anchorRelativeFret: 0,
    difficulty: "beginner",
    pattern: [
      { stringNumber: 6, notes: [{ relativeFret: 0, degree: "b3" }, { relativeFret: 2, degree: "4" }] },
      { stringNumber: 5, notes: [{ relativeFret: -1, degree: "5" }, { relativeFret: 2, degree: "b7" }] },
      { stringNumber: 4, notes: [{ relativeFret: -1, degree: "1" }, { relativeFret: 2, degree: "b3" }] },
      { stringNumber: 3, notes: [{ relativeFret: -1, degree: "4" }, { relativeFret: 1, degree: "5" }] },
      { stringNumber: 2, notes: [{ relativeFret: 0, degree: "b7" }, { relativeFret: 2, degree: "1" }] },
      { stringNumber: 1, notes: [{ relativeFret: 0, degree: "b3" }, { relativeFret: 2, degree: "4" }] },
    ],
  },
  {
    id: "box-3",
    name: "Box 3",
    description:
      "Third connected shape. Its 6th-string anchor is the 4 degree relative to the selected root.",
    anchorString: 6,
    anchorDegree: "4",
    anchorRelativeFret: 0,
    difficulty: "intermediate",
    pattern: [
      { stringNumber: 6, notes: [{ relativeFret: 0, degree: "4" }, { relativeFret: 2, degree: "5" }] },
      { stringNumber: 5, notes: [{ relativeFret: 0, degree: "b7" }, { relativeFret: 2, degree: "1" }] },
      { stringNumber: 4, notes: [{ relativeFret: 0, degree: "b3" }, { relativeFret: 2, degree: "4" }] },
      { stringNumber: 3, notes: [{ relativeFret: -1, degree: "5" }, { relativeFret: 2, degree: "b7" }] },
      { stringNumber: 2, notes: [{ relativeFret: 0, degree: "1" }, { relativeFret: 3, degree: "b3" }] },
      { stringNumber: 1, notes: [{ relativeFret: 0, degree: "4" }, { relativeFret: 2, degree: "5" }] },
    ],
  },
  {
    id: "box-4",
    name: "Box 4",
    description:
      "Fourth connected shape. Its 6th-string anchor is the 5 degree relative to the selected root.",
    anchorString: 6,
    anchorDegree: "5",
    anchorRelativeFret: 0,
    difficulty: "intermediate",
    pattern: [
      { stringNumber: 6, notes: [{ relativeFret: 0, degree: "5" }, { relativeFret: 3, degree: "b7" }] },
      { stringNumber: 5, notes: [{ relativeFret: 0, degree: "1" }, { relativeFret: 3, degree: "b3" }] },
      { stringNumber: 4, notes: [{ relativeFret: 0, degree: "4" }, { relativeFret: 2, degree: "5" }] },
      { stringNumber: 3, notes: [{ relativeFret: 0, degree: "b7" }, { relativeFret: 2, degree: "1" }] },
      { stringNumber: 2, notes: [{ relativeFret: 1, degree: "b3" }, { relativeFret: 3, degree: "4" }] },
      { stringNumber: 1, notes: [{ relativeFret: 0, degree: "5" }, { relativeFret: 3, degree: "b7" }] },
    ],
  },
  {
    id: "box-5",
    name: "Box 5",
    description:
      "Fifth connected shape. Its 6th-string anchor is the b7 degree before the pattern resolves back to Box 1.",
    anchorString: 6,
    anchorDegree: "b7",
    anchorRelativeFret: 0,
    difficulty: "intermediate",
    pattern: [
      { stringNumber: 6, notes: [{ relativeFret: 0, degree: "b7" }, { relativeFret: 2, degree: "1" }] },
      { stringNumber: 5, notes: [{ relativeFret: 0, degree: "b3" }, { relativeFret: 2, degree: "4" }] },
      { stringNumber: 4, notes: [{ relativeFret: -1, degree: "5" }, { relativeFret: 2, degree: "b7" }] },
      { stringNumber: 3, notes: [{ relativeFret: -1, degree: "1" }, { relativeFret: 2, degree: "b3" }] },
      { stringNumber: 2, notes: [{ relativeFret: 0, degree: "4" }, { relativeFret: 2, degree: "5" }] },
      { stringNumber: 1, notes: [{ relativeFret: 0, degree: "b7" }, { relativeFret: 2, degree: "1" }] },
    ],
  },
];

export const scales: readonly Scale[] = [
  {
    id: "major-scale",
    name: "Major Scale",
    category: "major",
    formula: ["1", "2", "3", "4", "5", "6", "7"],
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description:
      "The foundation for melody, harmony, intervals, and key-center practice.",
    difficulty: "beginner",
    mood: "bright, resolved, open",
    recommendedFor: "Learning intervals and building clean melodic targets.",
  },
  {
    id: "natural-minor-scale",
    name: "Natural Minor Scale",
    category: "minor",
    formula: ["1", "2", "b3", "4", "5", "b6", "b7"],
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description:
      "A core minor sound for expressive melodies and darker progressions.",
    difficulty: "beginner",
    mood: "dark, expressive, cinematic",
    recommendedFor: "Minor-key phrasing and emotional melodic control.",
  },
  {
    id: "minor-pentatonic",
    name: "Minor Pentatonic",
    category: "pentatonic",
    formula: ["1", "b3", "4", "5", "b7"],
    intervals: [0, 3, 5, 7, 10],
    description:
      "A compact five-note solo vocabulary used across rock, blues, and pop.",
    difficulty: "beginner",
    mood: "direct, guitar-friendly, strong",
    recommendedFor: "First solo boxes, bends, slides, and call-and-response lines.",
    boxes: MINOR_PENTATONIC_BOXES,
  },
  {
    id: "major-pentatonic",
    name: "Major Pentatonic",
    category: "pentatonic",
    formula: ["1", "2", "3", "5", "6"],
    intervals: [0, 2, 4, 7, 9],
    description:
      "A lighter five-note sound that fits country, pop, worship, and melodic rock.",
    difficulty: "beginner",
    mood: "sweet, open, melodic",
    recommendedFor: "Major-key lead lines and simple vocal-style phrases.",
  },
  {
    id: "blues-scale",
    name: "Blues Scale",
    category: "blues",
    formula: ["1", "b3", "4", "b5", "5", "b7"],
    intervals: [0, 3, 5, 6, 7, 10],
    description:
      "Minor pentatonic with a blue note added for tension, grit, and release.",
    difficulty: "intermediate",
    mood: "gritty, tense, expressive",
    recommendedFor: "Blues phrasing, passing tones, and expressive bends.",
  },
];

export function getScaleNotes(scale: Scale, keyName: string): string[] {
  const rootPitchClass = getPitchClass(keyName);

  return scale.intervals.map(
    (interval) =>
      CHROMATIC_NOTES[(rootPitchClass + interval) % CHROMATIC_NOTES.length],
  );
}

export function getScaleBoxByName(
  scale: Scale,
  boxName: string,
): ScaleBox | null {
  return scale.boxes?.find((box) => box.name === boxName) ?? null;
}

export function getTransposedBoxNotes(
  scale: Scale,
  box: ScaleBox,
  keyName: string,
): FretboardNote[] {
  return generateScaleBox(keyName, scale, box);
}

export function generateScaleBox(
  rootKey: string,
  scale: Scale,
  box: ScaleBox,
): FretboardNote[] {
  const rootFret = getRootFretOnString(rootKey, box.anchorString);
  const anchorDegreeOffset = getDegreeInterval(scale, box.anchorDegree);
  const anchorFret =
    rootFret + anchorDegreeOffset - box.anchorRelativeFret;

  return box.pattern.flatMap((stringPattern) =>
    stringPattern.notes.map((patternNote) => {
      const fret = anchorFret + patternNote.relativeFret;
      const openNote = STRING_OPEN_NOTES_BY_NUMBER[stringPattern.stringNumber];
      const note = getNoteAtFret(openNote, fret);
      const midi = STRING_OPEN_MIDI_BY_NUMBER[stringPattern.stringNumber] + fret;

      return {
        stringNumber: stringPattern.stringNumber,
        openNote,
        fret,
        note,
        octave: getOctaveFromMidi(midi),
        fullName: `${note}${getOctaveFromMidi(midi)}`,
        midi,
        degree: patternNote.degree,
        isRoot: patternNote.degree === "1",
      };
    }),
  );
}

function getRootFretOnString(
  rootKey: string,
  stringNumber: ScaleBox["anchorString"],
): number {
  const openPitchClass = getPitchClass(STRING_OPEN_NOTES_BY_NUMBER[stringNumber]);
  const rootPitchClass = getPitchClass(rootKey);

  return (
    (rootPitchClass - openPitchClass + CHROMATIC_NOTES.length) %
    CHROMATIC_NOTES.length
  );
}

function getDegreeInterval(scale: Scale, degree: string): number {
  const degreeIndex = scale.formula.indexOf(degree);

  if (degreeIndex < 0) {
    throw new Error(`Degree ${degree} is not part of ${scale.name}`);
  }

  return scale.intervals[degreeIndex];
}

function getNoteAtFret(openNote: string, fret: number): string {
  return CHROMATIC_NOTES[
    (getPitchClass(openNote) + fret + CHROMATIC_NOTES.length * 3) %
      CHROMATIC_NOTES.length
  ];
}

function getPitchClass(note: string): number {
  const index = CHROMATIC_NOTES.indexOf(note as (typeof CHROMATIC_NOTES)[number]);

  if (index < 0) {
    throw new Error(`Unsupported note: ${note}`);
  }

  return index;
}

function getOctaveFromMidi(midi: number): number {
  return Math.floor(midi / 12) - 1;
}
