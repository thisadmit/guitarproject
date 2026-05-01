import type { StabilizedTunerReading } from "../../utils/tunerStabilizer";

interface StatusPanelProps {
  reading: StabilizedTunerReading;
  isRunning: boolean;
}

export function StatusPanel({ reading, isRunning }: StatusPanelProps) {
  return (
    <aside className="status-panel" aria-label="Tuner details">
      <h2>Status</h2>

      <dl>
        <div>
          <dt>Input</dt>
          <dd>{isRunning ? "Active" : "Stopped"}</dd>
        </div>
        <div>
          <dt>Frequency</dt>
          <dd>{reading.frequency ? `${reading.frequency.toFixed(1)} Hz` : "--"}</dd>
        </div>
        <div>
          <dt>Note</dt>
          <dd>{reading.note?.fullName ?? "--"}</dd>
        </div>
        <div>
          <dt>Cents</dt>
          <dd>{reading.cents !== null ? reading.cents.toFixed(1) : "--"}</dd>
        </div>
        <div>
          <dt>Smoothed</dt>
          <dd>
            {reading.smoothedCents !== null
              ? reading.smoothedCents.toFixed(1)
              : "--"}
          </dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>
            {reading.targetFrequency
              ? `${reading.targetFrequency.toFixed(1)} Hz`
              : "--"}
          </dd>
        </div>
        <div>
          <dt>Clarity</dt>
          <dd>{reading.clarity ? `${Math.round(reading.clarity * 100)}%` : "--"}</dd>
        </div>
        <div>
          <dt>RMS</dt>
          <dd>{reading.rms > 0 ? reading.rms.toFixed(3) : "--"}</dd>
        </div>
      </dl>
    </aside>
  );
}
