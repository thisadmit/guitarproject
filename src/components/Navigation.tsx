export type AppMode = "learn" | "practice" | "tuner";

interface NavigationProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const navItems: readonly { id: AppMode; label: string; description: string }[] = [
  {
    id: "learn",
    label: "Learn",
    description: "Goals and feedback",
  },
  {
    id: "practice",
    label: "Practice",
    description: "Free play records",
  },
  {
    id: "tuner",
    label: "Tuner",
    description: "Pitch tool",
  },
];

export function Navigation({ activeMode, onModeChange }: NavigationProps) {
  return (
    <nav className="navigation" aria-label="Main navigation">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeMode === item.id ? "active" : ""}`}
          type="button"
          onClick={() => onModeChange(item.id)}
          aria-current={activeMode === item.id ? "page" : undefined}
        >
          <span>{item.label}</span>
          <small>{item.description}</small>
        </button>
      ))}
    </nav>
  );
}
