import { useState } from "react";
import {
  getPositionVariantResult,
  getReusableScaleBoxByName,
  getScaleNotes,
  getTransposedBoxNotes,
  scales,
} from "../../data/scales";
import { FretboardPreview } from "../learn/FretboardPreview";
import { KeySelector } from "../learn/KeySelector";
import { MetronomePanel } from "../learn/MetronomePanel";
import { PositionSelector } from "../learn/PositionSelector";
import { PositionVariantSelector } from "../learn/PositionVariantSelector";
import { ScaleLibrary } from "../learn/ScaleLibrary";
import { ScaleExercisePanel } from "../learn/ScaleExercisePanel";
import { TabPreview } from "../learn/TabPreview";
import { useAudioInput } from "../../hooks/useAudioInput";
import { useTuner } from "../../hooks/useTuner";
import type { PositionVariant } from "../../types/scale";
import { getPlayableBoxMidiNumbers } from "../../utils/fretboardNoteUtils";
import type { StabilizerConfig } from "../../utils/tunerStabilizer";

const LEARN_TUNER_CONFIG: Partial<StabilizerConfig> = {
  attackIgnoreMs: 40,
  minClarity: 0.55,
  noteStableFrames: 2,
  rmsThreshold: 0.005,
  signalReleaseMs: 250,
};

export function LearnPage() {
  const [selectedScale, setSelectedScale] = useState(
    scales.find((scale) => scale.id === "minor-pentatonic") ?? scales[0],
  );
  const [selectedKey, setSelectedKey] = useState<string>("A");
  const [selectedPosition, setSelectedPosition] = useState<string>("Box 1");
  const [selectedVariant, setSelectedVariant] =
    useState<PositionVariant>("auto");
  const selectedBox = getReusableScaleBoxByName(selectedPosition);
  const positionVariantResult = selectedBox
    ? getPositionVariantResult(
        selectedKey,
        selectedScale,
        selectedBox,
        selectedVariant,
      )
    : null;
  const scaleNotes = getScaleNotes(selectedScale, selectedKey);
  const fretboardNotes = selectedBox
    ? getTransposedBoxNotes(
        selectedScale,
        selectedBox,
        selectedKey,
        selectedVariant,
      )
    : [];
  const { analyserNode, error, isRunning, sampleRate, start, stop } =
    useAudioInput();
  const tunerReading = useTuner(
    analyserNode,
    sampleRate,
    isRunning,
    LEARN_TUNER_CONFIG,
  );
  const currentInput = tunerReading.hasSignal ? tunerReading.note : null;
  const currentNoteName = tunerReading.hasSignal
    ? tunerReading.note?.fullName ?? null
    : null;
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
            checking whether your notes belong to the selected scale.
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
        <PositionVariantSelector
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
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
          positionVariantMessage={positionVariantResult?.message ?? null}
          selectedScale={selectedScale}
        />
        <ScaleExercisePanel
          key={`${selectedScale.id}-${selectedKey}-${selectedPosition}-${selectedVariant}`}
          boxMidiNumbers={getPlayableBoxMidiNumbers(fretboardNotes)}
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
          positionVariantMessage={positionVariantResult?.message ?? null}
          selectedScale={selectedScale}
        />
        <MetronomePanel />
      </div>
    </section>
  );
}
