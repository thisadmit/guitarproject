import { PedalTuner } from "../tuner/PedalTuner";
import { StatusPanel } from "../tuner/StatusPanel";
import { Waveform } from "../tuner/Waveform";
import { useAudioInput } from "../../hooks/useAudioInput";
import { useTuner } from "../../hooks/useTuner";
import type { StabilizerConfig } from "../../utils/tunerStabilizer";

const TUNER_CONFIG: Partial<StabilizerConfig> = {
  attackIgnoreMs: 40,
  minClarity: 0.45,
  noteStableFrames: 2,
  rmsThreshold: 0.005,
  signalReleaseMs: 3000,
};

export function TunerPage() {
  const { analyserNode, error, isRunning, sampleRate, start, stop } =
    useAudioInput();
  const reading = useTuner(
    analyserNode,
    sampleRate,
    isRunning,
    TUNER_CONFIG,
  );
  const inputLevel = Math.min(1, reading.inputRms / 0.08);

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
          <p>
            {isRunning
              ? "Listening for guitar input."
              : "Click Start Tuner to enable microphone."}
          </p>
        </div>
        {error ? (
          <button className="primary-button" type="button" onClick={() => void start()}>
            Retry Audio
          </button>
        ) : isRunning ? (
          <span className={`audio-status-pill ${isRunning ? "active" : ""}`}>
            Listening
          </span>
        ) : (
          <button className="primary-button" type="button" onClick={() => void start()}>
            Start Tuner
          </button>
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
      </section>
    </section>
  );
}
