import { useEffect, useRef, useState } from "react";
import {
  calculateRms,
  detectPitchAutoCorrelation,
} from "../utils/pitchDetection";
import {
  createInitialStabilizerState,
  createNoSignalReading,
  DEFAULT_STABILIZER_CONFIG,
  stabilizePitchSample,
  type StabilizedTunerReading,
} from "../utils/tunerStabilizer";

const UI_UPDATE_INTERVAL_MS = 33;

const INITIAL_READING: StabilizedTunerReading = {
  hasSignal: false,
  frequency: null,
  note: null,
  cents: null,
  smoothedCents: null,
  clarity: null,
  rms: 0,
  targetFrequency: null,
  direction: "no-signal",
};

export function useTuner(
  analyserNode: AnalyserNode | null,
  sampleRate: number | null,
  isRunning: boolean,
): StabilizedTunerReading {
  const [reading, setReading] = useState<StabilizedTunerReading>(INITIAL_READING);
  const readingRef = useRef<StabilizedTunerReading>(INITIAL_READING);
  const stabilizerStateRef = useRef(createInitialStabilizerState());
  const animationFrameRef = useRef<number | null>(null);
  const lastUiUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!analyserNode || !sampleRate || !isRunning) {
      stabilizerStateRef.current = createInitialStabilizerState();
      readingRef.current = INITIAL_READING;
      setReading(INITIAL_READING);
      return;
    }

    const buffer = new Float32Array(analyserNode.fftSize);

    const publish = (nextReading: StabilizedTunerReading, timestamp: number): void => {
      if (timestamp - lastUiUpdateRef.current < UI_UPDATE_INTERVAL_MS) {
        readingRef.current = nextReading;
        return;
      }

      lastUiUpdateRef.current = timestamp;
      readingRef.current = nextReading;
      setReading(nextReading);
    };

    const update = (timestamp: number): void => {
      analyserNode.getFloatTimeDomainData(buffer);

      const rms = calculateRms(buffer);
      const detectedPitch =
        rms >= DEFAULT_STABILIZER_CONFIG.rmsThreshold
          ? detectPitchAutoCorrelation(buffer, sampleRate, {
              rmsThreshold: DEFAULT_STABILIZER_CONFIG.rmsThreshold,
              clarityThreshold: DEFAULT_STABILIZER_CONFIG.minClarity,
            })
          : null;

      const stabilizedReading = stabilizePitchSample(
        stabilizerStateRef.current,
        detectedPitch
          ? {
              frequency: detectedPitch.frequency,
              clarity: detectedPitch.clarity,
              rms,
              timestamp,
            }
          : null,
      );

      if (stabilizedReading) {
        publish(stabilizedReading, timestamp);
      } else if (
        stabilizerStateRef.current.lastSignalAt === null ||
        timestamp - stabilizerStateRef.current.lastSignalAt >
          DEFAULT_STABILIZER_CONFIG.signalReleaseMs
      ) {
        publish(createNoSignalReading(stabilizerStateRef.current), timestamp);
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, sampleRate, isRunning]);

  return reading;
}
