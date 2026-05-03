import { useEffect, useState } from "react";
import type { AppRoute } from "../../types/routes";
import { HelpModal } from "./HelpModal";

interface HelpButtonProps {
  activeRoute: AppRoute;
}

export function HelpButton({ activeRoute }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsOpen(false);
  }, [activeRoute]);

  return (
    <>
      <button
        className="help-button"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open help"
      >
        ?
      </button>
      {isOpen ? (
        <HelpModal activeRoute={activeRoute} onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  );
}
