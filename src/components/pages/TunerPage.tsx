import { useEffect, useRef } from "react";
import { PedalTuner } from "../tuner/PedalTuner";
import { StatusPanel } from "../tuner/StatusPanel";
import { Waveform } from "../tuner/Waveform";
import { useAudioInput } from "../../hooks/useAudioInput";
import { useTuner } from "../../hooks/useTuner";
import type { StabilizerConfig } from "../../utils/tunerStabilizer";

const TUNER_DEBUG_CONFIG: Partial<StabilizerConfig> = {
  attackIgnoreMs: 40,
  minClarity: 0.45,
  noteStableFrames: 2,
  rmsThreshold: 0.005,
  signalReleaseMs: 3000,
};

export function TunerPage() {
  const hasRequestedAutoStartRef = useRef<boolean>(false);
  const { analyserNode, error, isRunning, sampleRate, start, stop } =
    useAudioInput();
  const reading = useTuner(
    analyserNode,
    sampleRate,
    isRunning,
    TUNER_DEBUG_CONFIG,
  );
  const inputLevel = Math.min(1, reading.inputRms / 0.08);

  useEffect(() => {
    if (!hasRequestedAutoStartRef.current) {
      hasRequestedAutoStartRef.current = true;
      void start();
    }
  }, [start]);

  const handleToggle = (): void => {
    if (isRunning) {
      stop();
    } else {
      void start();
    }
  };

  return (
    <section className="page-stack" aria-label="Tuner mode">
      <div className="tool-bar">
        <div>
          <h2>Tuner</h2>
          <p>Auto-listening tuner for quick checks before practice sessions.</p>
        </div>
        {error ? (
          <button className="primary-button" type="button" onClick={() => void start()}>
            Retry Audio
          </button>
        ) : (
          <span className={`audio-status-pill ${isRunning ? "active" : ""}`}>
            {isRunning ? "Listening" : "Starting..."}
          </span>
        )}
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      <section className="tuner-layout">
        <aside className="wave-panel" aria-label="Waveform panel">
          <div className="panel-heading">
            <h2>Waveform</h2>
            <span>{reading.hasSignal ? "Signal" : "Idle"}</span>
          </div>
          <Waveform analyserNode={analyserNode} isRunning={isRunning} compact />
          <div className="input-level-panel">
            <div className="input-level-header">
              <span>Input Level</span>
              <strong>{reading.inputRms > 0 ? reading.inputRms.toFixed(4) : "--"}</strong>
            </div>
            <div className="input-level-meter" aria-label="Audio input level">
              <span style={{ width: `${inputLevel * 100}%` }} />
            </div>
          </div>
        </aside>

        <PedalTuner
          reading={reading}
          isRunning={isRunning}
          onToggle={handleToggle}
        />

        <StatusPanel reading={reading} isRunning={isRunning} />

        <aside className="status-panel tuner-debug-panel" aria-label="Tuner debug">
          <h2>Debug</h2>
          <dl>
            <div>
              <dt>isRunning</dt>
              <dd>{String(isRunning)}</dd>
            </div>
            <div>
              <dt>sampleRate</dt>
              <dd>{sampleRate ?? "--"}</dd>
            </div>
            <div>
              <dt>analyser</dt>
              <dd>{analyserNode ? "exists" : "null"}</dd>
            </div>
            <div>
              <dt>inputRms</dt>
              <dd>{reading.inputRms > 0 ? reading.inputRms.toFixed(4) : "--"}</dd>
            </div>
            <div>
              <dt>clarity</dt>
              <dd>
                {reading.clarity !== null
                  ? `${Math.round(reading.clarity * 100)}%`
                  : "--"}
              </dd>
            </div>
            <div>
              <dt>frequency</dt>
              <dd>
                {reading.frequency !== null
                  ? `${reading.frequency.toFixed(1)} Hz`
                  : "--"}
              </dd>
            </div>
            <div>
              <dt>hasSignal</dt>
              <dd>{String(reading.hasSignal)}</dd>
            </div>
            <div>
              <dt>error</dt>
              <dd>{error ?? "--"}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </section>
  );
}
