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
  type StabilizerConfig,
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
  inputRms: 0,
  rms: 0,
  targetFrequency: null,
  direction: "no-signal",
};

export function useTuner(
  analyserNode: AnalyserNode | null,
  sampleRate: number | null,
  isRunning: boolean,
  configOverrides: Partial<StabilizerConfig> = {},
): StabilizedTunerReading {
  const rmsThreshold =
    configOverrides.rmsThreshold ?? DEFAULT_STABILIZER_CONFIG.rmsThreshold;
  const minClarity =
    configOverrides.minClarity ?? DEFAULT_STABILIZER_CONFIG.minClarity;
  const attackIgnoreMs =
    configOverrides.attackIgnoreMs ?? DEFAULT_STABILIZER_CONFIG.attackIgnoreMs;
  const smoothingFactor =
    configOverrides.smoothingFactor ??
    DEFAULT_STABILIZER_CONFIG.smoothingFactor;
  const noteStableFrames =
    configOverrides.noteStableFrames ??
    DEFAULT_STABILIZER_CONFIG.noteStableFrames;
  const maxFrequencyJumpRatio =
    configOverrides.maxFrequencyJumpRatio ??
    DEFAULT_STABILIZER_CONFIG.maxFrequencyJumpRatio;
  const signalReleaseMs =
    configOverrides.signalReleaseMs ??
    DEFAULT_STABILIZER_CONFIG.signalReleaseMs;

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
        rms >= rmsThreshold
          ? detectPitchAutoCorrelation(buffer, sampleRate, {
              rmsThreshold,
              clarityThreshold: minClarity,
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
        {
          rmsThreshold,
          minClarity,
          attackIgnoreMs,
          smoothingFactor,
          noteStableFrames,
          maxFrequencyJumpRatio,
          signalReleaseMs,
        },
      );

      if (stabilizedReading) {
        publish(stabilizedReading, timestamp);
      } else if (rms >= rmsThreshold) {
        // Surface raw input activity while the stabilizer is still waiting for
        // a reliable note. Learn uses this to show that the mic is listening.
        publish(
          {
            ...readingRef.current,
            hasSignal: false,
            frequency: null,
            note: null,
            cents: null,
            clarity: detectedPitch?.clarity ?? null,
            inputRms: rms,
            rms: 0,
            targetFrequency: null,
            direction: "no-signal",
          },
          timestamp,
        );
      } else if (
        stabilizerStateRef.current.lastSignalAt === null ||
        timestamp - stabilizerStateRef.current.lastSignalAt > signalReleaseMs
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
  }, [
    analyserNode,
    sampleRate,
    isRunning,
    rmsThreshold,
    minClarity,
    attackIgnoreMs,
    smoothingFactor,
    noteStableFrames,
    maxFrequencyJumpRatio,
    signalReleaseMs,
  ]);

  return reading;
}
