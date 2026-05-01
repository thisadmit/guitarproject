export type TrainingProblemType = "note" | "scale" | "lick";
export type TrainingDifficulty = "beginner" | "intermediate" | "advanced";

export interface TrainingProblem {
  id: string;
  title: string;
  type: TrainingProblemType;
  difficulty: TrainingDifficulty;
  key: string;
  scale?: string;
  targetNotes: number[];
  sequence?: number[];
}
