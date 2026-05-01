export type ChordDifficulty = "beginner" | "intermediate";

export interface ChordFingering {
  frets: readonly (number | "x")[];
  fingers: readonly (number | null)[];
}

export interface Chord {
  id: string;
  name: string;
  quality: string;
  notes: readonly string[];
  description: string;
  beginnerTip: string;
  difficulty: ChordDifficulty;
  fingering?: ChordFingering;
}
