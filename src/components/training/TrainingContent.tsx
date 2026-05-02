import { useEffect, useRef, useState } from "react";
import { scales } from "../../data/scales";
import type { FretboardNote } from "../../types/scale";
import type {
  TrainingChallengeTimingMode,
  TrainingProblem,
  TrainingSessionMode,
  TrainingTargetProblem,
} from "../../types/training";
import { getAcceptedMidiNumbers } from "../../utils/fretboardNoteUtils";
import type { NoteInfo } from "../../utils/noteUtils";
import {
  SCALE_DRILL_SCALE_IDS,
  TRAINING_BOX_NAMES,
  TRAINING_KEYS,
  generateChordToneProblem,
  generateRandomToneProblem,
  generateRandomScaleDrillProblem,
  generateScaleDrillProblem,
} from "../../utils/trainingProblemGenerator";
import { TrainingRevealFretboard } from "./TrainingRevealFretboard";

interface TrainingContentProps {
  currentInput: NoteInfo | null;
  challengeTimingMode: TrainingChallengeTimingMode;
  intervalTimeSec: number;
  isListening: boolean;
  onToggleListening: () => void;
  problem: TrainingProblem;
  sessionMode: TrainingSessionMode;
  totalTimeLimitSec: number;
}

interface TargetScore {
  attempts: number;
  correctCount: number;
  streak: number;
}

interface ChallengeResult {
  problemType: "random-tone" | "chord-tone" | "scale-drill";
  durationSec: number;
  correctCount: number;
  attempts: number;
  accuracy: number;
  maxStreak: number;
  completedProblems: number;
  createdAt: string;
}

interface ScaleDrillSelection {
  boxName: string;
  key: string;
  scaleId: string;
}

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

const GUITAR_MIDI_MIN = 40;
const GUITAR_MIDI_MAX = 88;
const FIXED_ROOT_PROBLEM_ID = "find-fixed-root";
const DEFAULT_SCALE_DRILL_SELECTION: ScaleDrillSelection = {
  boxName: "Box 1",
  key: "A",
  scaleId: "minor-pentatonic",
};
const SCALE_DRILL_SCALES = SCALE_DRILL_SCALE_IDS.map((scaleId) => {
  const scale = scales.find((candidate) => candidate.id === scaleId);

  if (!scale) {
    throw new Error(`Unsupported scale drill scale: ${scaleId}`);
  }

  return scale;
});
const DEGREE_LABELS: Record<string, string> = {
  "1": "Root",
  "2": "Major 2nd",
  b3: "Minor 3rd",
  "3": "Major 3rd",
  "4": "Perfect 4th",
  b5: "Blue Note",
  "5": "Perfect 5th",
  "6": "Major 6th",
  b7: "Minor 7th",
  "7": "Major 7th",
};
export function TrainingContent({
  currentInput,
  challengeTimingMode,
  intervalTimeSec,
  isListening,
  onToggleListening,
  problem,
  sessionMode,
  totalTimeLimitSec,
}: TrainingContentProps) {
  if (problem.type === "target-test" || problem.type === "scale-drill") {
    return (
      <TargetTrainingContent
        currentInput={currentInput}
        challengeTimingMode={challengeTimingMode}
        intervalTimeSec={intervalTimeSec}
        isListening={isListening}
        onToggleListening={onToggleListening}
        problem={problem}
        sessionMode={sessionMode}
        totalTimeLimitSec={totalTimeLimitSec}
      />
    );
  }

  return (
    <RootTrainingContent
      currentInput={currentInput}
      challengeTimingMode={challengeTimingMode}
      intervalTimeSec={intervalTimeSec}
      isListening={isListening}
      onToggleListening={onToggleListening}
      problem={problem}
      sessionMode={sessionMode}
      totalTimeLimitSec={totalTimeLimitSec}
    />
  );
}

