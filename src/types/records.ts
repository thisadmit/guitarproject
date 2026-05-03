export type TrainingRecordMode = "practice" | "challenge";
export type TrainingRecordType = "scale-drill" | "chord-tone" | "lick";

export interface TrainingRecord {
  id: string;
  userId?: string;
  mode: TrainingRecordMode;
  trainingType: TrainingRecordType;
  key?: string;
  scale?: string;
  box?: string;
  durationSec: number;
  attempts: number;
  correctCount: number;
  accuracy: number;
  maxStreak: number;
  completedProblems: number;
  createdAt: string;
}
