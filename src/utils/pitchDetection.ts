export interface PitchDetectionResult {
  frequency: number;
  clarity: number;
}

export interface AutoCorrelationOptions {
  minFrequency?: number;
  maxFrequency?: number;
  rmsThreshold?: number;
  clarityThreshold?: number;
}

const DEFAULT_OPTIONS: Required<AutoCorrelationOptions> = {
  minFrequency: 70,
  maxFrequency: 1_100,
  rmsThreshold: 0.01,
  clarityThreshold: 0.65,
};

export function detectPitchAutoCorrelation(
  buffer: Float32Array,
  sampleRate: number,
  options: AutoCorrelationOptions = {},
): PitchDetectionResult | null {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const bufferLength = buffer.length;

  if (bufferLength < 2 || sampleRate <= 0) {
    return null;
  }

  const rms = calculateRms(buffer);
  if (rms < settings.rmsThreshold) {
    return null;
  }

  // Remove DC offset so slow bias in the input does not dominate correlation.
  const mean = getMean(buffer);
  const normalized = new Float32Array(bufferLength);
  for (let index = 0; index < bufferLength; index += 1) {
    normalized[index] = buffer[index] - mean;
  }

  const minLag = Math.max(1, Math.floor(sampleRate / settings.maxFrequency));
  const maxLag = Math.min(
    bufferLength - 1,
    Math.ceil(sampleRate / settings.minFrequency),
  );

  let bestLag = -1;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    let energyA = 0;
    let energyB = 0;
    const overlap = bufferLength - lag;

    for (let index = 0; index < overlap; index += 1) {
      const sampleA = normalized[index];
      const sampleB = normalized[index + lag];
      correlation += sampleA * sampleB;
      energyA += sampleA * sampleA;
      energyB += sampleB * sampleB;
    }

    const denominator = Math.sqrt(energyA * energyB);
    if (denominator === 0) {
      continue;
    }

    const normalizedCorrelation = correlation / denominator;
    if (normalizedCorrelation > bestCorrelation) {
      bestCorrelation = normalizedCorrelation;
      bestLag = lag;
    }
  }

  if (bestLag < 0 || bestCorrelation < settings.clarityThreshold) {
    return null;
  }

  const refinedLag = refineLagWithParabolicInterpolation(
    normalized,
    bestLag,
  );
  const frequency = sampleRate / refinedLag;

  if (
    !Number.isFinite(frequency) ||
    frequency < settings.minFrequency ||
    frequency > settings.maxFrequency
  ) {
    return null;
  }

  return {
    frequency,
    clarity: bestCorrelation,
  };
}

export function calculateRms(buffer: Float32Array): number {
  let sumSquares = 0;

  for (const sample of buffer) {
    sumSquares += sample * sample;
  }

  return Math.sqrt(sumSquares / buffer.length);
}

function getMean(buffer: Float32Array): number {
  let sum = 0;

  for (const sample of buffer) {
    sum += sample;
  }

  return sum / buffer.length;
}

function refineLagWithParabolicInterpolation(
  buffer: Float32Array,
  lag: number,
): number {
  const previous = correlationAtLag(buffer, lag - 1);
  const current = correlationAtLag(buffer, lag);
  const next = correlationAtLag(buffer, lag + 1);
  const divisor = previous - 2 * current + next;

  if (Math.abs(divisor) < Number.EPSILON) {
    return lag;
  }

  // Peak offset in samples for a parabola fitted through lag - 1, lag, lag + 1.
  const shift = 0.5 * (previous - next) / divisor;
  return lag + Math.max(-0.5, Math.min(0.5, shift));
}

function correlationAtLag(buffer: Float32Array, lag: number): number {
  if (lag <= 0 || lag >= buffer.length) {
    return 0;
  }

  let correlation = 0;
  const overlap = buffer.length - lag;

  for (let index = 0; index < overlap; index += 1) {
    correlation += buffer[index] * buffer[index + lag];
  }

  return correlation / overlap;
}
