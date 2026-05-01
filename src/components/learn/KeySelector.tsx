interface KeySelectorProps {
  selectedKey: string;
  onSelectKey: (keyName: string) => void;
}

const KEYS = ["A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab"];

export function KeySelector({ selectedKey, onSelectKey }: KeySelectorProps) {
  return (
    <section className="solo-card compact-selector">
      <div className="section-heading">
        <h2>Key Selector</h2>
        <span>Placeholder</span>
      </div>
      <div className="pill-grid">
        {KEYS.map((keyName) => (
          <button
            key={keyName}
            className={selectedKey === keyName ? "selected" : ""}
            type="button"
            onClick={() => onSelectKey(keyName)}
          >
            {keyName}
          </button>
        ))}
      </div>
    </section>
  );
}
