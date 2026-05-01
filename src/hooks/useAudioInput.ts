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
      console.debug("[audio-input] requesting getUserMedia");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      console.debug("[audio-input] getUserMedia success", {
        audioTracks: stream.getAudioTracks().map((track) => ({
          enabled: track.enabled,
          id: track.id,
          label: track.label,
          muted: track.muted,
          readyState: track.readyState,
        })),
      });

      const AudioContextConstructor =
        window.AudioContext ?? window.webkitAudioContext;
      const audioContext = new AudioContextConstructor();
      console.debug("[audio-input] audioContext created", {
        sampleRate: audioContext.sampleRate,
        state: audioContext.state,
      });

      if (audioContext.state === "suspended") {
        await audioContext.resume();
        console.debug("[audio-input] audioContext resumed", {
          state: audioContext.state,
        });
      }

      const sourceNode = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      sourceNode.connect(analyser);

      audioContextRef.current = audioContext;
      mediaStreamRef.current = stream;
      sourceNodeRef.current = sourceNode;

      console.debug("[audio-input] analyser ready", {
        fftSize: analyser.fftSize,
        sampleRate: audioContext.sampleRate,
        state: audioContext.state,
      });

      setAnalyserNode(analyser);
      setSampleRate(audioContext.sampleRate);
      setIsRunning(true);
      console.debug("[audio-input] isRunning -> true");
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Unable to start audio input.";
      console.debug("[audio-input] start failed", unknownError);
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
