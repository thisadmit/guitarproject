import type { TrainingProblem } from "../types/training";

export const trainingProblems: readonly TrainingProblem[] = [
  {
    id: "find-a-root",
    title: "Find the Root",
    type: "note",
    difficulty: "beginner",
    key: "A",
    scale: "Minor Pentatonic",
    targetNotes: [45, 57, 69, 81],
  },
  {
    id: "play-a-minor-scale",
    title: "Play A Minor Scale",
    type: "scale",
    difficulty: "intermediate",
    key: "A",
    scale: "Natural Minor",
    targetNotes: [45, 47, 48, 50, 52, 53, 55, 57],
  },
  {
    id: "play-g-blues-scale",
    title: "Play G Blues Scale",
    type: "scale",
    difficulty: "intermediate",
    key: "G",
    scale: "Blues",
    targetNotes: [43, 46, 48, 49, 50, 53, 55],
  },
  {
    id: "play-the-lick",
    title: "Play the Lick",
    type: "lick",
    difficulty: "advanced",
    key: "A",
    scale: "Blues",
    targetNotes: [52, 55, 57, 58],
    sequence: [52, 55, 57, 58, 57, 55],
  },
];
