import type { FretboardNote } from "./scale";

export type TrainingProblemType =
  | "note"
  | "scale"
  | "lick"
  | "target-test"
  | "scale-drill";
export type TrainingDifficulty = "beginner" | "intermediate" | "advanced";
export type TrainingTargetMode = "degree" | "chord";
export type TrainingSessionMode = "practice" | "challenge";
export type TrainingChallengeTimingMode = "total" | "interval";
export type ChordQuality = "major" | "minor" | "dominant7" | "minor7" | "major7";

export interface TrainingProblem {
  id: string;
  title: string;
  type: TrainingProblemType;
  difficulty: TrainingDifficulty;
  key: string;
  scale?: string;
  targetNotes: number[];
  sequence?: number[];
  targetMode?: TrainingTargetMode;
  fixedScaleId?: string;
}

export interface TrainingTargetProblem {
  id: string;
  mode: TrainingTargetMode | "scale-drill";
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
