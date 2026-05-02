import { useEffect, useRef, useState } from "react";
import type { FretboardNote } from "../../types/scale";
import type { TrainingProblem, TrainingTargetProblem } from "../../types/training";
import { getAcceptedMidiNumbers } from "../../utils/fretboardNoteUtils";
import type { NoteInfo } from "../../utils/noteUtils";
import {
  generateChordToneProblem,
  generateRandomToneProblem,
} from "../../utils/trainingProblemGenerator";
import { TrainingRevealFretboard } from "./TrainingRevealFretboard";

interface TrainingContentProps {
  currentInput: NoteInfo | null;
  isListening: boolean;
  onToggleListening: () => void;
  problem: TrainingProblem;
}

interface TargetScore {
  attempts: number;
  correctCount: number;
  streak: number;
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
  isListening,
  onToggleListening,
  problem,
}: TrainingContentProps) {
  if (problem.type === "target-test") {
    return (
      <TargetTrainingContent
        currentInput={currentInput}
        isListening={isListening}
        onToggleListening={onToggleListening}
        problem={problem}
      />
    );
  }

  return (
    <RootTrainingContent
      currentInput={currentInput}
      isListening={isListening}
      onToggleListening={onToggleListening}
      problem={problem}
    />
  );
}

function TargetTrainingContent({
  currentInput,
  isListening,
  onToggleListening,
  problem,
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
  const lastProcessedMidiRef = useRef<number | null>(null);
  const wrongTimeoutRef = useRef<number | null>(null);

  const isChordMode = problem.targetMode === "chord";
  const foundCount = revealedNotes.length;
  const totalTargets = targetProblem?.targetFretboardNotes.length ?? 0;
  const accuracy =
    score.attempts > 0 ? Math.round((score.correctCount / score.attempts) * 100) : 0;
  const isComplete = totalTargets > 0 && foundCount >= totalTargets;

  useEffect(() => {
    setTargetProblem(null);
    setRevealedNotes([]);
    setTemporaryWrongInput(null);
    setScore({ attempts: 0, correctCount: 0, streak: 0 });
    setFeedback("Press Start to begin.");
    setIsActive(false);
    setRevealUsed(false);
    lastProcessedMidiRef.current = null;
  }, [problem.id]);

  useEffect(() => {
    if (currentInput === null) {
      lastProcessedMidiRef.current = null;
      return;
    }

    if (!isActive || !targetProblem || isComplete) {
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
    setScore((current) => ({
      attempts: current.attempts + 1,
      correctCount: current.correctCount + 1,
      streak: current.streak + 1,
    }));

    const complete = nextRevealedNotes.length >= targetProblem.targetFretboardNotes.length;
    setFeedback(
      complete
        ? "Complete - you found all target notes in this box."
        : getCorrectFeedback(targetProblem, matchedNote),
    );
  }, [currentInput, isActive, isComplete, revealedNotes, targetProblem]);

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
    setFeedback(getStartFeedback(nextProblem));
    lastProcessedMidiRef.current = null;
  };

  const handleNextProblem = (): void => {
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
    if (!targetProblem) {
      return;
    }

    setRevealedNotes([...targetProblem.targetFretboardNotes]);
    setTemporaryWrongInput(null);
    setRevealUsed(true);
    setFeedback("Answer revealed. Use Next Problem for a fresh test.");
  };

  const handleResetScore = (): void => {
    setScore({ attempts: 0, correctCount: 0, streak: 0 });
    setFeedback("Score reset.");
  };

  const registerWrongInput = (input: NoteInfo): void => {
    setScore((current) => ({
      attempts: current.attempts + 1,
      correctCount: current.correctCount,
      streak: 0,
    }));
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
        temporaryWrongInput ? "wrong" : isComplete ? "correct" : ""
      }`}
    >
      <div className="section-heading">
        <h2>{problem.title}</h2>
        <span>{isChordMode ? "Chord" : "Degree"}</span>
      </div>

      <div className="training-target-card target-test-card">
        <span>{problem.title}</span>
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
        <button className="primary-button training-start-button" type="button" onClick={handleStart}>
          Start
        </button>
        <button className="secondary-button" type="button" onClick={handleNextProblem} disabled={!targetProblem}>
          Next Problem
        </button>
        <button className="secondary-button" type="button" onClick={handleRevealAnswer} disabled={!targetProblem}>
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

      <p className="training-feedback">{feedback}</p>
    </section>
  );
}

function RootTrainingContent({
  currentInput,
  isListening,
  onToggleListening,
  problem,
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
        <span>Current Target</span>
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
