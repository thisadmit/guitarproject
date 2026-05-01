import type { Scale } from "../../types/scale";

interface GuidedExercisePanelProps {
  selectedScale: Scale;
}

export function GuidedExercisePanel({ selectedScale }: GuidedExercisePanelProps) {
  return (
    <section className="solo-card guided-exercise">
      <div className="section-heading">
        <h2>Guided Exercise</h2>
        <span>Feedback later</span>
      </div>
      <div className="exercise-sequence">
        {selectedScale.formula.slice(0, 5).map((degree) => (
          <span key={degree}>{degree}</span>
        ))}
      </div>
      <p>
        Future lessons will play a target sequence, listen to your response, and
        explain timing or note mistakes.
      </p>
    </section>
  );
}
