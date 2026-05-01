import { useEffect, useMemo, useState } from "react";
import type { Scale } from "../../types/scale";
import type { NoteInfo } from "../../utils/noteUtils";
import {
  isNoteInScale,
  type ScaleValidationResult,
} from "../../utils/scaleValidation";

const NO_INPUT_PROMPT_DELAY_MS = 5000;

interface ScaleExercisePanelProps {
  boxMidiNumbers: readonly number[];
  currentInput: NoteInfo | null;
  currentNoteName: string | null;
  error: string | null;
  hasSignal: boolean;
  isListening: boolean;
  onStartListening: () => void;
  onToggleListening: () => void;
  rms: number;
  scaleNotes: readonly string[];
  scaleLabel: string;
  selectedScale: Scale;
}

export function ScaleExercisePanel({
  boxMidiNumbers,
  currentInput,
  currentNoteName,
  error,
  hasSignal,
  isListening,
  onStartListening,
  onToggleListening,
  rms,
  scaleNotes,
  scaleLabel,
  selectedScale,
}: ScaleExercisePanelProps) {
  const scaleResult = useMemo(
    () =>
      isNoteInScale(
        currentNoteName,
        scaleNotes,
        scaleLabel,
        boxMidiNumbers,
        currentInput?.midi ?? null,
        isListening,
      ),
    [
      boxMidiNumbers,
      currentInput?.midi,
      currentNoteName,
      isListening,
      scaleLabel,
      scaleNotes,
    ],
  );
  const [latestResult, setLatestResult] =
    useState<ScaleValidationResult | null>(null);
  const [showNoInputPrompt, setShowNoInputPrompt] = useState<boolean>(false);

  useEffect(() => {
    if (!isListening) {
      setLatestResult(null);
      setShowNoInputPrompt(false);
      return;
    }

    if (currentNoteName && scaleResult.status !== "no-signal") {
      setLatestResult(scaleResult);
      setShowNoInputPrompt(false);
      return;
    }

    setShowNoInputPrompt(false);
    const timeoutId = window.setTimeout(() => {
      setShowNoInputPrompt(true);
    }, NO_INPUT_PROMPT_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentNoteName, isListening, scaleResult]);

  const displayResult =
    isListening && !currentNoteName && !showNoInputPrompt
      ? latestResult ?? {
          ...scaleResult,
          message: "Listening...",
          status: "no-signal" as const,
        }
      : scaleResult;
  const liveStatus =
    displayResult.status === "in-scale"
      ? "correct"
      : displayResult.status === "wrong"
        ? "wrong"
        : displayResult.status;

  return (
    <section className={`solo-card guided-exercise combined-exercise ${liveStatus}`}>
      <div className="section-heading">
        <h2>Scale Exercise</h2>
        <span>{isListening ? "Running" : "Stopped"}</span>
      </div>

      <div className="exercise-feedback-layout">
        <div className="exercise-left">
          <p>
            {selectedScale.name}: play freely inside the selected scale. This
            exercise checks scale fit, not note order.
          </p>

          <div className="exercise-sequence">
            {scaleNotes.map((note) => (
              <span
                className={note === displayResult.normalizedNote ? "active" : ""}
                key={note}
              >
                {note}
              </span>
            ))}
          </div>

          <div className="exercise-target">
            <span>Scale status</span>
            <strong>{getStatusLabel(displayResult.status, displayResult.message)}</strong>
          </div>

          <p className="feedback-message">{displayResult.message}</p>

          <div className="exercise-actions">
            <button
              className="record-button"
              type="button"
              onClick={onStartListening}
              disabled={isListening}
            >
              Start Exercise
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={onToggleListening}
              disabled={!isListening}
            >
              Stop Exercise
            </button>
          </div>
        </div>

        <aside className={`exercise-right live-scale-feedback ${liveStatus}`}>
          <div className="section-heading compact">
            <h2>Your Note</h2>
            <span>{isListening ? "Live" : "Off"}</span>
          </div>

          {error ? <p className="inline-error">{error}</p> : null}

          <div className="live-note-readout">
            <span>Current note</span>
            <strong>{displayResult.displayNote ?? "--"}</strong>
          </div>

          <div className="input-monitor">
            <span>Input</span>
            <strong>
              {isListening
                ? hasSignal
                  ? "Signal"
                  : "Listening, no pitch"
                : "Off"}
            </strong>
            <small>RMS {rms > 0 ? rms.toFixed(3) : "--"}</small>
          </div>

          <p className="feedback-message">{displayResult.message}</p>

          <div className="allowed-note-row">
            {scaleNotes.map((note) => (
              <span
                className={note === displayResult.normalizedNote ? "active" : ""}
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

function getStatusLabel(status: string, message: string): string {
  if (message === "Listening...") {
    return "Listening";
  }

  switch (status) {
    case "in-scale":
      return "OK";
    case "outside-box":
      return "Outside Box";
    case "wrong":
      return "Wrong";
    case "no-signal":
      return "Play a note";
    default:
      return "Stopped";
  }
}
