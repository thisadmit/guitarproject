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
import { PositionSelector } from "../learn/PositionSelector";
import { PositionVariantSelector } from "../learn/PositionVariantSelector";
import { ScaleLibrary } from "../learn/ScaleLibrary";
import { TabPreview } from "../learn/TabPreview";
import type { PositionVariant } from "../../types/scale";

export function LearningPage() {
  const [selectedScale, setSelectedScale] = useState(
    scales.find((scale) => scale.id === "minor-pentatonic") ?? scales[0],
  );
  const [selectedKey, setSelectedKey] = useState<string>("A");
  const [selectedPosition, setSelectedPosition] = useState<string>("Box 1");
  const [selectedVariant, setSelectedVariant] =
    useState<PositionVariant>("auto");
  const selectedBox = getReusableScaleBoxByName(selectedPosition);
  const scaleNotes = getScaleNotes(selectedScale, selectedKey);
  const fretboardNotes = selectedBox
    ? getTransposedBoxNotes(
        selectedScale,
        selectedBox,
        selectedKey,
        selectedVariant,
      )
    : [];
  const positionVariantResult = selectedBox
    ? getPositionVariantResult(
        selectedKey,
        selectedScale,
        selectedBox,
        selectedVariant,
      )
    : null;

  return (
    <section className="page-stack" aria-label="Learning">
      <div className="mode-hero learn-mode-hero">
        <div>
          <h2>Learning</h2>
          <strong>Understand scale structure</strong>
          <p>
            Study how intervals, roots, movable boxes, and lower-octave display
            positions connect across the fretboard.
          </p>
        </div>
        <div className="mode-focus-badge">Learning</div>
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

      <div className="learning-content-grid">
        <section className="solo-card learning-explainer">
          <div className="section-heading">
            <h2>Scale Map</h2>
            <span>{selectedScale.category}</span>
          </div>
          <p>{selectedScale.description}</p>
          <dl>
            <div>
              <dt>Formula</dt>
              <dd>{selectedScale.formula.join(" ")}</dd>
            </div>
            <div>
              <dt>Notes</dt>
              <dd>{scaleNotes.join(" ")}</dd>
            </div>
            <div>
              <dt>Use For</dt>
              <dd>{selectedScale.recommendedFor}</dd>
            </div>
            <div>
              <dt>Mood</dt>
              <dd>{selectedScale.mood}</dd>
            </div>
          </dl>
        </section>

        <FretboardPreview
          currentInput={null}
          fretboardNotes={fretboardNotes}
          isExerciseRunning={false}
          scaleNotes={scaleNotes}
          selectedBox={selectedBox}
          selectedKey={selectedKey}
          selectedPosition={selectedPosition}
          positionVariantMessage={positionVariantResult?.message ?? null}
          selectedScale={selectedScale}
        />

        <TabPreview
          fretboardNotes={fretboardNotes}
          positionVariantMessage={positionVariantResult?.message ?? null}
          selectedBox={selectedBox}
          selectedKey={selectedKey}
          selectedScale={selectedScale}
        />
      </div>
    </section>
  );
}
