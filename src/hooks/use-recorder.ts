'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type UseRecorderProps = {
  onPermissionError?: () => void;
  onStop?: (audioDataUri: string) => void;
  silenceThreshold?: number;
  silenceDuration?: number;
};

const SILENCE_THRESHOLD = 0.01;
const SILENCE_DURATION = 1500; // ms

export function useRecorder({ 
  onPermissionError, 
  onStop,
  silenceThreshold = SILENCE_THRESHOLD,
  silenceDuration = SILENCE_DURATION
}: UseRecorderProps = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    audioContextRef.current?.close();
    mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }
    
    mediaRecorderRef.current.stop();
    cleanup();
    setIsRecording(false);
  }, [cleanup]);

  const monitorSilence = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += Math.abs(dataArray[i] / 128 - 1);
    }
    const average = sum / dataArray.length;

    if (average < silenceThreshold) {
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(stopRecording, silenceDuration);
      }
    } else {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }

    animationFrameRef.current = requestAnimationFrame(monitorSilence);
  }, [silenceThreshold, silenceDuration, stopRecording]);

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        if (audioBlob.size > 0) {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Data = reader.result as string;
            if (onStop) {
              onStop(base64Data);
            }
          };
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      monitorSilence();
    } catch (err) {
      console.error("Error starting recording:", err);
      if (onPermissionError) {
        onPermissionError();
      }
      cleanup();
    }
  };

  return { isRecording, startRecording, stopRecording };
}
