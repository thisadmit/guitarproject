import { PedalTuner } from "../tuner/PedalTuner";
import { StatusPanel } from "../tuner/StatusPanel";
import { Waveform } from "../tuner/Waveform";
import { useAudioInput } from "../../hooks/useAudioInput";
import { useTuner } from "../../hooks/useTuner";

export function TunerPage() {
  const { analyserNode, error, isRunning, sampleRate, start, stop } =
    useAudioInput();
  const reading = useTuner(analyserNode, sampleRate, isRunning);

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
          <p>Use this focused tool before learning or practice sessions.</p>
        </div>
        <button className="primary-button" type="button" onClick={handleToggle}>
          {isRunning ? "Stop" : "Start"}
        </button>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      <section className="tuner-layout">
        <aside className="wave-panel" aria-label="Waveform panel">
          <div className="panel-heading">
            <h2>Waveform</h2>
            <span>{reading.hasSignal ? "Signal" : "Idle"}</span>
          </div>
          <Waveform analyserNode={analyserNode} isRunning={isRunning} compact />
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
