interface PositionSelectorProps {
  selectedPosition: string;
  onSelectPosition: (position: string) => void;
}

const POSITIONS = ["Box 1", "Box 2", "Box 3", "Box 4", "Box 5", "Full Fretboard"];

export function PositionSelector({
  selectedPosition,
  onSelectPosition,
}: PositionSelectorProps) {
  return (
    <section className="solo-card compact-selector">
      <div className="section-heading">
        <h2>Position / Box</h2>
        <span>Placeholder</span>
      </div>
      <div className="pill-grid">
        {POSITIONS.map((position) => (
          <button
            key={position}
            className={selectedPosition === position ? "selected" : ""}
            type="button"
            onClick={() => onSelectPosition(position)}
          >
            {position}
          </button>
        ))}
      </div>
    </section>
  );
}
