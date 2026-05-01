export interface Scale {
  id: string;
  name: string;
  category: "major" | "minor" | "pentatonic" | "blues" | "mode";
  formula: readonly string[];
  intervals: readonly number[];
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  mood: string;
  recommendedFor: string;
  boxes?: readonly ScaleBox[];
}

export interface ScaleBox {
  id: string;
  name: string;
  description: string;
  anchorString: 1 | 2 | 3 | 4 | 5 | 6;
  anchorDegree: string;
  anchorRelativeFret: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  pattern: readonly ScaleBoxStringPattern[];
}

export interface ScaleBoxStringPattern {
  stringNumber: 1 | 2 | 3 | 4 | 5 | 6;
  notes: readonly ScaleBoxPatternNote[];
}

export interface ScaleBoxPatternNote {
  relativeFret: number;
  degree: string;
}

export interface FretboardNote {
  stringNumber: 1 | 2 | 3 | 4 | 5 | 6;
  openNote: string;
  fret: number;
  displayFret: number;
  note: string;
  octave: number;
  fullName: string;
  midi: number;
  displayMidi: number;
  acceptedMidiNumbers: readonly number[];
  degree: string;
  isRoot: boolean;
  isInBox: boolean;
}

export type PositionVariant = "auto" | "low" | "high";

export interface PositionVariantResult {
  shift: 0 | -12;
  message: string | null;
  variant: PositionVariant;
}
