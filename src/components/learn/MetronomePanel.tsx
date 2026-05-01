import { useMetronome } from "../../hooks/useMetronome";

export function MetronomePanel() {
  const {
    beatsPerMeasure,
    bpm,
    currentBeat,
    decreaseBpm,
    increaseBpm,
    isPlaying,
    start,
    stop,
  } = useMetronome();

  return (
    <section className="solo-card metronome-panel">
      <div className="section-heading">
        <h2>Metronome</h2>
        <span>{isPlaying ? `Beat ${currentBeat}` : "Ready"}</span>
      </div>

      <div className="bpm-display">
        <button type="button" onClick={decreaseBpm}>-</button>
        <strong>{bpm}</strong>
        <button type="button" onClick={increaseBpm}>+</button>
      </div>
      <p>BPM · {beatsPerMeasure}/4</p>

      <button
        className={`record-button ${isPlaying ? "recording" : ""}`}
        type="button"
        onClick={isPlaying ? stop : start}
      >
        {isPlaying ? "Stop" : "Start"}
      </button>
    </section>
  );
}
