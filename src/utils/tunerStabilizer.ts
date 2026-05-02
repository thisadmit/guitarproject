import { clampCents, frequencyToNote, type NoteInfo } from "./noteUtils";

export type TuningDirection = "tune-up" | "in-tune" | "tune-down" | "no-signal";

export interface RawPitchSample {
  frequency: number;
  clarity: number;
  rms: number;
  timestamp: number;
}

export interface StabilizerConfig {
  rmsThreshold: number;
  minClarity: number;
  attackIgnoreMs: number;
  smoothingFactor: number;
  noteStableFrames: number;
  maxFrequencyJumpRatio: number;
  signalReleaseMs: number;
}

export interface StabilizerState {
  stableNote: NoteInfo | null;
  candidateNoteName: string | null;
  candidateFrames: number;
  smoothedCents: number | null;
  lastAcceptedFrequency: number | null;
  lastSignalStartedAt: number | null;
  lastSignalAt: number | null;
}

export interface StabilizedTunerReading {
  hasSignal: boolean;
  frequency: number | null;
  note: NoteInfo | null;
  cents: number | null;
  smoothedCents: number | null;
  clarity: number | null;
  inputRms: number;
  rms: number;
  targetFrequency: number | null;
  direction: TuningDirection;
}

export const DEFAULT_STABILIZER_CONFIG: StabilizerConfig = {
  rmsThreshold: 0.01,
  minClarity: 0.65,
  attackIgnoreMs: 80,
  smoothingFactor: 0.18,
  noteStableFrames: 5,
  maxFrequencyJumpRatio: 0.2,
  signalReleaseMs: 180,
};

export function createInitialStabilizerState(): StabilizerState {
  return {
    stableNote: null,
    candidateNoteName: null,
    candidateFrames: 0,
    smoothedCents: null,
    lastAcceptedFrequency: null,
    lastSignalStartedAt: null,
    lastSignalAt: null,
  };
}

export function getTuningDirection(
  cents: number | null,
  hasSignal: boolean,
): TuningDirection {
  if (!hasSignal || cents === null) {
    return "no-signal";
  }

  if (cents < -5) {
    return "tune-up";
  }

  if (cents > 5) {
    return "tune-down";
  }

  return "in-tune";
}

export function createNoSignalReading(
  state: StabilizerState,
): StabilizedTunerReading {
  state.candidateNoteName = null;
  state.candidateFrames = 0;
  state.lastAcceptedFrequency = null;
  state.lastSignalStartedAt = null;
  state.lastSignalAt = null;

  return {
    hasSignal: false,
    frequency: null,
    note: state.stableNote,
    cents: null,
    smoothedCents: state.smoothedCents,
    clarity: null,
    inputRms: 0,
    rms: 0,
    targetFrequency: state.stableNote?.targetFrequency ?? null,
    direction: "no-signal",
  };
}

export function stabilizePitchSample(
  state: StabilizerState,
  sample: RawPitchSample | null,
  config: StabilizerConfig = DEFAULT_STABILIZER_CONFIG,
): StabilizedTunerReading | null {
  if (!sample || sample.rms < config.rmsThreshold || sample.clarity < config.minClarity) {
    return null;
  }

  if (
    state.lastSignalAt === null ||
    sample.timestamp - state.lastSignalAt > config.signalReleaseMs
  ) {
    state.lastSignalStartedAt = sample.timestamp;
  }

  state.lastSignalAt = sample.timestamp;

  // Guitar pick attacks are noisy and often report transient overtones.
  if (
    state.lastSignalStartedAt !== null &&
    sample.timestamp - state.lastSignalStartedAt < config.attackIgnoreMs
  ) {
    return null;
  }

  const rawNote = frequencyToNote(sample.frequency);
  if (!rawNote) {
    return null;
  }

  const isLargeFrequencyJump =
    state.lastAcceptedFrequency !== null &&
    Math.abs(sample.frequency - state.lastAcceptedFrequency) /
      state.lastAcceptedFrequency >
      config.maxFrequencyJumpRatio;

  if (isLargeFrequencyJump && state.stableNote?.fullName === rawNote.fullName) {
    return null;
  }

  if (state.candidateNoteName === rawNote.fullName) {
    state.candidateFrames += 1;
  } else {
    state.candidateNoteName = rawNote.fullName;
    state.candidateFrames = 1;
  }

  const shouldCommitNote =
    state.stableNote === null ||
    (state.stableNote.fullName !== rawNote.fullName &&
      state.candidateFrames >= config.noteStableFrames) ||
    state.stableNote.fullName === rawNote.fullName;

  if (shouldCommitNote) {
    state.stableNote = rawNote;
  }

  // Do not let a not-yet-stable neighboring note drag the gauge around.
  if (state.stableNote?.fullName !== rawNote.fullName) {
    return null;
  }

  state.lastAcceptedFrequency = sample.frequency;

  const smoothedCents =
    state.smoothedCents === null
      ? rawNote.cents
      : state.smoothedCents + (rawNote.cents - state.smoothedCents) * config.smoothingFactor;

  state.smoothedCents = clampCents(smoothedCents);

  return {
    hasSignal: true,
    frequency: sample.frequency,
    note: state.stableNote,
    cents: rawNote.cents,
    smoothedCents: state.smoothedCents,
    clarity: sample.clarity,
    inputRms: sample.rms,
    rms: sample.rms,
    targetFrequency: state.stableNote.targetFrequency,
    direction: getTuningDirection(state.smoothedCents, true),
  };
}
