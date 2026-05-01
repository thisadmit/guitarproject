import type { Scale } from "../../types/scale";

interface TabPreviewProps {
  selectedKey: string;
  selectedScale: Scale;
}

export function TabPreview({ selectedKey, selectedScale }: TabPreviewProps) {
  return (
    <section className="solo-card tab-preview">
      <div className="section-heading">
        <h2>Tab View</h2>
        <span>Coming soon</span>
      </div>
      <pre aria-label="Scale tab placeholder">{`e|----------------|
B|-----------${selectedKey}----|
G|------box-data---|
D|----------------|
A|--${selectedScale.formula.join("-")}--|
E|----------------|`}</pre>
    </section>
  );
}
