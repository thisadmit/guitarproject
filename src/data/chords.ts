import type { Chord } from "../types/chord";

export const chords: readonly Chord[] = [
  {
    id: "c-major",
    name: "C",
    quality: "major",
    notes: ["C", "E", "G"],
    description:
      "C major is one of the core open-position chords and a useful anchor for learning clean string separation.",
    beginnerTip:
      "Keep your first finger curled so the open high E string can ring clearly.",
    difficulty: "beginner",
    fingering: {
      frets: ["x", 3, 2, 0, 1, 0],
      fingers: [null, 3, 2, null, 1, null],
    },
  },
  {
    id: "g-major",
    name: "G",
    quality: "major",
    notes: ["G", "B", "D"],
    description:
      "G major is a bright open chord used constantly in folk, pop, rock, and worship progressions.",
    beginnerTip:
      "Place the low-string fingers first, then check that the middle strings stay open.",
    difficulty: "beginner",
    fingering: {
      frets: [3, 2, 0, 0, 0, 3],
      fingers: [2, 1, null, null, null, 3],
    },
  },
  {
    id: "d-major",
    name: "D",
    quality: "major",
    notes: ["D", "F#", "A"],
    description:
      "D major is a compact chord that focuses the sound on the top four strings.",
    beginnerTip:
      "Start your strum from the D string and avoid hitting the low E and A strings.",
    difficulty: "beginner",
    fingering: {
      frets: ["x", "x", 0, 2, 3, 2],
      fingers: [null, null, null, 1, 3, 2],
    },
  },
  {
    id: "a-minor",
    name: "Am",
    quality: "minor",
    notes: ["A", "C", "E"],
    description:
      "A minor shares a familiar shape with E major and gives progressions a darker color.",
    beginnerTip:
      "Keep your thumb relaxed behind the neck so the first string can stay open.",
    difficulty: "beginner",
    fingering: {
      frets: ["x", 0, 2, 2, 1, 0],
      fingers: [null, null, 2, 3, 1, null],
    },
  },
  {
    id: "e-minor",
    name: "Em",
    quality: "minor",
    notes: ["E", "G", "B"],
    description:
      "E minor is a simple two-finger chord with a full six-string sound.",
    beginnerTip:
      "Strum all six strings and listen for even volume from the open strings.",
    difficulty: "beginner",
    fingering: {
      frets: [0, 2, 2, 0, 0, 0],
      fingers: [null, 2, 3, null, null, null],
    },
  },
  {
    id: "f-major",
    name: "F",
    quality: "major",
    notes: ["F", "A", "C"],
    description:
      "F major introduces partial-barre control and prepares your hand for full barre chords.",
    beginnerTip:
      "Use the side of your first finger for the top two strings and press only as hard as needed.",
    difficulty: "intermediate",
    fingering: {
      frets: ["x", "x", 3, 2, 1, 1],
      fingers: [null, null, 3, 2, 1, 1],
    },
  },
];
