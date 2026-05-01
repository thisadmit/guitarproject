import type { Scale } from "../types/scale";

export const scales: readonly Scale[] = [
  {
    id: "major-scale",
    name: "Major Scale",
    category: "major",
    formula: ["1", "2", "3", "4", "5", "6", "7"],
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
    description:
      "A compact five-note solo vocabulary used across rock, blues, and pop.",
    difficulty: "beginner",
    mood: "direct, guitar-friendly, strong",
    recommendedFor: "First solo boxes, bends, slides, and call-and-response lines.",
  },
  {
    id: "major-pentatonic",
    name: "Major Pentatonic",
    category: "pentatonic",
    formula: ["1", "2", "3", "5", "6"],
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
    description:
      "Minor pentatonic with a blue note added for tension, grit, and release.",
    difficulty: "intermediate",
    mood: "gritty, tense, expressive",
    recommendedFor: "Blues phrasing, passing tones, and expressive bends.",
  },
];
