import { useEffect, useRef, useState } from "react";
import type { Scale } from "../../types/scale";
import { isNoteInScale, normalizeNoteName } from "../../utils/scaleValidation";

interface GuidedExercisePanelProps {
  boxNotes: readonly string[];
  currentNoteName: string | null;
  error: string | null;
  isListening: boolean;
  onStartListening: () => void;
  onTargetNoteChange: (note: string | null) => void;
  onToggleListening: () => void;
  scaleNotes: readonly string[];
  scaleLabel: string;
  selectedScale: Scale;
}

type ExerciseStatus = "idle" | "running" | "wrong" | "complete";

export function GuidedExercisePanel({
  boxNotes,
  currentNoteName,
  error,
  isListening,
  onStartListening,
  onTargetNoteChange,
  onToggleListening,
  scaleNotes,
  scaleLabel,
  selectedScale,
}: GuidedExercisePanelProps) {
  const [status, setStatus] = useState<ExerciseStatus>("idle");
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(
    "Start the exercise and play the notes in order.",
  );
  const lastHandledRef = useRef<string | null>(null);
  const previousNoteRef = useRef<string | null>(null);
  const wasSilentRef = useRef<boolean>(true);
  const lastAcceptedAtRef = useRef<number>(0);
  const targetNote = scaleNotes[targetIndex] ?? null;
  const normalizedCurrentNote = normalizeNoteName(currentNoteName);
  const scaleResult = isNoteInScale(
    currentNoteName,
    scaleNotes,
    scaleLabel,
    boxNotes,
  );
  const liveStatus = !isListening || !scaleResult.normalizedNote
    ? "idle"
    : scaleResult.isCorrect && scaleResult.isInBox !== false
      ? "correct"
      : "outside";

  useEffect(() => {
    onTargetNoteChange(status === "complete" ? null : targetNote);
  }, [onTargetNoteChange, status, targetNote]);

  useEffect(() => {
    if (!normalizedCurrentNote) {
      wasSilentRef.current = true;
      previousNoteRef.current = null;
      return;
    }

    if (status !== "running" || !targetNote) {
      previousNoteRef.current = normalizedCurrentNote;
      return;
    }

    const isNewNoteInput =
      wasSilentRef.current && previousNoteRef.current !== normalizedCurrentNote;

    if (!isNewNoteInput) {
      previousNoteRef.current = normalizedCurrentNote;
      return;
    }

    const now = performance.now();
    const eventKey = `${targetIndex}:${normalizedCurrentNote}:${Math.round(now)}`;
    if (
      lastHandledRef.current === eventKey ||
      now - lastAcceptedAtRef.current < 120
    ) {
      previousNoteRef.current = normalizedCurrentNote;
      return;
    }

    lastHandledRef.current = eventKey;
    lastAcceptedAtRef.current = now;
    wasSilentRef.current = false;
    previousNoteRef.current = normalizedCurrentNote;

    if (normalizedCurrentNote === targetNote) {
      const nextIndex = targetIndex + 1;

      if (nextIndex >= scaleNotes.length) {
        setStatus("complete");
        setFeedback("Exercise complete");
      } else {
        setTargetIndex(nextIndex);
        setFeedback(`Good, now play ${scaleNotes[nextIndex]}`);
        wasSilentRef.current = false;
      }
    } else {
      setStatus("wrong");
      setFeedback(`Outside target - try ${targetNote} next`);
    }
  }, [normalizedCurrentNote, scaleNotes, status, targetIndex, targetNote]);

  const startExercise = (): void => {
    onStartListening();
    setStatus("running");
    setTargetIndex(0);
    lastHandledRef.current = null;
    previousNoteRef.current = normalizedCurrentNote;
    wasSilentRef.current = normalizedCurrentNote === null;
    lastAcceptedAtRef.current = 0;
    setFeedback(`Play ${scaleNotes[0]}`);
  };

  const resetExercise = (): void => {
    setStatus("idle");
    setTargetIndex(0);
    lastHandledRef.current = null;
    previousNoteRef.current = null;
    wasSilentRef.current = true;
    lastAcceptedAtRef.current = 0;
    setFeedback("Start the exercise and play the notes in order.");
  };

  const resumeAfterWrong = (): void => {
    setStatus("running");
    lastHandledRef.current = null;
    previousNoteRef.current = normalizedCurrentNote;
    wasSilentRef.current = normalizedCurrentNote === null;
    setFeedback(`Try ${targetNote} next`);
  };

  return (
    <section className={`solo-card guided-exercise combined-exercise ${status} ${liveStatus}`}>
      <div className="section-heading">
        <h2>Guided Exercise</h2>
        <span>{isListening ? "Listening" : "Start to listen"}</span>
      </div>

      <div className="exercise-feedback-layout">
        <div className="exercise-left">
          <p>
            {selectedScale.name}: play the scale upward, one note at a time.
            Octave does not matter.
          </p>

          <div className="exercise-sequence">
            {scaleNotes.map((note, index) => (
              <span
                className={[
                  index < targetIndex || status === "complete" ? "done" : "",
                  index === targetIndex && status !== "complete" ? "target" : "",
                ].join(" ")}
                key={note}
              >
                {note}
              </span>
            ))}
          </div>

          <div className="exercise-target">
            <span>Current target</span>
            <strong>{status === "complete" ? "--" : targetNote ?? "--"}</strong>
          </div>

          <p className="feedback-message">{feedback}</p>

          <div className="exercise-actions">
            <button className="record-button" type="button" onClick={startExercise}>
              Start Exercise
            </button>
            {status === "wrong" ? (
              <button className="secondary-button" type="button" onClick={resumeAfterWrong}>
                Try Again
              </button>
            ) : null}
            <button className="secondary-button" type="button" onClick={resetExercise}>
              Reset
            </button>
          </div>
        </div>

        <aside className={`exercise-right live-scale-feedback ${liveStatus}`}>
          <div className="section-heading compact">
            <h2>Your Note</h2>
            <span>{isListening ? "Live" : "Off"}</span>
          </div>

          <button className="secondary-button" type="button" onClick={onToggleListening}>
            {isListening ? "Stop Listening" : "Start Listening"}
          </button>

          {error ? <p className="inline-error">{error}</p> : null}

          <div className="live-note-readout">
            <span>Current note</span>
            <strong>{scaleResult.normalizedNote ?? "--"}</strong>
          </div>

          <p className="feedback-message">
            {isListening ? scaleResult.message : "Start the exercise or listening mode"}
          </p>

          <div className="allowed-note-row">
            {scaleNotes.map((note) => (
              <span
                className={note === scaleResult.normalizedNote ? "active" : ""}
                key={note}
              >
                {note}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
