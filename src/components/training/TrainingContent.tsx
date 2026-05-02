import { useEffect, useRef, useState } from "react";
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
  generateChordToneProblem,
  generateRandomToneProblem,
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
  problemType: "random-tone" | "chord-tone";
  durationSec: number;
  correctCount: number;
  attempts: number;
  accuracy: number;
  maxStreak: number;
  completedProblems: number;
  createdAt: string;
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
  if (problem.type === "target-test") {
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
  const [revealUsed, setRevealUsed] = useState<boolean>(false);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [completedProblems, setCompletedProblems] = useState<number>(0);
  const [challengeResult, setChallengeResult] = useState<ChallengeResult | null>(null);
  const lastProcessedMidiRef = useRef<number | null>(null);
  const wrongTimeoutRef = useRef<number | null>(null);
  const scoreRef = useRef<TargetScore>(score);
  const maxStreakRef = useRef<number>(0);
  const completedProblemsRef = useRef<number>(0);
  const activeChallengeDurationRef = useRef<number>(60);

  const isChordMode = problem.targetMode === "chord";
  const isChallengeMode = sessionMode === "challenge";
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
    setRevealUsed(false);
    setIsTimerRunning(false);
    setTimeLeftSec(selectedChallengeDurationSec);
    setMaxStreak(0);
    setCompletedProblems(0);
    setChallengeResult(null);
    lastProcessedMidiRef.current = null;
  }, [problem.id]);

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
      setRevealUsed(false);
      setChallengeResult(null);
      setFeedback("Practice mode selected.");
      return;
    }

    setIsTimerRunning(false);
    setTimeLeftSec(selectedChallengeDurationSec);
    setRevealedNotes([]);
    setTemporaryWrongInput(null);
    setRevealUsed(false);
    setIsActive(false);
    setChallengeResult(null);
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
      const nextProblem = createTargetProblem(problem);
      setCompletedProblems((current) => {
        const nextCompleted = current + 1;
        completedProblemsRef.current = nextCompleted;
        return nextCompleted;
      });
      setTargetProblem(nextProblem);
      setRevealedNotes([]);
      setTemporaryWrongInput(null);
      setRevealUsed(false);
      if (challengeTimingMode === "interval") {
        setTimeLeftSec(intervalTimeSec);
      }
      setFeedback("Problem complete - next challenge.");
      return;
    }

    setFeedback(
      complete
        ? "Complete - you found all target notes in this box."
        : getCorrectFeedback(targetProblem, matchedNote),
    );
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
    };
  }, []);

  const handleStart = (): void => {
    if (!isListening) {
      onToggleListening();
    }

    const nextProblem = createTargetProblem(problem);
    setTargetProblem(nextProblem);
    setRevealedNotes([]);
    setTemporaryWrongInput(null);
    setRevealUsed(false);
    setIsActive(true);
    setChallengeResult(null);
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

  const handleNextProblem = (): void => {
    if (sessionMode === "challenge" && isTimerRunning) {
      return;
    }

    const nextProblem = createTargetProblem(problem);
    setTargetProblem(nextProblem);
    setRevealedNotes([]);
    setTemporaryWrongInput(null);
    setRevealUsed(false);
    setIsActive(true);
    setFeedback(getStartFeedback(nextProblem));
    lastProcessedMidiRef.current = null;
  };

  const handleRevealAnswer = (): void => {
    if (!targetProblem || sessionMode === "challenge") {
      return;
    }

    setRevealedNotes([...targetProblem.targetFretboardNotes]);
    setTemporaryWrongInput(null);
    setRevealUsed(true);
    setFeedback("Answer revealed. Use Next Problem for a fresh test.");
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
        <span>{isChordMode ? "Chord" : "Degree"}</span>
      </div>

      <div className="training-target-card target-test-card">
        <div className="target-card-header">
          <span>{sessionMode === "challenge" ? "Challenge" : "Training"}</span>
        </div>
        <strong>
          {targetProblem
            ? isChordMode
              ? targetProblem.chord?.label
              : targetProblem.targetDegree
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
              <dt>{isChordMode ? "Target Tones" : "Target Tone"}</dt>
              <dd>
                {isChordMode
                  ? targetProblem.chord?.degrees.join(" ")
                  : targetProblem.targetDegree}
              </dd>
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
          disabled={isChallengeMode && isTimerRunning}
        >
          Start
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
          onClick={handleRevealAnswer}
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

      {targetProblem ? (
        <TrainingRevealFretboard
          currentInput={currentInput}
          fretboardNotes={targetProblem.fretboardNotes}
          revealedNotes={revealedNotes}
          showAnswers={revealUsed}
          targetFretboardNotes={targetProblem.targetFretboardNotes}
          temporaryWrongInput={temporaryWrongInput}
        />
      ) : (
        <div className="training-empty-grid-placeholder">
          <strong>Empty fretboard test</strong>
          <p>Target notes stay hidden until you play the correct MIDI note.</p>
        </div>
      )}

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

function createTargetProblem(problem: TrainingProblem): TrainingTargetProblem {
  return problem.targetMode === "chord"
    ? generateChordToneProblem()
    : generateRandomToneProblem();
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
    problemType: problem.targetMode === "chord" ? "chord-tone" : "random-tone",
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
  if (problem.mode === "chord") {
    return `Correct - that note is part of ${problem.chord?.label}.`;
  }

  return `Correct - that is ${note.degree} in ${problem.key} ${problem.scaleName} ${problem.boxName}.`;
}

function getWrongFeedback(problem: TrainingTargetProblem | null): string {
  if (!problem) {
    return "Wrong.";
  }

  if (problem.mode === "chord") {
    return `Wrong - play one of ${problem.chord?.degrees.join(", ")} inside ${problem.boxName}.`;
  }

  return `Wrong - play ${problem.targetDegree} inside ${problem.boxName}.`;
}

function getInstruction(problem: TrainingTargetProblem): string {
  if (problem.mode === "chord") {
    return `Find and play every ${problem.chord?.label} chord tone inside ${problem.boxName}.`;
  }

  return `Find and play every ${problem.targetDegree} note inside ${problem.boxName}.`;
}

function getStartFeedback(problem: TrainingTargetProblem): string {
  return problem.mode === "chord"
    ? `Find ${problem.chord?.degrees.join(" ")} inside ${problem.boxName}.`
    : `Find ${problem.targetDegree} inside ${problem.boxName}.`;
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
