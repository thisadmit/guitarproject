export interface Scale {
  id: string;
  name: string;
  category: "major" | "minor" | "pentatonic" | "blues" | "mode";
  formula: readonly string[];
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  mood: string;
  recommendedFor: string;
}
