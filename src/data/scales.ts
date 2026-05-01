import type { Scale } from "../types/scale";

export const scales: readonly Scale[] = [
  {
    id: "a-minor-pentatonic",
    name: "A minor pentatonic",
    notes: ["A", "C", "D", "E", "G"],
    description:
      "A compact five-note vocabulary for rock, blues, and beginner solo practice.",
  },
  {
    id: "e-minor-pentatonic",
    name: "E minor pentatonic",
    notes: ["E", "G", "A", "B", "D"],
    description:
      "A guitar-friendly scale that maps well to open strings and first-position licks.",
  },
  {
    id: "a-blues",
    name: "A blues scale",
    notes: ["A", "C", "D", "D#", "E", "G"],
    description:
      "A minor pentatonic sound with the added blue note for tension and release.",
  },
];
