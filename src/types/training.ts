import type { FretboardNote } from "./scale";

export type TrainingProblemType = "note" | "scale" | "lick";
export type TrainingDifficulty = "beginner" | "intermediate" | "advanced";
export type TrainingTargetMode = "degree" | "chord";
export type ChordQuality = "major" | "minor" | "dominant7" | "minor7" | "major7";

export interface TrainingProblem {
  id: string;
  title: string;
  type: TrainingProblemType | "target-test";
  difficulty: TrainingDifficulty;
  key: string;
  scale?: string;
  targetNotes: number[];
  sequence?: number[];
  targetMode?: TrainingTargetMode;
}

export interface TrainingTargetProblem {
  id: string;
  mode: TrainingTargetMode;
  key: string;
  scaleId: string;
  scaleName: string;
  boxName: string;
  targetDegree?: string;
  chord?: {
    root: string;
    quality: ChordQuality;
    label: string;
    degrees: string[];
  };
  fretboardNotes: FretboardNote[];
  targetFretboardNotes: FretboardNote[];
  targetMidiNumbers: number[];
  targetNoteNames: string[];
}
