import { useState } from "react";
import {
  getScaleBoxByName,
  getScaleNotes,
  getTransposedBoxNotes,
  scales,
} from "../../data/scales";
import { FretboardPreview } from "../learn/FretboardPreview";
import { GuidedExercisePanel } from "../learn/GuidedExercisePanel";
import { KeySelector } from "../learn/KeySelector";
import { MetronomePanel } from "../learn/MetronomePanel";
import { PositionSelector } from "../learn/PositionSelector";
import { ScaleLibrary } from "../learn/ScaleLibrary";
import { TabPreview } from "../learn/TabPreview";
import { useAudioInput } from "../../hooks/useAudioInput";
import { useTuner } from "../../hooks/useTuner";

export function LearnPage() {
  const [selectedScale, setSelectedScale] = useState(
    scales.find((scale) => scale.id === "minor-pentatonic") ?? scales[0],
  );
  const [selectedKey, setSelectedKey] = useState<string>("A");
  const [selectedPosition, setSelectedPosition] = useState<string>("Box 1");
  const selectedBox = getScaleBoxByName(selectedScale, selectedPosition);
  const scaleNotes = getScaleNotes(selectedScale, selectedKey);
  const fretboardNotes = selectedBox
    ? getTransposedBoxNotes(selectedScale, selectedBox, selectedKey)
    : [];
  const { analyserNode, error, isRunning, sampleRate, start, stop } =
    useAudioInput();
  const tunerReading = useTuner(analyserNode, sampleRate, isRunning);
  const currentInput = tunerReading.hasSignal ? tunerReading.note : null;
  const currentNoteName = currentInput?.fullName ?? null;
  const scaleLabel = `${selectedKey} ${selectedScale.name}`;

  const handleToggleListening = (): void => {
    if (isRunning) {
      stop();
    } else {
      void start();
    }
  };

  const handleStartListening = (): void => {
    if (!isRunning) {
      void start();
    }
  };

  return (
    <section className="mode-layout learn-layout" aria-label="Learn mode">
      <div className="mode-hero learn-mode-hero">
        <div>
          <h2>Learn</h2>
          <strong>Scale, position, phrasing</strong>
          <p>
            Build solo vocabulary by choosing a scale, key, fretboard box, and
            guided exercise target.
          </p>
          <p className="learn-selection-summary">
            {selectedKey} {selectedScale.name} - {selectedPosition} - Notes:{" "}
            {scaleNotes.join(" ")}
          </p>
        </div>
        <div className="mode-focus-badge">
          Solo Learn
        </div>
      </div>

      <div className="learn-control-bar">
        <ScaleLibrary
          scales={scales}
          selectedScale={selectedScale}
          onSelectScale={setSelectedScale}
        />
        <KeySelector selectedKey={selectedKey} onSelectKey={setSelectedKey} />
        <PositionSelector
          selectedPosition={selectedPosition}
          onSelectPosition={setSelectedPosition}
        />
      </div>

      <div className="learn-main-area">
        <FretboardPreview
          currentInput={currentInput}
          fretboardNotes={fretboardNotes}
          isExerciseRunning={isRunning}
          scaleNotes={scaleNotes}
          selectedBox={selectedBox}
          selectedKey={selectedKey}
          selectedPosition={selectedPosition}
          selectedScale={selectedScale}
        />
        <GuidedExercisePanel
          key={`${selectedScale.id}-${selectedKey}-${selectedPosition}`}
          boxMidiNumbers={fretboardNotes.map((note) => note.midi)}
          currentInput={currentInput}
          currentNoteName={currentNoteName}
          error={error}
          hasSignal={tunerReading.hasSignal}
          isListening={isRunning}
          onStartListening={handleStartListening}
          onToggleListening={handleToggleListening}
          rms={tunerReading.inputRms}
          scaleLabel={scaleLabel}
          scaleNotes={scaleNotes}
          selectedScale={selectedScale}
        />
      </div>

      <div className="learn-support-area">
        <TabPreview
          fretboardNotes={fretboardNotes}
          selectedBox={selectedBox}
          selectedKey={selectedKey}
          selectedScale={selectedScale}
        />
        <MetronomePanel />
      </div>
    </section>
  );
}
