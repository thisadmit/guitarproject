import { useCallback, useEffect, useRef, useState } from "react";

interface UseMetronomeOptions {
  initialBpm?: number;
  beatsPerMeasure?: number;
}

export interface UseMetronomeResult {
  bpm: number;
  beatsPerMeasure: number;
  currentBeat: number;
  isPlaying: boolean;
  increaseBpm: () => void;
  decreaseBpm: () => void;
  start: () => void;
  stop: () => void;
}

export function useMetronome({
  initialBpm = 90,
  beatsPerMeasure = 4,
}: UseMetronomeOptions = {}): UseMetronomeResult {
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playClick = useCallback((beat: number): void => {
    const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;
    const audioContext =
      audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = audioContext;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = beat === 1 ? 1320 : 880;
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.07);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsPlaying(false);
    setCurrentBeat(1);
  }, []);

  const start = useCallback(() => {
    stop();
    setIsPlaying(true);
    setCurrentBeat(1);
    playClick(1);

    intervalRef.current = window.setInterval(() => {
      setCurrentBeat((beat) => {
        const nextBeat = beat >= beatsPerMeasure ? 1 : beat + 1;
        playClick(nextBeat);
        return nextBeat;
      });
    }, (60_000 / bpm));
  }, [beatsPerMeasure, bpm, playClick, stop]);

  useEffect(() => {
    if (isPlaying) {
      start();
    }

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [bpm]);

  useEffect(() => {
    return () => {
      stop();
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, [stop]);

  return {
    bpm,
    beatsPerMeasure,
    currentBeat,
    isPlaying,
    increaseBpm: () => setBpm((current) => Math.min(220, current + 5)),
    decreaseBpm: () => setBpm((current) => Math.max(40, current - 5)),
    start,
    stop,
  };
}
