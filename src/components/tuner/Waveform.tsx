import { useEffect, useRef } from "react";

interface WaveformProps {
  analyserNode: AnalyserNode | null;
  isRunning: boolean;
  compact?: boolean;
}

export function Waveform({ analyserNode, isRunning, compact = false }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let animationFrameId: number | null = null;
    const data = analyserNode
      ? new Float32Array(analyserNode.fftSize)
      : new Float32Array(0);

    const resizeCanvas = (): void => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * devicePixelRatio);
      canvas.height = Math.floor(rect.height * devicePixelRatio);
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const drawIdleState = (): void => {
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      context.strokeStyle = "rgba(255, 255, 255, 0.18)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, height / 2);
      context.lineTo(width, height / 2);
      context.stroke();
    };

    const draw = (): void => {
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);

      context.fillStyle = "#10141f";
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "rgba(255, 255, 255, 0.12)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, height / 2);
      context.lineTo(width, height / 2);
      context.stroke();

      if (analyserNode && isRunning) {
        analyserNode.getFloatTimeDomainData(data);
      }

      context.strokeStyle = compact ? "rgba(88, 214, 141, 0.55)" : "#58d68d";
      context.lineWidth = compact ? 1.5 : 2;
      context.beginPath();

      for (let index = 0; index < data.length; index += 1) {
        const x = (index / (data.length - 1)) * width;
        const y = (0.5 - data[index] * 0.45) * height;

        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.stroke();
      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (analyserNode && isRunning) {
      draw();
    } else {
      drawIdleState();
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [analyserNode, isRunning]);

  return (
    <canvas
      ref={canvasRef}
      className={`waveform ${compact ? "compact" : ""}`}
      aria-label="Waveform"
    />
  );
}
