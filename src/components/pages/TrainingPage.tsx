import { useState } from "react";
import { trainingProblems } from "../../data/trainingProblems";
import { useAudioInput } from "../../hooks/useAudioInput";
import { useTuner } from "../../hooks/useTuner";
import type { TrainingProblem } from "../../types/training";
import type { StabilizerConfig } from "../../utils/tunerStabilizer";
import { TrainingContent } from "../training/TrainingContent";
import { TrainingSidebar } from "../training/TrainingSidebar";

const TRAINING_TUNER_CONFIG: Partial<StabilizerConfig> = {
  attackIgnoreMs: 40,
  minClarity: 0.55,
  noteStableFrames: 2,
  signalReleaseMs: 250,
};

export function TrainingPage() {
  const [activeProblem, setActiveProblem] = useState<TrainingProblem>(
    trainingProblems[0],
  );
  const { analyserNode, error, isRunning, sampleRate, start, stop } =
    useAudioInput();
  const reading = useTuner(
    analyserNode,
    sampleRate,
    isRunning,
    TRAINING_TUNER_CONFIG,
  );
  const currentInput = reading.hasSignal ? reading.note : null;

  const handleToggleListening = (): void => {
    if (isRunning) {
      stop();
    } else {
      void start();
    }
  };

  return (
    <section className="page-stack" aria-label="Training">
      <div className="mode-hero training-mode-hero">
        <div>
          <h2>Training</h2>
          <strong>Tests, drills, and feedback</strong>
          <p>
            Training problems are isolated from Practice and Learning state.
            Correctness is judged by MIDI note identity.
          </p>
        </div>
        <div className="mode-focus-badge training">Training</div>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      <div className="training-layout">
        <TrainingSidebar
          activeProblemId={activeProblem.id}
          problems={trainingProblems}
          onSelectProblem={setActiveProblem}
        />
        <TrainingContent
          currentInput={currentInput}
          isListening={isRunning}
          onToggleListening={handleToggleListening}
          problem={activeProblem}
        />
      </div>
    </section>
  );
}
