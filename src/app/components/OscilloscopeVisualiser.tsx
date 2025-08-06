"use client";

import React, { useEffect, useRef, useState } from 'react';

interface OscilloscopeVisualizerProps {
  lineThickness?: number;
  gain?: number;
  attack?: number;
  decay?: number;
  colors?: string[];
  colorChangeInterval?: number;
  sparkleSize?: number;
  sparkleColor?: string;
  sparkleReactiveness?: number;
  sparkleVelocity?: number;
  sparkleSpread?: number;
}

const OscilloscopeVisualizer: React.FC<OscilloscopeVisualizerProps> = ({
  lineThickness = 2,
  gain = 2.5,
  attack = 0.15,
  decay = 0.25,
  colors = ['#00FF00', '#00FFFF', '#FF00FF', '#FFFF00'],
  colorChangeInterval = 30 * 1000,
  sparkleSize = 2,
  sparkleColor = '#FFFFFF',
  sparkleReactiveness = 0.8,
  sparkleVelocity = 5,
  sparkleSpread = 20,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  const animationFrameRef = useRef<number>(0);
  const colorIndexRef = useRef<number>(0);
  const sparklesRef = useRef<
    { x: number; y: number; vx: number; vy: number; opacity: number }[]
  >([]);

  // Configuration
  const timeWindow = 0.05; // Seconds of audio to display

  useEffect(() => {
    // Attempt fullscreen on mount
    const goFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    };
    goFullscreen();

    // Initialize audio
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const ctx = new AudioContext();
        setAudioContext(ctx);

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        analyserRef.current = analyser;
        dataArrayRef.current = new Float32Array(analyser.frequencyBinCount);

        // Start visualization
        draw();
      } catch (err) {
        console.error('Microphone access failed:', err);
      }
    };

    // Simulate click to trigger getUserMedia
    const simulateClick = () => {
      const event = new MouseEvent('click', { bubbles: true });
      document.dispatchEvent(event);
      initAudio();
    };
    simulateClick();

    return () => {
      if (audioContext) audioContext.close();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Color cycling
  useEffect(() => {
    const changeColor = () => {
      colorIndexRef.current = (colorIndexRef.current + 1) % colors.length;
    };
    const interval = setInterval(changeColor, colorChangeInterval);
    return () => clearInterval(interval);
  }, [colorChangeInterval, colors]);

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Calculate RMS amplitude for sparkle reactiveness
    analyser.getFloatTimeDomainData(dataArray);
    const rms = Math.sqrt(
      dataArray.reduce((sum, val) => sum + val * val, 0) / dataArray.length
    );
    const sparkleChance = Math.min(1, rms * sparkleReactiveness * 10);

    // Update sparkles
    sparklesRef.current = sparklesRef.current.filter(
      (s) => s.opacity > 0.01 && s.y > 0 && s.y < canvas.height
    );
    if (Math.random() < sparkleChance) {
      // Sample a point along the waveform
      const index = Math.floor(Math.random() * dataArray.length);
      const amplitude = dataArray[index] * gain;
      const x = (index / dataArray.length) * canvas.width;
    //   const y = canvas.height / 2 - amplitude * (canvas.height / 2);
        const y = canvas.height / 2;// - amplitude * (canvas.height / 2);
      const direction = Math.random() < 0.5 ? -1 : 1;
      sparklesRef.current.push({
        x: x + (Math.random() - 0.5) * sparkleSpread,
        y,
        vy: direction * sparkleVelocity * (0.5 + Math.random() * 0.5),
        vx: Math.random() * 2 - 1,
        opacity: Math.min(1, sparkleChance * 2),
      });
    }

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sparkles
    sparklesRef.current.forEach((sparkle) => {
      // Update position and velocity
      sparkle.y += sparkle.vy;
      sparkle.x += sparkle.vx;
      sparkle.vy *= 0.99; // Deceleration
      const edgeDistance = Math.abs(sparkle.y - canvas.height / 2) / (canvas.height / 2);
      sparkle.opacity = Math.max(0, sparkle.opacity - edgeDistance * 0.03);

      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, sparkleSize, 0, 2 * Math.PI);
      ctx.fillStyle = `${sparkleColor}${Math.floor(sparkle.opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fill();
    //   ctx.fillStyle = `${sparkleTint}${Math.floor(sparkle.opacity * 64).toString(16).padStart(2, '0')}`;
    //   ctx.globalCompositeOperation = 'lighter';
    //   ctx.fill();
    //   ctx.globalCompositeOperation = 'source-over';
    });

    // Draw oscilloscope line
    ctx.beginPath();
    ctx.lineWidth = lineThickness;
    ctx.strokeStyle = colors[colorIndexRef.current];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const sliceWidth = canvas.width / dataArray.length;
    let lastY = canvas.height / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < dataArray.length; i++) {
      const amplitude = dataArray[i] * gain;
      const y = centerY - amplitude * (canvas.height / 2);

      // Apply attack and decay
      const smoothedY = lastY + (y - lastY) * (y > lastY ? attack : decay);
      const x = i * sliceWidth;

      if (i === 0) {
        ctx.moveTo(x, smoothedY);
      } else {
        ctx.lineTo(x, smoothedY);
      }
      lastY = smoothedY;
    }

    ctx.stroke();
    animationFrameRef.current = requestAnimationFrame(draw);
  };

  return (
    <div className="fixed inset-0 bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ transition: 'color 1s ease' }}
      />
    </div>
  );
};

export default OscilloscopeVisualizer;