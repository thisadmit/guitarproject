import { useState } from "react";
import { trainingProblems } from "../../data/trainingProblems";
import { useAudioInput } from "../../hooks/useAudioInput";
import { useTuner } from "../../hooks/useTuner";
import type {
  TrainingChallengeTimingMode,
  TrainingProblem,
  TrainingSessionMode,
} from "../../types/training";
import type { StabilizerConfig } from "../../utils/tunerStabilizer";
import { TrainingContent } from "../training/TrainingContent";
import { TrainingSidebar } from "../training/TrainingSidebar";

const TRAINING_TUNER_CONFIG: Partial<StabilizerConfig> = {
  attackIgnoreMs: 40,
  minClarity: 0.55,
  noteStableFrames: 2,
  rmsThreshold: 0.005,
  signalReleaseMs: 250,
};

const CHALLENGE_TOTAL_LIMITS = [30, 60, 120] as const;

export function TrainingPage() {
  const [activeProblem, setActiveProblem] = useState<TrainingProblem>(
    trainingProblems[0],
  );
  const [sessionMode, setSessionMode] =
    useState<TrainingSessionMode>("practice");
  const [challengeTimingMode, setChallengeTimingMode] =
    useState<TrainingChallengeTimingMode>("total");
  const [totalTimeLimitSec, setTotalTimeLimitSec] = useState<number>(60);
  const [intervalTimeSec, setIntervalTimeSec] = useState<number>(5);
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
    <section
      className={`page-stack training-page ${
        sessionMode === "challenge" ? "challenge-mode" : "training-mode"
      }`}
      aria-label="Training"
    >
      <div className="mode-hero training-mode-hero">
        <div>
          <h2>Training</h2>
          <strong>Tests, drills, and feedback</strong>
          <p>
            Training problems are isolated from Practice and Learning state.
            Correctness is judged by MIDI note identity.
          </p>
        </div>
        <div className="training-hero-mode-panel" aria-label="Training session mode">
          <div className="session-mode-toggle">
            <button
              className={sessionMode === "practice" ? "selected" : ""}
              type="button"
              onClick={() => setSessionMode("practice")}
            >
              Training
            </button>
            <button
              className={sessionMode === "challenge" ? "selected" : ""}
              type="button"
              onClick={() => setSessionMode("challenge")}
            >
              Challenge
            </button>
          </div>
        </div>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      {sessionMode === "challenge" ? (
        <section className="challenge-config-panel global-challenge-config" aria-label="Challenge settings">
          <div className="section-heading compact">
            <h2>Challenge Settings</h2>
            <span>
              {challengeTimingMode === "total" ? "Total Limit" : "Problem Interval"}
            </span>
          </div>
          <div className="challenge-config-grid">
            <div className="challenge-config-group">
              <span>Timer Type</span>
              <div className="segmented-control">
                <button
                  className={challengeTimingMode === "total" ? "selected" : ""}
                  type="button"
                  onClick={() => setChallengeTimingMode("total")}
                >
                  Total Limit
                </button>
                <button
                  className={challengeTimingMode === "interval" ? "selected" : ""}
                  type="button"
                  onClick={() => setChallengeTimingMode("interval")}
                >
                  Problem Interval
                </button>
              </div>
            </div>
            <div className="challenge-config-group">
              <span>
                {challengeTimingMode === "total" ? "Total Time" : "Interval"}
              </span>
              <div className="time-limit-selector" aria-label="Challenge time value">
                {challengeTimingMode === "total" ? (
                  CHALLENGE_TOTAL_LIMITS.map((limitSec) => (
                    <button
                      className={totalTimeLimitSec === limitSec ? "selected" : ""}
                      key={limitSec}
                      type="button"
                      onClick={() => setTotalTimeLimitSec(limitSec)}
                    >
                      {limitSec}s
                    </button>
                  ))
                ) : (
                  <label className="interval-slider-control">
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={intervalTimeSec}
                      onChange={(event) => setIntervalTimeSec(Number(event.target.value))}
                    />
                    <strong>{intervalTimeSec.toFixed(1)}s</strong>
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

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
          challengeTimingMode={challengeTimingMode}
          intervalTimeSec={intervalTimeSec}
          sessionMode={sessionMode}
          totalTimeLimitSec={totalTimeLimitSec}
        />
      </div>
    </section>
  );
}
