import { useEffect, useMemo, useRef, useState } from "react";
import type { NoteInfo } from "../../utils/noteUtils";
import type { TrainingProblem } from "../../types/training";

interface TrainingContentProps {
  currentInput: NoteInfo | null;
  isListening: boolean;
  onToggleListening: () => void;
  problem: TrainingProblem;
}

type TrainingGameState = "idle" | "countdown" | "playing" | "game-over" | "clear";

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
const CLEAR_SCORE = 10;
const COUNTDOWN_SECONDS = 5;
const FIXED_ROOT_PROBLEM_ID = "find-fixed-root";
const RANDOM_ROOT_PROBLEM_ID = "random-root-sprint";

export function TrainingContent({
  currentInput,
  isListening,
  onToggleListening,
  problem,
}: TrainingContentProps) {
  const [gameState, setGameState] = useState<TrainingGameState>("idle");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(2);
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(timeLimitSeconds * 1000);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [targetRoot, setTargetRoot] = useState<string>("A");
  const [targetNotes, setTargetNotes] = useState<readonly number[]>(
    getRootMidiTargets("A"),
  );
  const [feedback, setFeedback] = useState<string>("Press Start to begin.");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [clearTimeMs, setClearTimeMs] = useState<number | null>(null);
  const [foundMidiTargets, setFoundMidiTargets] = useState<readonly number[]>([]);
  const [roundId, setRoundId] = useState<number>(0);
  const lastScoredTargetRef = useRef<string | null>(null);
  const isFixedRootHunt = problem.id === FIXED_ROOT_PROBLEM_ID;
  const isRandomRootSprint = problem.id === RANDOM_ROOT_PROBLEM_ID;

  const isCorrect =
    gameState === "playing" &&
    currentInput !== null &&
    targetNotes.includes(currentInput.midi);
  const isWrong =
    gameState === "playing" &&
    currentInput !== null &&
    !targetNotes.includes(currentInput.midi);
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const targetLabel =
    isFixedRootHunt
      ? `Find every ${targetRoot}`
      : isRandomRootSprint
      ? `Find ${targetRoot}`
      : problem.type === "lick"
        ? "Follow the sequence"
        : `Play notes from ${problem.key} ${problem.scale}`;
  const timeLeftSeconds = Math.max(0, timeLeftMs / 1000);

  useEffect(() => {
    setGameState("idle");
    setCountdown(COUNTDOWN_SECONDS);
    setScore(0);
    setAttempts((current) => current + 1);
    setStreak(0);
    setBestStreak(0);
    setFeedback("Press Start to begin.");
    setStartedAt(null);
    setClearTimeMs(null);
    setFoundMidiTargets([]);
    setTargetRoot(problem.key === "Random" ? "A" : problem.key);
    setTargetNotes(
      problem.id === FIXED_ROOT_PROBLEM_ID
        ? getRootMidiTargets("A")
        : getRootMidiTargets("A"),
    );
    setRoundId(0);
    lastScoredTargetRef.current = null;
  }, [problem.id, problem.key, problem.targetNotes]);

  useEffect(() => {
    if (gameState !== "countdown") {
      return;
    }

    setCountdown(COUNTDOWN_SECONDS);
    const intervalId = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          startRound();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") {
      return;
    }

    setTimeLeftMs(timeLimitSeconds * 1000);
    const started = performance.now();
    const intervalId = window.setInterval(() => {
      const remaining = timeLimitSeconds * 1000 - (performance.now() - started);

      if (remaining <= 0) {
        window.clearInterval(intervalId);
        setTimeLeftMs(0);
        setGameState("game-over");
        setStreak(0);
        setFeedback(`Time out. ${targetRoot} was not found in time.`);
        return;
      }

      setTimeLeftMs(remaining);
    }, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [gameState, roundId, targetRoot, timeLimitSeconds]);

  useEffect(() => {
    if (!isCorrect || !currentInput) {
      return;
    }

    const scoringKey = isFixedRootHunt
      ? `${targetRoot}-${currentInput.midi}`
      : `${targetRoot}-${roundId}`;
    if (lastScoredTargetRef.current === scoringKey) {
      return;
    }

    lastScoredTargetRef.current = scoringKey;
    if (isFixedRootHunt) {
      setFoundMidiTargets((current) => {
        if (current.includes(currentInput.midi)) {
          return current;
        }

        const nextFound = [...current, currentInput.midi];
        const isClear = nextFound.length >= targetNotes.length;
        setScore(nextFound.length);
        setStreak((currentStreak) => {
          const nextStreak = currentStreak + 1;
          setBestStreak((best) => Math.max(best, nextStreak));
          return nextStreak;
        });
        setFeedback(
          isClear
            ? `Clear. Every ${targetRoot} was found.`
            : `Correct. ${currentInput.fullName} found.`,
        );

        if (isClear) {
          const elapsed = startedAt !== null ? performance.now() - startedAt : null;
          setClearTimeMs(elapsed);
          setGameState("clear");
        } else {
          setRoundId((currentRound) => currentRound + 1);
        }

        return nextFound;
      });
      return;
    }

    setScore((current) => {
      const nextScore = current + 1;
      if (nextScore >= CLEAR_SCORE) {
        const elapsed = startedAt !== null ? performance.now() - startedAt : null;
        setClearTimeMs(elapsed);
        setGameState("clear");
        setFeedback(`Clear. ${CLEAR_SCORE} roots found.`);
      } else {
        setFeedback(`Correct. ${currentInput.fullName} is ${targetRoot}.`);
        window.setTimeout(() => {
          if (lastScoredTargetRef.current === scoringKey) {
            startRound();
          }
        }, 250);
      }

      return nextScore;
    });
    setStreak((current) => {
      const nextStreak = current + 1;
      setBestStreak((best) => Math.max(best, nextStreak));
      return nextStreak;
    });
  }, [
    currentInput,
    isCorrect,
    isFixedRootHunt,
    roundId,
    startedAt,
    targetNotes,
    targetRoot,
  ]);

  const canShowWrong = useMemo(
    () => gameState === "playing" && currentInput !== null && isWrong,
    [currentInput, gameState, isWrong],
  );

  useEffect(() => {
    if (canShowWrong && currentInput) {
      setFeedback(`${currentInput.fullName} is not ${targetRoot}.`);
    }
  }, [canShowWrong, currentInput, targetRoot]);

  const handleStartGame = (): void => {
    if (!isListening) {
      onToggleListening();
    }

    setScore(0);
    setAttempts(0);
    setStreak(0);
    setBestStreak(0);
    setCountdown(COUNTDOWN_SECONDS);
    setClearTimeMs(null);
    setFoundMidiTargets([]);
    setRoundId(0);
    setStartedAt(performance.now());
    setFeedback("Get ready.");
    setGameState("countdown");
  };

  const handleStopGame = (): void => {
    setGameState("idle");
    setFeedback("Press Start to begin.");
    if (isListening) {
      onToggleListening();
    }
  };

  function startRound(): void {
    if (isFixedRootHunt) {
      const nextRoot = getRandomRoot();
      const nextTargets = getRootMidiTargets(nextRoot);
      setTargetRoot(nextRoot);
      setTargetNotes(nextTargets);
      setFeedback(`Find every ${nextRoot}.`);
      setTimeLeftMs(timeLimitSeconds * 1000);
      lastScoredTargetRef.current = null;
      setRoundId((current) => current + 1);
      setGameState("playing");
      return;
    }

    const nextRoot = getRandomRoot();
    setTargetRoot(nextRoot);
    setTargetNotes(getRootMidiTargets(nextRoot));
    setFeedback(`Find ${nextRoot}.`);
    setTimeLeftMs(timeLimitSeconds * 1000);
    lastScoredTargetRef.current = null;
    setRoundId((current) => current + 1);
    setGameState("playing");
  }

  return (
    <section className={`training-content ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}>
      <div className="section-heading">
        <h2>{problem.title}</h2>
        <span>{problem.type}</span>
      </div>

      <div className="training-controls">
        <label>
          Time Limit
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={timeLimitSeconds}
            onChange={(event) => setTimeLimitSeconds(Number(event.target.value))}
            disabled={gameState === "countdown" || gameState === "playing"}
          />
          <strong>{timeLimitSeconds.toFixed(1)}s</strong>
        </label>
        <button
          className="primary-button training-start-button"
          type="button"
          onClick={handleStartGame}
          disabled={gameState === "countdown" || gameState === "playing"}
        >
          Start
        </button>
        <button className="secondary-button" type="button" onClick={handleStopGame}>
          Stop
        </button>
      </div>

      <div className="training-target-card">
        <span>Current Target</span>
        <strong>
          {gameState === "countdown"
            ? countdown
            : gameState === "idle"
              ? "Ready"
              : targetLabel}
        </strong>
        <p>
          {isFixedRootHunt
            ? `Found ${foundMidiTargets.length}/${targetNotes.length}. Judgement uses MIDI note numbers only.`
            : "Judgement uses MIDI note numbers only, not fret positions."}
        </p>
      </div>

      <div className="training-readout-grid">
        <div>
          <span>Your Note</span>
          <strong>{currentInput?.fullName ?? "--"}</strong>
        </div>
        <div>
          <span>Result</span>
          <strong>
            {gameState === "idle"
              ? "Ready"
              : gameState === "countdown"
                ? "Countdown"
                : gameState === "game-over"
                  ? "Game Over"
                  : gameState === "clear"
                    ? "Clear"
              : currentInput === null
                ? "Listening"
                : isCorrect
                  ? "Correct"
                  : "Wrong"}
          </strong>
        </div>
        <div>
          <span>Score</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span>Streak</span>
          <strong>{streak}</strong>
        </div>
      </div>

      <div className="training-readout-grid secondary">
        <div>
          <span>Time Left</span>
          <strong>{gameState === "playing" ? timeLeftSeconds.toFixed(1) : "--"}</strong>
        </div>
        <div>
          <span>Accuracy</span>
          <strong>{accuracy}%</strong>
        </div>
        <div>
          <span>Best Streak</span>
          <strong>{bestStreak}</strong>
        </div>
        <div>
          <span>Clear Time</span>
          <strong>{clearTimeMs !== null ? `${(clearTimeMs / 1000).toFixed(1)}s` : "--"}</strong>
        </div>
      </div>

      <p className="training-feedback">{feedback}</p>
    </section>
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
