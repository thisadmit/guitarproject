import type { Scale } from "../../types/scale";

interface FretboardPreviewProps {
  selectedKey: string;
  selectedPosition: string;
  selectedScale: Scale;
}

const STRINGS = ["E", "B", "G", "D", "A", "E"];

export function FretboardPreview({
  selectedKey,
  selectedPosition,
  selectedScale,
}: FretboardPreviewProps) {
  return (
    <section className="solo-card fretboard-solo-preview">
      <div className="section-heading">
        <h2>Fretboard View</h2>
        <span>Root ready</span>
      </div>
      <p>
        {selectedKey} {selectedScale.name} · {selectedPosition}
      </p>
      <div className="solo-fretboard">
        {STRINGS.map((stringName, stringIndex) => (
          <div className="solo-string" key={`${stringName}-${stringIndex}`}>
            <span>{stringName}</span>
            <div>
              {Array.from({ length: 8 }, (_, fretIndex) => (
                <i
                  key={fretIndex}
                  className={fretIndex === 2 && stringIndex % 2 === 0 ? "root" : ""}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
