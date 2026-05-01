import type { Scale } from "../../types/scale";

interface ScaleLibraryProps {
  scales: readonly Scale[];
  selectedScale: Scale;
  onSelectScale: (scale: Scale) => void;
}

export function ScaleLibrary({
  scales,
  selectedScale,
  onSelectScale,
}: ScaleLibraryProps) {
  return (
    <section className="solo-card scale-library">
      <div className="section-heading">
        <h2>Scale Library</h2>
        <span>{selectedScale.category}</span>
      </div>
      <div className="scale-library-grid">
        {scales.map((scale) => (
          <button
            key={scale.id}
            className={`scale-card ${
              selectedScale.id === scale.id ? "selected" : ""
            }`}
            type="button"
            onClick={() => onSelectScale(scale)}
          >
            <strong>{scale.name}</strong>
            <span>{scale.formula.join(" - ")}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
