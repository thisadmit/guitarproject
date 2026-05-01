import { Gauge } from "./Gauge";
import type { StabilizedTunerReading } from "../../utils/tunerStabilizer";

interface PedalTunerProps {
  reading: StabilizedTunerReading;
  isRunning: boolean;
  onToggle: () => void;
}

const DIRECTION_LABELS = {
  "tune-up": "Tune Up",
  "in-tune": "In Tune",
  "tune-down": "Tune Down",
  "no-signal": "No Signal",
} as const;

export function PedalTuner({ reading, isRunning, onToggle }: PedalTunerProps) {
  const noteName = reading.hasSignal ? reading.note?.fullName ?? "--" : "--";

  return (
    <section className={`pedal ${reading.direction}`} aria-label="Pedal tuner">
      <div className="pedal-top">
        <span className="brand">CHROMATIC TUNER</span>
        <span className={`signal-dot ${reading.hasSignal ? "active" : ""}`} />
      </div>

      <Gauge cents={reading.smoothedCents} direction={reading.direction} />

      <div className="note-display" aria-label="Detected note">
        {noteName}
      </div>

      <div className="direction-display">
        <span>{DIRECTION_LABELS[reading.direction]}</span>
      </div>

      <button
        className={`footswitch ${isRunning ? "on" : ""}`}
        type="button"
        onClick={onToggle}
        aria-label={isRunning ? "Stop tuner" : "Start tuner"}
      >
        <span />
      </button>
    </section>
  );
}
