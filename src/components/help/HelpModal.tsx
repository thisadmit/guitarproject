import { useEffect } from "react";
import type { AppRoute } from "../../types/routes";

interface HelpModalProps {
  activeRoute: AppRoute;
  onClose: () => void;
}

const HELP_CONTENT: Record<AppRoute, { title: string; items: string[] }> = {
  "/dashboard": {
    title: "Dashboard Help",
    items: [
      "Use Quick Start to jump into Practice, Training, or Tuner.",
      "Recent Activity reads local training records from this browser.",
      "Stats summarize total sessions, accuracy, streak, and completed problems.",
    ],
  },
  "/practice": {
    title: "Practice Help",
    items: [
      "Select Key, Scale, Box, and Position Variant before starting.",
      "Start Exercise enables microphone input for live note feedback.",
      "Watch the fretboard for NOW and wrong-note markers while you play.",
    ],
  },
  "/training": {
    title: "Training Help",
    items: [
      "Training Mode has no timer and allows press-and-hold Reveal Answer.",
      "Challenge Mode uses a time limit and disables answer reveal.",
      "Find notes on an empty fretboard; correct notes reveal one by one.",
    ],
  },
  "/tuner": {
    title: "Tuner Help",
    items: [
      "The tuner starts listening automatically when you enter this page.",
      "RMS shows input level, clarity shows pitch confidence, and frequency shows detected Hz.",
      "If there is no signal, check browser microphone permission and input device.",
    ],
  },
  "/learning": {
    title: "Learning Help",
    items: [
      "Use Learning to study scale structure and box layout visually.",
      "This page is static and focused on understanding rather than live input.",
      "Move to Practice when you want real-time note feedback.",
    ],
  },
};

const GENERAL_HELP = [
  "This app uses your microphone to detect guitar pitch.",
  "Browser microphone permission is required.",
  "If input does not work, check permissions and selected audio device.",
];

const AUDIO_INPUT_HELP = [
  "This app detects guitar sound through your browser audio input.",
  "For more accurate recognition, an audio interface is recommended over a built-in microphone.",
  "Connecting your guitar directly to an audio interface gives much more stable pitch detection.",
  "Recommended setup: audio interface such as Focusrite or Steinberg, direct line input, and a low-noise room.",
  "If input is unstable, consider using an audio interface and confirm browser microphone permission is allowed.",
  "Noisy environments can reduce pitch detection accuracy.",
];

export function HelpModal({ activeRoute, onClose }: HelpModalProps) {
  const content = HELP_CONTENT[activeRoute];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="help-modal-backdrop" onClick={onClose}>
      <section
        className="help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="help-modal-header">
          <div>
            <h2 id="help-modal-title">{content.title}</h2>
            <p>Quick guide for the current page.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close help">
            Close
          </button>
        </div>

        <div className="help-modal-section">
          <span>Current Page</span>
          <ul>
            {content.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="help-modal-section">
          <span>General</span>
          <ul>
            {GENERAL_HELP.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="help-modal-section audio-help-section">
          <span>Audio Input</span>
          <ul>
            {AUDIO_INPUT_HELP.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
