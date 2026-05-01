import { useEffect, useRef, useState } from "react";
import type { Scale } from "../../types/scale";
import { isNoteInScale, normalizeNoteName } from "../../utils/scaleValidation";

interface GuidedExercisePanelProps {
  currentNoteName: string | null;
  error: string | null;
  isListening: boolean;
  onStartListening: () => void;
  onToggleListening: () => void;
  scaleNotes: readonly string[];
  scaleLabel: string;
  selectedScale: Scale;
}

type ExerciseStatus = "idle" | "running" | "wrong" | "complete";

export function GuidedExercisePanel({
  currentNoteName,
  error,
  isListening,
  onStartListening,
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
  const targetNote = scaleNotes[targetIndex] ?? null;
  const normalizedCurrentNote = normalizeNoteName(currentNoteName);
  const scaleResult = isNoteInScale(currentNoteName, scaleNotes, scaleLabel);
  const liveStatus = !isListening || !scaleResult.normalizedNote
    ? "idle"
    : scaleResult.isCorrect
      ? "correct"
      : "outside";

  useEffect(() => {
    if (status !== "running" || !targetNote || !normalizedCurrentNote) {
      return;
    }

    const eventKey = `${targetIndex}:${normalizedCurrentNote}`;
    if (lastHandledRef.current === eventKey) {
      return;
    }

    lastHandledRef.current = eventKey;

    if (normalizedCurrentNote === targetNote) {
      const nextIndex = targetIndex + 1;

      if (nextIndex >= scaleNotes.length) {
        setStatus("complete");
        setFeedback("Exercise complete");
      } else {
        setTargetIndex(nextIndex);
        setFeedback(`Good, now play ${scaleNotes[nextIndex]}`);
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
    setFeedback(`Play ${scaleNotes[0]}`);
  };

  const resetExercise = (): void => {
    setStatus("idle");
    setTargetIndex(0);
    lastHandledRef.current = null;
    setFeedback("Start the exercise and play the notes in order.");
  };

  const resumeAfterWrong = (): void => {
    setStatus("running");
    lastHandledRef.current = null;
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
