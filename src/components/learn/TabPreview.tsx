import type { FretboardNote, Scale, ScaleBox } from "../../types/scale";

interface TabPreviewProps {
  fretboardNotes: readonly FretboardNote[];
  positionVariantMessage: string | null;
  selectedBox: ScaleBox | null;
  selectedKey: string;
  selectedScale: Scale;
}

const TAB_STRING_ORDER = [
  { stringNumber: 1, label: "e" },
  { stringNumber: 2, label: "B" },
  { stringNumber: 3, label: "G" },
  { stringNumber: 4, label: "D" },
  { stringNumber: 5, label: "A" },
  { stringNumber: 6, label: "E" },
] as const;

export function TabPreview({
  fretboardNotes,
  positionVariantMessage,
  selectedBox,
  selectedKey,
  selectedScale,
}: TabPreviewProps) {
  const tab = selectedBox ? buildAscendingBoxTab(fretboardNotes) : null;

  return (
    <section className="solo-card tab-preview">
      <div className="section-heading">
        <h2>Tab View</h2>
        <span>{selectedBox ? selectedBox.name : "Placeholder"}</span>
      </div>
      <p>
        {selectedKey} {selectedScale.name} - Formula:{" "}
        {selectedScale.formula.join(" ")}
      </p>
      {positionVariantMessage ? <p>{positionVariantMessage}</p> : null}
      <pre aria-label="Scale tab preview">
        {tab ?? "Tab data for this scale box is coming soon."}
      </pre>
    </section>
  );
}

function buildAscendingBoxTab(fretboardNotes: readonly FretboardNote[]): string {
  const maxLead = 20;

  return TAB_STRING_ORDER.map(({ stringNumber, label }) => {
    const stringNotes = fretboardNotes
      .filter((note) => note.stringNumber === stringNumber)
      .sort((left, right) => left.displayFret - right.displayFret);
    const lead = getLeadPadding(stringNumber);
    const tail = Math.max(2, maxLead - lead);
    const fretText = stringNotes.map((note) => note.displayFret).join("--");

    return `${label}|${"-".repeat(lead)}${fretText}--${"-".repeat(tail)}`;
  }).join("\n");
}

function getLeadPadding(stringNumber: FretboardNote["stringNumber"]): number {
  const ascendingOrderFromLowString: Record<FretboardNote["stringNumber"], number> = {
    6: 0,
    5: 4,
    4: 8,
    3: 12,
    2: 16,
    1: 20,
  };

  return ascendingOrderFromLowString[stringNumber];
}
