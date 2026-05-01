import type { TrainingProblem, TrainingDifficulty } from "../../types/training";

interface TrainingSidebarProps {
  activeProblemId: string;
  problems: readonly TrainingProblem[];
  onSelectProblem: (problem: TrainingProblem) => void;
}

const DIFFICULTIES: readonly TrainingDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

const DIFFICULTY_LABELS: Record<TrainingDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function TrainingSidebar({
  activeProblemId,
  problems,
  onSelectProblem,
}: TrainingSidebarProps) {
  return (
    <aside className="training-sidebar">
      {DIFFICULTIES.map((difficulty) => {
        const group = problems.filter(
          (problem) => problem.difficulty === difficulty,
        );

        return (
          <section className={`training-difficulty ${difficulty}`} key={difficulty}>
            <h3>{DIFFICULTY_LABELS[difficulty]}</h3>
            <div className="training-problem-list">
              {group.map((problem) => (
                <button
                  key={problem.id}
                  className={
                    activeProblemId === problem.id ? "selected" : ""
                  }
                  type="button"
                  onClick={() => onSelectProblem(problem)}
                >
                  <strong>{problem.title}</strong>
                  <span>
                    {problem.key}
                    {problem.scale ? ` ${problem.scale}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </aside>
  );
}