function TargetTrainingContent({
  currentInput,
  challengeTimingMode,
  intervalTimeSec,
  isListening,
  onToggleListening,
  problem,
  sessionMode,
  totalTimeLimitSec,
}: TrainingContentProps) {
  const [targetProblem, setTargetProblem] = useState<TrainingTargetProblem | null>(null);
  const [revealedNotes, setRevealedNotes] = useState<FretboardNote[]>([]);
  const [temporaryWrongInput, setTemporaryWrongInput] = useState<NoteInfo | null>(null);
  const [score, setScore] = useState<TargetScore>({
    attempts: 0,
    correctCount: 0,
    streak: 0,
  });
  const [feedback, setFeedback] = useState<string>("Press Start to begin.");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isRevealHeld, setIsRevealHeld] = useState<boolean>(false);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [completedProblems, setCompletedProblems] = useState<number>(0);
  const [challengeResult, setChallengeResult] = useState<ChallengeResult | null>(null);
  const [showClearEffect, setShowClearEffect] = useState<boolean>(false);
  const [scaleDrillSelection, setScaleDrillSelection] =
    useState<ScaleDrillSelection>(DEFAULT_SCALE_DRILL_SELECTION);
  const lastProcessedMidiRef = useRef<number | null>(null);
  const wrongTimeoutRef = useRef<number | null>(null);
  const clearEffectTimeoutRef = useRef<number | null>(null);
  const scoreRef = useRef<TargetScore>(score);
  const maxStreakRef = useRef<number>(0);
  const completedProblemsRef = useRef<number>(0);
  const activeChallengeDurationRef = useRef<number>(60);

  const isChordMode = problem.targetMode === "chord";
  const isScaleDrillMode = problem.type === "scale-drill";
  const isChallengeMode = sessionMode === "challenge";
  const useManualScaleDrillSelection = isScaleDrillMode && !isChallengeMode;
  const selectedScale = getScaleDrillScale(scaleDrillSelection.scaleId);
  const selectedScaleDisplayName = getScaleDrillDisplayName(selectedScale.name);
  const selectedChallengeDurationSec =
    challengeTimingMode === "total" ? totalTimeLimitSec : intervalTimeSec;
  const foundCount = revealedNotes.length;
  const totalTargets = targetProblem?.targetFretboardNotes.length ?? 0;
  const accuracy =
    score.attempts > 0 ? Math.round((score.correctCount / score.attempts) * 100) : 0;
  const isComplete = totalTargets > 0 && foundCount >= totalTargets;
  const canJudgeInput = sessionMode === "practice" || timeLeftSec > 0;

  useEffect(() => {
    setTargetProblem(null);
    setRevealedNotes([]);
    setTemporaryWrongInput(null);
    setScore({ attempts: 0, correctCount: 0, streak: 0 });
    setFeedback("Press Start to begin.");
    setIsActive(false);
    setIsRevealHeld(false);
    setIsTimerRunning(false);
    setTimeLeftSec(selectedChallengeDurationSec);
    setMaxStreak(0);
    setCompletedProblems(0);
    setChallengeResult(null);
    setShowClearEffect(false);
    lastProcessedMidiRef.current = null;
  }, [problem.id]);

  useEffect(() => {
    if (!useManualScaleDrillSelection) {
      return;
    }

    setTargetProblem(null);
    setRevealedNotes([]);
    setTemporaryWrongInput(null);
    setIsRevealHeld(false);
    setIsActive(false);
    setShowClearEffect(false);
    setFeedback("Press Start to begin with the selected key, scale, and box.");
    lastProcessedMidiRef.current = null;
  }, [scaleDrillSelection, useManualScaleDrillSelection]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    maxStreakRef.current = maxStreak;
  }, [maxStreak]);

  useEffect(() => {
    completedProblemsRef.current = completedProblems;
  }, [completedProblems]);

  useEffect(() => {
    if (sessionMode === "practice") {
      setIsTimerRunning(false);
      setTimeLeftSec(selectedChallengeDurationSec);
      setIsActive(false);
      setTemporaryWrongInput(null);
      setIsRevealHeld(false);
      setChallengeResult(null);
      setShowClearEffect(false);
      setFeedback("Practice mode selected.");
      return;
    }

    setIsTimerRunning(false);
    setTimeLeftSec(selectedChallengeDurationSec);
    setRevealedNotes([]);
    setTemporaryWrongInput(null);
    setIsRevealHeld(false);
    setIsActive(false);
    setChallengeResult(null);
    setShowClearEffect(false);
    setFeedback("Press Start to begin challenge.");
  }, [sessionMode]);

  useEffect(() => {
    if (!isTimerRunning) {
      setTimeLeftSec(selectedChallengeDurationSec);
    }
  }, [isTimerRunning, selectedChallengeDurationSec]);

  useEffect(() => {
    if (!isTimerRunning || sessionMode !== "challenge") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimeLeftSec((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setIsTimerRunning(false);
          setIsActive(false);
          setFeedback("Time is up - challenge complete.");
          setChallengeResult(
            createChallengeResult({
              problem,
              durationSec: activeChallengeDurationRef.current,
              score: scoreRef.current,
              maxStreak: maxStreakRef.current,
              completedProblems: completedProblemsRef.current,
            }),
          );
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isTimerRunning, problem, sessionMode]);

  useEffect(() => {
    if (currentInput === null) {
      lastProcessedMidiRef.current = null;
      return;
    }

    if (!isActive || !targetProblem || isComplete || !canJudgeInput) {
      return;
    }

    if (lastProcessedMidiRef.current === currentInput.midi) {
      return;
    }

    lastProcessedMidiRef.current = currentInput.midi;

    if (!targetProblem.targetMidiNumbers.includes(currentInput.midi)) {
      registerWrongInput(currentInput);
      return;
    }

    const matchedNote = targetProblem.targetFretboardNotes.find(
      (note) =>
        getAcceptedMidiNumbers(note).includes(currentInput.midi) &&
        !revealedNotes.some((revealedNote) => isSameFretboardLocation(revealedNote, note)),
    );

    if (!matchedNote) {
      setFeedback("Already found - try another position.");
      return;
    }

    const nextRevealedNotes = [...revealedNotes, matchedNote];
    setRevealedNotes(nextRevealedNotes);
    setTemporaryWrongInput(null);
    setScore((current) => {
      const nextStreak = current.streak + 1;
      setMaxStreak((currentMax) => {
        const nextMax = Math.max(currentMax, nextStreak);
        maxStreakRef.current = nextMax;
        return nextMax;
      });

      const nextScore = {
        attempts: current.attempts + 1,
        correctCount: current.correctCount + 1,
        streak: nextStreak,
      };

      scoreRef.current = nextScore;
      return nextScore;
    });

    const complete = nextRevealedNotes.length >= targetProblem.targetFretboardNotes.length;
    if (complete && isChallengeMode) {
      const nextProblem = createTargetProblem(
        problem,
        getScaleDrillGenerationOptions({
          problem,
          scaleDrillSelection,
          useManualScaleDrillSelection,
        }),
      );
      setCompletedProblems((current) => {
        const nextCompleted = current + 1;
        completedProblemsRef.current = nextCompleted;
        return nextCompleted;
      });
      setTargetProblem(nextProblem);
      setRevealedNotes([]);
      setTemporaryWrongInput(null);
      setIsRevealHeld(false);
      showClearCelebration();
      if (challengeTimingMode === "interval") {
        setTimeLeftSec(intervalTimeSec);
      }
      setFeedback("Problem complete - next challenge.");
      return;
    }

    setFeedback(
      complete
        ? getCompleteFeedback(targetProblem)
        : getCorrectFeedback(targetProblem, matchedNote),
    );

    if (complete) {
      showClearCelebration();
    }
  }, [
    canJudgeInput,
    currentInput,
    isActive,
    isChallengeMode,
    isComplete,
    challengeTimingMode,
    intervalTimeSec,
    problem,
    revealedNotes,
    targetProblem,
  ]);

  useEffect(() => {
    return () => {
      if (wrongTimeoutRef.current !== null) {
        window.clearTimeout(wrongTimeoutRef.current);
      }

      if (clearEffectTimeoutRef.current !== null) {
        window.clearTimeout(clearEffectTimeoutRef.current);
      }
    };
  }, []);

  const handleStart = (): void => {
    if (isChallengeMode && isTimerRunning) {
      handleStopChallenge();
      return;
    }

    if (!isListening) {
      onToggleListening();
    }

    const nextProblem = createTargetProblem(
      problem,
      getScaleDrillGenerationOptions({
        problem,
        scaleDrillSelection,
        useManualScaleDrillSelection,
      }),
    );
    setTargetProblem(nextProblem);
    setRevealedNotes([]);
    setTemporaryWrongInput(null);
    setIsRevealHeld(false);
    setIsActive(true);
    setChallengeResult(null);
    setShowClearEffect(false);
    lastProcessedMidiRef.current = null;

    if (sessionMode === "challenge") {
      const emptyScore = { attempts: 0, correctCount: 0, streak: 0 };
      setScore(emptyScore);
      scoreRef.current = emptyScore;
      setCompletedProblems(0);
      completedProblemsRef.current = 0;
      setMaxStreak(0);
      maxStreakRef.current = 0;
      activeChallengeDurationRef.current = selectedChallengeDurationSec;
      setTimeLeftSec(selectedChallengeDurationSec);
      setIsTimerRunning(true);
      setFeedback("Challenge started - find as many targets as possible.");
      return;
    }

    setIsTimerRunning(false);
    setFeedback(getStartFeedback(nextProblem));
  };

  const handleStopChallenge = (): void => {
    const elapsedSec =
      challengeTimingMode === "total"
        ? Math.max(0, activeChallengeDurationRef.current - timeLeftSec)
        : Math.max(0, intervalTimeSec - timeLeftSec);

    setIsTimerRunning(false);
    setIsActive(false);
    setTemporaryWrongInput(null);
    setIsRevealHeld(false);
    setFeedback("Challenge stopped.");
    setChallengeResult(
      createChallengeResult({
        problem,
        durationSec: elapsedSec,
        score: scoreRef.current,
        maxStreak: maxStreakRef.current,
        completedProblems: completedProblemsRef.current,
      }),
    );
  };

  const handleNextProblem = (): void => {
    if (sessionMode === "challenge" && isTimerRunning) {
      return;
    }

    const nextProblem = createTargetProblem(
      problem,
      getScaleDrillGenerationOptions({
        problem,
        scaleDrillSelection,
        useManualScaleDrillSelection,
      }),
    );
    setTargetProblem(nextProblem);
    setRevealedNotes([]);
    setTemporaryWrongInput(null);
    setIsRevealHeld(false);
    setIsActive(true);
    setShowClearEffect(false);
    setFeedback(getStartFeedback(nextProblem));
    lastProcessedMidiRef.current = null;
  };

  const handleRevealAnswerStart = (): void => {
    if (!targetProblem || sessionMode === "challenge") {
      return;
    }

    setTemporaryWrongInput(null);
    setIsRevealHeld(true);
    setFeedback("Answer visible while holding Reveal Answer.");
  };

  const handleRevealAnswerEnd = (): void => {
    setIsRevealHeld(false);
  };

  const handleResetScore = (): void => {
    const emptyScore = { attempts: 0, correctCount: 0, streak: 0 };
    setScore(emptyScore);
    scoreRef.current = emptyScore;
    setMaxStreak(0);
    maxStreakRef.current = 0;
    setCompletedProblems(0);
    completedProblemsRef.current = 0;
    setChallengeResult(null);
    setFeedback("Score reset.");
  };

  const showClearCelebration = (): void => {
    if (clearEffectTimeoutRef.current !== null) {
      window.clearTimeout(clearEffectTimeoutRef.current);
    }

    setShowClearEffect(true);
    clearEffectTimeoutRef.current = window.setTimeout(() => {
      setShowClearEffect(false);
    }, 1500);
  };

  const registerWrongInput = (input: NoteInfo): void => {
    setScore((current) => {
      const nextScore = {
        attempts: current.attempts + 1,
        correctCount: current.correctCount,
        streak: 0,
      };

      scoreRef.current = nextScore;
      return nextScore;
    });
    setTemporaryWrongInput(input);
    setFeedback(getWrongFeedback(targetProblem));

    if (wrongTimeoutRef.current !== null) {
      window.clearTimeout(wrongTimeoutRef.current);
    }

    wrongTimeoutRef.current = window.setTimeout(() => {
      setTemporaryWrongInput(null);
    }, 700);
  };

  return (
    <section
      className={`training-content target-training ${
        isChallengeMode ? "challenge-active" : "training-active"
      } ${
        temporaryWrongInput ? "wrong" : isComplete ? "correct" : ""
      }`}
    >
      <div className="section-heading">
        <h2>{problem.title}</h2>
        <span>{isScaleDrillMode ? "Scale Drill" : isChordMode ? "Chord" : "Degree"}</span>
      </div>

      {useManualScaleDrillSelection ? (
        <div className="scale-drill-selection-panel" aria-label="Scale drill selection">
          <div className="scale-drill-current-selection">
            <span>Selected Drill</span>
            <strong>
              {scaleDrillSelection.key} {selectedScaleDisplayName}
            </strong>
            <em>{scaleDrillSelection.boxName}</em>
          </div>
          <div className="scale-drill-dropdown-grid">
            <details className="scale-drill-picker-group">
              <summary>
                <span>Key</span>
                <strong>{scaleDrillSelection.key}</strong>
              </summary>
              <div className="scale-drill-option-list compact">
                {TRAINING_KEYS.map((keyName) => (
                  <button
                    className={scaleDrillSelection.key === keyName ? "selected" : ""}
                    key={keyName}
                    type="button"
                    onClick={() =>
                      setScaleDrillSelection((current) => ({
                        ...current,
                        key: keyName,
                      }))
                    }
                  >
                    {keyName}
                  </button>
                ))}
              </div>
            </details>
            <details className="scale-drill-picker-group">
              <summary>
                <span>Scale</span>
                <strong>{selectedScaleDisplayName}</strong>
              </summary>
              <div className="scale-drill-option-list scale-list">
                {SCALE_DRILL_SCALES.map((scale) => (
                  <button
                    className={scaleDrillSelection.scaleId === scale.id ? "selected" : ""}
                    key={scale.id}
                    type="button"
                    onClick={() =>
                      setScaleDrillSelection((current) => ({
                        ...current,
                        scaleId: scale.id,
                      }))
                    }
                  >
                    {getScaleDrillDisplayName(scale.name)}
                  </button>
                ))}
              </div>
            </details>
            <details className="scale-drill-picker-group">
              <summary>
                <span>Box</span>
                <strong>{scaleDrillSelection.boxName}</strong>
              </summary>
              <div className="scale-drill-option-list compact">
                {TRAINING_BOX_NAMES.map((boxName) => (
                  <button
                    className={scaleDrillSelection.boxName === boxName ? "selected" : ""}
                    key={boxName}
                    type="button"
                    onClick={() =>
                      setScaleDrillSelection((current) => ({
                        ...current,
                        boxName,
                      }))
                    }
                  >
                    {boxName}
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      ) : null}

      <div className="training-target-card target-test-card">
        <div className="target-card-header">
          <span>{sessionMode === "challenge" ? "Challenge" : "Training"}</span>
        </div>
        <strong>
          {targetProblem
            ? isScaleDrillMode
              ? targetProblem.scaleName
              : isChordMode
              ? targetProblem.chord?.label
              : getDegreeDisplayLabel(targetProblem.targetDegree)
            : "Ready"}
        </strong>
        {targetProblem ? (
          <dl className="target-problem-details">
            <div>
              <dt>Key</dt>
              <dd>{targetProblem.key}</dd>
            </div>
            <div>
              <dt>{isChordMode ? "Chord" : "Scale"}</dt>
              <dd>{isChordMode ? targetProblem.chord?.label : targetProblem.scaleName}</dd>
            </div>
            <div>
              <dt>Box</dt>
              <dd>{targetProblem.boxName}</dd>
            </div>
            <div>
              <dt>
                {isScaleDrillMode
                  ? "Target"
                  : isChordMode
                    ? "Target Tones"
                    : "Target Tone"}
              </dt>
              <dd>
                {isScaleDrillMode
                  ? "All scale tones"
                  : isChordMode
                    ? targetProblem.chord?.degrees.map(getDegreeDisplayLabel).join(" / ")
                    : getDegreeDisplayLabel(targetProblem.targetDegree)}
              </dd>
            </div>
            <div>
              <dt>Target Notes</dt>
              <dd>{targetProblem.targetNoteNames.join(" ")}</dd>
            </div>
          </dl>
        ) : null}
        <p>{targetProblem ? getInstruction(targetProblem) : "Start a problem to show an empty fretboard grid."}</p>
      </div>

      <div className="training-controls target-training-controls">
        <button
          className="primary-button training-start-button"
          type="button"
          onClick={handleStart}
        >
          {isChallengeMode && isTimerRunning ? "Stop" : "Start"}
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={handleNextProblem}
          disabled={!targetProblem || (sessionMode === "challenge" && isTimerRunning)}
        >
          Next Problem
        </button>
        <button
          className="secondary-button"
          type="button"
          onBlur={handleRevealAnswerEnd}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              handleRevealAnswerStart();
            }
          }}
          onKeyUp={(event) => {
            if (event.key === " " || event.key === "Enter") {
              handleRevealAnswerEnd();
            }
          }}
          onMouseDown={handleRevealAnswerStart}
          onMouseLeave={handleRevealAnswerEnd}
          onMouseUp={handleRevealAnswerEnd}
          onTouchCancel={handleRevealAnswerEnd}
          onTouchEnd={handleRevealAnswerEnd}
          onTouchStart={handleRevealAnswerStart}
          disabled={!targetProblem || sessionMode === "challenge"}
          title={
            sessionMode === "challenge"
              ? "Reveal is disabled in Challenge Mode."
              : undefined
          }
        >
          Reveal Answer
        </button>
        <button className="secondary-button" type="button" onClick={handleResetScore}>
          Reset Score
        </button>
      </div>

      <div className="training-fretboard-stage">
        {showClearEffect ? (
          <div className="training-clear-effect" aria-live="polite">
            <span className="clear-burst burst-one" />
            <span className="clear-burst burst-two" />
            <span className="clear-burst burst-three" />
            <strong>Clear!</strong>
            <em>Good hit</em>
          </div>
        ) : null}

        {targetProblem ? (
          <TrainingRevealFretboard
            currentInput={currentInput}
            fretboardNotes={targetProblem.fretboardNotes}
            revealedNotes={revealedNotes}
            showAnswers={isRevealHeld}
            targetFretboardNotes={targetProblem.targetFretboardNotes}
            temporaryWrongInput={temporaryWrongInput}
          />
        ) : (
          <div className="training-empty-grid-placeholder">
            <strong>Empty fretboard test</strong>
            <p>Target notes stay hidden until you play the correct MIDI note.</p>
          </div>
        )}
      </div>

      {sessionMode === "challenge" ? (
        <div className="training-readout-grid challenge-readout-grid">
          <div>
            <span>Time Left</span>
            <strong>{timeLeftSec}s</strong>
          </div>
          <div>
            <span>Correct</span>
            <strong>{score.correctCount}</strong>
          </div>
          <div>
            <span>Accuracy</span>
            <strong>{accuracy}%</strong>
          </div>
          <div>
            <span>Streak</span>
            <strong>{score.streak}</strong>
          </div>
          <div>
            <span>Max Streak</span>
            <strong>{maxStreak}</strong>
          </div>
          <div>
            <span>Completed</span>
            <strong>{completedProblems}</strong>
          </div>
        </div>
      ) : (
        <div className="training-readout-grid">
          <div>
            <span>Found</span>
            <strong>{foundCount} / {totalTargets}</strong>
          </div>
          <div>
            <span>Accuracy</span>
            <strong>{accuracy}%</strong>
          </div>
          <div>
            <span>Streak</span>
            <strong>{score.streak}</strong>
          </div>
          <div>
            <span>Your Note</span>
            <strong>{currentInput?.fullName ?? "--"}</strong>
          </div>
        </div>
      )}

      {challengeResult ? (
        <div className="challenge-result-card">
          <span>Challenge Complete</span>
          <dl>
            <div>
              <dt>Duration</dt>
              <dd>{challengeResult.durationSec}s</dd>
            </div>
            <div>
              <dt>Correct Notes</dt>
              <dd>{challengeResult.correctCount}</dd>
            </div>
            <div>
              <dt>Accuracy</dt>
              <dd>{challengeResult.accuracy}%</dd>
            </div>
            <div>
              <dt>Max Streak</dt>
              <dd>{challengeResult.maxStreak}</dd>
            </div>
            <div>
              <dt>Completed Problems</dt>
              <dd>{challengeResult.completedProblems}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      <p className="training-feedback">{feedback}</p>
    </section>
  );
}

function RootTrainingContent({
  currentInput,
  isListening,
  onToggleListening,
  problem,
  sessionMode,
}: TrainingContentProps) {
  const [targetRoot, setTargetRoot] = useState<string>("A");
  const [targetNotes, setTargetNotes] = useState<readonly number[]>(getRootMidiTargets("A"));
  const [foundMidiTargets, setFoundMidiTargets] = useState<readonly number[]>([]);
  const [score, setScore] = useState<TargetScore>({
    attempts: 0,
    correctCount: 0,
    streak: 0,
  });
  const [isActive, setIsActive] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("Press Start to begin.");
  const lastProcessedMidiRef = useRef<number | null>(null);
  const isFixedRootHunt = problem.id === FIXED_ROOT_PROBLEM_ID;

  const isCorrect =
    isActive && currentInput !== null && targetNotes.includes(currentInput.midi);
  const accuracy =
    score.attempts > 0 ? Math.round((score.correctCount / score.attempts) * 100) : 0;

  useEffect(() => {
    setTargetRoot("A");
    setTargetNotes(getRootMidiTargets("A"));
    setFoundMidiTargets([]);
    setScore({ attempts: 0, correctCount: 0, streak: 0 });
    setIsActive(false);
    setFeedback("Press Start to begin.");
    lastProcessedMidiRef.current = null;
  }, [problem.id]);

  useEffect(() => {
    if (currentInput === null) {
      lastProcessedMidiRef.current = null;
      return;
    }

    if (!isActive || lastProcessedMidiRef.current === currentInput.midi) {
      return;
    }

    lastProcessedMidiRef.current = currentInput.midi;

    if (!targetNotes.includes(currentInput.midi)) {
      setScore((current) => ({
        attempts: current.attempts + 1,
        correctCount: current.correctCount,
        streak: 0,
      }));
      setFeedback(`${currentInput.fullName} is not ${targetRoot}.`);
      return;
    }

    setScore((current) => ({
      attempts: current.attempts + 1,
      correctCount: current.correctCount + 1,
      streak: current.streak + 1,
    }));

    if (isFixedRootHunt) {
      setFoundMidiTargets((current) => {
        if (current.includes(currentInput.midi)) {
          setFeedback("Already found - try another octave.");
          return current;
        }

        const nextFound = [...current, currentInput.midi];
        setFeedback(
          nextFound.length >= targetNotes.length
            ? `Complete - every ${targetRoot} was found.`
            : `Correct - ${currentInput.fullName} found.`,
        );
        return nextFound;
      });
      return;
    }

    setFeedback(`Correct - ${currentInput.fullName} is ${targetRoot}.`);
    const nextRoot = getRandomRoot();
    setTargetRoot(nextRoot);
    setTargetNotes(getRootMidiTargets(nextRoot));
  }, [currentInput, isActive, isFixedRootHunt, targetNotes, targetRoot]);

  const handleStart = (): void => {
    if (!isListening) {
      onToggleListening();
    }

    const nextRoot = getRandomRoot();
    setTargetRoot(nextRoot);
    setTargetNotes(getRootMidiTargets(nextRoot));
    setFoundMidiTargets([]);
    setIsActive(true);
    setFeedback(isFixedRootHunt ? `Find every ${nextRoot}.` : `Find ${nextRoot}.`);
    lastProcessedMidiRef.current = null;
  };

  return (
    <section className={`training-content ${isCorrect ? "correct" : ""}`}>
      <div className="section-heading">
        <h2>{problem.title}</h2>
        <span>{problem.type}</span>
      </div>

      <div className="training-controls target-training-controls">
        <button className="primary-button training-start-button" type="button" onClick={handleStart}>
          Start
        </button>
        <button className="secondary-button" type="button" onClick={() => setScore({ attempts: 0, correctCount: 0, streak: 0 })}>
          Reset Score
        </button>
      </div>

      <div className="training-target-card">
        <span>{sessionMode === "challenge" ? "Challenge Target" : "Training Target"}</span>
        <strong>{isActive ? `Find ${targetRoot}` : "Ready"}</strong>
        <p>Judgement uses MIDI note numbers only.</p>
      </div>

      <div className="training-readout-grid">
        <div>
          <span>Found</span>
          <strong>{isFixedRootHunt ? `${foundMidiTargets.length} / ${targetNotes.length}` : score.correctCount}</strong>
        </div>
        <div>
          <span>Accuracy</span>
          <strong>{accuracy}%</strong>
        </div>
        <div>
          <span>Streak</span>
          <strong>{score.streak}</strong>
        </div>
        <div>
          <span>Your Note</span>
          <strong>{currentInput?.fullName ?? "--"}</strong>
        </div>
      </div>

      <p className="training-feedback">{feedback}</p>
    </section>
  );
}

function createTargetProblem(
  problem: TrainingProblem,
  scaleDrillSelection?: ScaleDrillSelection,
): TrainingTargetProblem {
  if (problem.type === "scale-drill") {
    if (!scaleDrillSelection) {
      return generateRandomScaleDrillProblem();
    }

    return generateScaleDrillProblem(scaleDrillSelection.scaleId, {
      boxName: scaleDrillSelection.boxName,
      key: scaleDrillSelection.key,
    });
  }

  return problem.targetMode === "chord"
    ? generateChordToneProblem()
    : generateRandomToneProblem();
}

function getScaleDrillGenerationOptions({
  problem,
  scaleDrillSelection,
  useManualScaleDrillSelection,
}: {
  problem: TrainingProblem;
  scaleDrillSelection: ScaleDrillSelection;
  useManualScaleDrillSelection: boolean;
}): ScaleDrillSelection | undefined {
  return problem.type === "scale-drill" && useManualScaleDrillSelection
    ? scaleDrillSelection
    : undefined;
}

function getScaleDrillScale(scaleId: string) {
  return (
    SCALE_DRILL_SCALES.find((scale) => scale.id === scaleId) ??
    SCALE_DRILL_SCALES[0]
  );
}

function getScaleDrillDisplayName(scaleName: string): string {
  return scaleName.replace("Natural Minor Scale", "Minor Scale").toUpperCase();
}

function createChallengeResult({
  problem,
  durationSec,
  score,
  maxStreak,
  completedProblems,
}: {
  problem: TrainingProblem;
  durationSec: number;
  score: TargetScore;
  maxStreak: number;
  completedProblems: number;
}): ChallengeResult {
  const accuracy =
    score.attempts > 0 ? Math.round((score.correctCount / score.attempts) * 100) : 0;

  return {
    problemType:
      problem.type === "scale-drill"
        ? "scale-drill"
        : problem.targetMode === "chord"
          ? "chord-tone"
          : "random-tone",
    durationSec,
    correctCount: score.correctCount,
    attempts: score.attempts,
    accuracy,
    maxStreak,
    completedProblems,
    createdAt: new Date().toISOString(),
  };
}

function getCorrectFeedback(problem: TrainingTargetProblem, note: FretboardNote): string {
  if (problem.mode === "scale-drill") {
    return `Correct - that note is in ${problem.key} ${problem.scaleName} ${problem.boxName}.`;
  }

  if (problem.mode === "chord") {
    return `Correct - that note is part of ${problem.chord?.label}.`;
  }

  return `Correct - that is ${getDegreeDisplayLabel(note.degree)} in ${problem.key} ${problem.scaleName} ${problem.boxName}.`;
}

function getCompleteFeedback(problem: TrainingTargetProblem): string {
  if (problem.mode === "scale-drill") {
    return `Complete - you found every ${problem.key} ${problem.scaleName} note in this box.`;
  }

  return "Complete - you found all target notes in this box.";
}

function getWrongFeedback(problem: TrainingTargetProblem | null): string {
  if (!problem) {
    return "Wrong.";
  }

  if (problem.mode === "scale-drill") {
    return `Wrong - find notes from ${problem.key} ${problem.scaleName} inside ${problem.boxName}.`;
  }

  if (problem.mode === "chord") {
    return `Wrong - play one of ${problem.chord?.degrees.map(getDegreeDisplayLabel).join(", ")} inside ${problem.boxName}.`;
  }

  return `Wrong - play ${getDegreeDisplayLabel(problem.targetDegree)} inside ${problem.boxName}.`;
}

function getInstruction(problem: TrainingTargetProblem): string {
  if (problem.mode === "scale-drill") {
    return `Find and play every ${problem.key} ${problem.scaleName} note inside ${problem.boxName}.`;
  }

  if (problem.mode === "chord") {
    return `Find and play every ${problem.chord?.label} chord tone inside ${problem.boxName}.`;
  }

  return `Find and play every ${getDegreeDisplayLabel(problem.targetDegree)} note inside ${problem.boxName}.`;
}

function getStartFeedback(problem: TrainingTargetProblem): string {
  if (problem.mode === "scale-drill") {
    return `Find every ${problem.key} ${problem.scaleName} note inside ${problem.boxName}.`;
  }

  return problem.mode === "chord"
    ? `Find ${problem.chord?.degrees.map(getDegreeDisplayLabel).join(" ")} inside ${problem.boxName}.`
    : `Find ${getDegreeDisplayLabel(problem.targetDegree)} inside ${problem.boxName}.`;
}

function getDegreeDisplayLabel(degree: string | undefined): string {
  if (!degree) {
    return "--";
  }

  const label = DEGREE_LABELS[degree];
  return label ? `${degree} (${label})` : degree;
}

function isSameFretboardLocation(left: FretboardNote, right: FretboardNote): boolean {
  return (
    left.stringNumber === right.stringNumber &&
    left.fret === right.fret &&
    left.midi === right.midi
  );
}

function getRandomRoot(): string {
  return NOTE_NAMES[Math.floor(Math.random() * NOTE_NAMES.length)];
}

function getRootMidiTargets(root: string): number[] {
  const pitchClass = NOTE_NAMES.indexOf(root as (typeof NOTE_NAMES)[number]);

  if (pitchClass < 0) {
    return [];
  }

  const targets: number[] = [];
  for (let midi = GUITAR_MIDI_MIN; midi <= GUITAR_MIDI_MAX; midi += 1) {
    if (midi % 12 === pitchClass) {
      targets.push(midi);
    }
  }

  return targets;
}
