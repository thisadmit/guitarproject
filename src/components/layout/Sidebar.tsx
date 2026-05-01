import type { AppRoute } from "../../types/routes";

interface SidebarProps {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const SIDEBAR_ITEMS: readonly {
  route: AppRoute;
  icon: string;
  label: string;
  description: string;
}[] = [
  {
    route: "/practice",
    icon: "P",
    label: "Practice",
    description: "Free fretboard work",
  },
  {
    route: "/learning",
    icon: "L",
    label: "Learning",
    description: "Concepts and boxes",
  },
  {
    route: "/training",
    icon: "T",
    label: "Training",
    description: "Tests and drills",
  },
  {
    route: "/tuner",
    icon: "N",
    label: "Tuner",
    description: "Pitch tool",
  },
];

export function Sidebar({ activeRoute, onNavigate }: SidebarProps) {
  return (
    <aside className="service-sidebar">
      <div className="sidebar-brand">
        <span>SG</span>
        <div>
          <strong>Solo Guitar</strong>
          <small>Learning Studio</small>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.route}
            className={`sidebar-link ${
              activeRoute === item.route ? "active" : ""
            }`}
            type="button"
            onClick={() => onNavigate(item.route)}
            aria-current={activeRoute === item.route ? "page" : undefined}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
