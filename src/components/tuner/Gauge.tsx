import { clampCents } from "../../utils/noteUtils";
import type { TuningDirection } from "../../utils/tunerStabilizer";

interface GaugeProps {
  cents: number | null;
  direction: TuningDirection;
}

const LED_COUNT = 21;
const CENTER_LED = Math.floor(LED_COUNT / 2);

export function Gauge({ cents, direction }: GaugeProps) {
  const clampedCents = cents === null ? 0 : clampCents(cents);
  const activeLed = Math.round(((clampedCents + 50) / 100) * (LED_COUNT - 1));

  return (
    <div className={`led-gauge ${direction}`} aria-label="Tuning gauge">
      <div className="gauge-scale">
        <span>-50</span>
        <span>0</span>
        <span>+50</span>
      </div>

      <div className="led-row">
        {Array.from({ length: LED_COUNT }, (_, index) => {
          const distanceFromActive = Math.abs(index - activeLed);
          const isCenter = index === CENTER_LED;
          const isLit =
            cents !== null &&
            (distanceFromActive === 0 ||
              (direction === "in-tune" && Math.abs(index - CENTER_LED) <= 1));

          return (
            <span
              // LED positions are fixed by index and do not reorder.
              key={index}
              className={[
                "led",
                isCenter ? "center-led" : "",
                isLit ? "lit" : "",
                index < CENTER_LED ? "flat-side" : "",
                index > CENTER_LED ? "sharp-side" : "",
              ].join(" ")}
            />
          );
        })}
      </div>

      <div
        className="gauge-needle"
        style={{ left: `${((clampedCents + 50) / 100) * 100}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
