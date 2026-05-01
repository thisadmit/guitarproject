import { useState } from "react";
import { scales } from "../../data/scales";
import { FretboardPreview } from "../learn/FretboardPreview";
import { GuidedExercisePanel } from "../learn/GuidedExercisePanel";
import { KeySelector } from "../learn/KeySelector";
import { PositionSelector } from "../learn/PositionSelector";
import { ScaleLibrary } from "../learn/ScaleLibrary";
import { TabPreview } from "../learn/TabPreview";

export function LearnPage() {
  const [selectedScale, setSelectedScale] = useState(scales[0]);
  const [selectedKey, setSelectedKey] = useState<string>("A");
  const [selectedPosition, setSelectedPosition] = useState<string>("Box 1");

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
        </div>
        <div className="mode-focus-badge">
          Solo Learn
        </div>
      </div>

      <div className="solo-learn-grid">
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
        <FretboardPreview
          selectedKey={selectedKey}
          selectedPosition={selectedPosition}
          selectedScale={selectedScale}
        />
        <TabPreview selectedKey={selectedKey} selectedScale={selectedScale} />
        <GuidedExercisePanel selectedScale={selectedScale} />
      </div>
    </section>
  );
}
