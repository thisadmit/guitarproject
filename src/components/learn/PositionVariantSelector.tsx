import type { PositionVariant } from "../../types/scale";

interface PositionVariantSelectorProps {
  selectedVariant: PositionVariant;
  onSelectVariant: (variant: PositionVariant) => void;
}

const POSITION_VARIANTS: readonly {
  id: PositionVariant;
  label: string;
}[] = [
  { id: "auto", label: "Auto" },
  { id: "low", label: "Low" },
  { id: "high", label: "High" },
];

export function PositionVariantSelector({
  selectedVariant,
  onSelectVariant,
}: PositionVariantSelectorProps) {
  return (
    <section className="solo-card compact-selector">
      <div className="section-heading">
        <h2>Position</h2>
        <span>Display</span>
      </div>
      <div className="pill-grid">
        {POSITION_VARIANTS.map((variant) => (
          <button
            key={variant.id}
            className={selectedVariant === variant.id ? "selected" : ""}
            type="button"
            onClick={() => onSelectVariant(variant.id)}
          >
            {variant.label}
          </button>
        ))}
      </div>
    </section>
  );
}
