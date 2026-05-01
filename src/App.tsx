import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { LearningPage } from "./components/pages/LearningPage";
import { PracticePage } from "./components/pages/PracticePage";
import { TrainingPage } from "./components/pages/TrainingPage";
import { TunerPage } from "./components/pages/TunerPage";
import type { AppRoute } from "./types/routes";

const ROUTES: readonly AppRoute[] = ["/practice", "/learning", "/training", "/tuner"];

function App() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(() =>
    normalizeRoute(window.location.pathname),
  );

  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", "/practice");
    }

    const handlePopState = (): void => {
      setActiveRoute(normalizeRoute(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleNavigate = (route: AppRoute): void => {
    if (route === activeRoute) {
      return;
    }

    window.history.pushState(null, "", route);
    setActiveRoute(route);
  };

  const page = useMemo(() => {
    switch (activeRoute) {
      case "/learning":
        return <LearningPage />;
      case "/training":
        return <TrainingPage />;
      case "/tuner":
        return <TunerPage />;
      default:
        return <PracticePage />;
    }
  }, [activeRoute]);

  return (
    <AppLayout activeRoute={activeRoute} onNavigate={handleNavigate}>
      {page}
    </AppLayout>
  );
}

function normalizeRoute(pathname: string): AppRoute {
  return ROUTES.includes(pathname as AppRoute)
    ? (pathname as AppRoute)
    : "/practice";
}

export default App;
