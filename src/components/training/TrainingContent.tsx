import type { NoteInfo } from "../../utils/noteUtils";
import type { TrainingProblem } from "../../types/training";

interface TrainingContentProps {
  currentInput: NoteInfo | null;
  isListening: boolean;
  onToggleListening: () => void;
  problem: TrainingProblem;
}

export function TrainingContent({
  currentInput,
  isListening,
  onToggleListening,
  problem,
}: TrainingContentProps) {
  const isCorrect =
    currentInput !== null && problem.targetNotes.includes(currentInput.midi);
  const isWrong = currentInput !== null && !isCorrect;
  const targetLabel =
    problem.type === "lick"
      ? "Follow the sequence"
      : problem.type === "scale"
        ? `Play notes from ${problem.key} ${problem.scale}`
        : `Find ${problem.key} root notes`;

  return (
    <section className={`training-content ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}>
      <div className="section-heading">
        <h2>{problem.title}</h2>
        <span>{problem.type}</span>
      </div>

      <div className="training-target-card">
        <span>Current Target</span>
        <strong>{targetLabel}</strong>
        <p>Judgement uses MIDI note numbers only, not fret positions.</p>
      </div>

      <div className="training-readout-grid">
        <div>
          <span>Your Note</span>
          <strong>{currentInput?.fullName ?? "--"}</strong>
        </div>
        <div>
          <span>Result</span>
          <strong>
            {!isListening
              ? "Stopped"
              : currentInput === null
                ? "Listening"
                : isCorrect
                  ? "Correct"
                  : "Wrong"}
          </strong>
        </div>
        <div>
          <span>Score</span>
          <strong>{isCorrect ? "1" : "0"}</strong>
        </div>
        <div>
          <span>Streak</span>
          <strong>{isCorrect ? "1" : "0"}</strong>
        </div>
      </div>

      <button className="primary-button" type="button" onClick={onToggleListening}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
    </section>
  );
}
