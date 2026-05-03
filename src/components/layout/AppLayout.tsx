import type { ReactNode } from "react";
import { HelpButton } from "../help/HelpButton";
import { Sidebar } from "./Sidebar";
import type { AppRoute } from "../../types/routes";

interface AppLayoutProps {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  children: ReactNode;
}

export function AppLayout({
  activeRoute,
  onNavigate,
  children,
}: AppLayoutProps) {
  return (
    <div className="service-layout">
      <Sidebar activeRoute={activeRoute} onNavigate={onNavigate} />
      <main className="service-main">
        <div className="app-help-anchor">
          <HelpButton activeRoute={activeRoute} />
        </div>
        {children}
      </main>
    </div>
  );
}
