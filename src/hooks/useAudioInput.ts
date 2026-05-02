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
  const isRunningRef = useRef<boolean>(false);
  const startRequestIdRef = useRef<number>(0);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const stop = useCallback(() => {
    startRequestIdRef.current += 1;

    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    void audioContextRef.current?.close();
    audioContextRef.current = null;

    setAnalyserNode(null);
    setSampleRate(null);
    setIsRunning(false);
    isRunningRef.current = false;
  }, []);

  const start = useCallback(async () => {
    if (isRunningRef.current) {
      return;
    }

    setError(null);
    const requestId = startRequestIdRef.current + 1;
    startRequestIdRef.current = requestId;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let sourceNode: MediaStreamAudioSourceNode | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioContextConstructor =
        window.AudioContext ?? window.webkitAudioContext;
      audioContext = new AudioContextConstructor();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (startRequestIdRef.current !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        void audioContext.close();
        return;
      }

      sourceNode = audioContext.createMediaStreamSource(stream);
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
      isRunningRef.current = true;
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Unable to start audio input.";
      setError(message);
      sourceNode?.disconnect();
      stream?.getTracks().forEach((track) => track.stop());
      void audioContext?.close();
      stop();
    }
  }, [stop]);

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
