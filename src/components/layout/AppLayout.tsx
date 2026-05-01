import type { ReactNode } from "react";
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
      <main className="service-main">{children}</main>
    </div>
  );
}
