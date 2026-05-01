import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioInputState {
  analyserNode: AnalyserNode | null;
  sampleRate: number | null;
  isRunning: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

export function useAudioInput(): AudioInputState {
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [sampleRate, setSampleRate] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const stop = useCallback(() => {
    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    void audioContextRef.current?.close();
    audioContextRef.current = null;

    setAnalyserNode(null);
    setSampleRate(null);
    setIsRunning(false);
  }, []);

  const start = useCallback(async () => {
    if (isRunning) {
      return;
    }

    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioContextConstructor =
        window.AudioContext ?? window.webkitAudioContext;
      const audioContext = new AudioContextConstructor();
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      sourceNode.connect(analyser);

      audioContextRef.current = audioContext;
      mediaStreamRef.current = stream;
      sourceNodeRef.current = sourceNode;

      setAnalyserNode(analyser);
      setSampleRate(audioContext.sampleRate);
      setIsRunning(true);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Unable to start audio input.";
      setError(message);
      stop();
    }
  }, [isRunning, stop]);

  useEffect(() => stop, [stop]);

  return {
    analyserNode,
    sampleRate,
    isRunning,
    error,
    start,
    stop,
  };
}
