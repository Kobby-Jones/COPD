"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Square, Play, Pause, Trash2, Upload, CheckCircle2,
  RefreshCw, AlertCircle, FileAudio, Loader2, Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { audioService, type AudioRecording } from "@/services/api";
import { ApiError } from "@/lib/apiClient";

const MAX_RECORDING_SECONDS = 90;
const CANDIDATE_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type Stage = "idle" | "requesting" | "recording" | "recorded" | "uploading" | "uploaded" | "error";

interface AudioRecorderProps {
  patientId?: string;
  /** Called once the recording has been uploaded and has a server-side id. */
  onUploaded: (recording: AudioRecording | null) => void;
  disabled?: boolean;
}

export function AudioRecorder({ patientId, onUploaded, disabled }: AudioRecorderProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedRecording, setUploadedRecording] = useState<AudioRecording | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      stopStream();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    setStage("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStage("recorded");
        stopStream();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStage("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_RECORDING_SECONDS) {
            recorder.stop();
            clearTimer();
            return MAX_RECORDING_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      setStage("error");
      setErrorMessage(
        "Microphone access was denied or is unavailable. You can still upload a pre-recorded audio file below.",
      );
    }
  }, [clearTimer, stopStream]);

  const stopRecording = useCallback(() => {
    clearTimer();
    mediaRecorderRef.current?.stop();
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    stopStream();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    blobRef.current = null;
    setAudioUrl(null);
    setSeconds(0);
    setIsPlaying(false);
    setErrorMessage(null);
    setUploadedRecording(null);
    onUploaded(null);
    setStage("idle");
  }, [audioUrl, clearTimer, onUploaded, stopStream]);

  const togglePlayback = useCallback(() => {
    const el = audioElRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      el.play();
    }
  }, [isPlaying]);

  const handleFileSelect = useCallback((file: File) => {
    setErrorMessage(null);
    blobRef.current = file;
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setStage("recorded");
  }, []);

  const uploadRecording = useCallback(async () => {
    if (!blobRef.current) return;
    setStage("uploading");
    setErrorMessage(null);
    try {
      const filename =
        blobRef.current instanceof File ? blobRef.current.name : `recording-${Date.now()}.webm`;
      const recording = await audioService.upload(blobRef.current, filename, patientId);
      setUploadedRecording(recording);
      setStage("uploaded");
      onUploaded(recording);
    } catch (err) {
      setStage("recorded");
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to upload the recording. Please try again.");
      }
    }
  }, [onUploaded, patientId]);

  return (
    <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-clinical-blue-light flex items-center justify-center">
          <Stethoscope className="w-3.5 h-3.5 text-clinical-blue" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Breathing Sound Recording</h3>
          <p className="text-xs text-muted-foreground">Captured via stethoscope/mic — analyzed by the ICBHI respiratory-sound model</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8 gap-4">
            <button
              type="button"
              disabled={disabled}
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-clinical-blue hover:bg-[#1557A0] text-white flex items-center justify-center shadow-lg shadow-clinical-blue/25 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Mic className="w-6 h-6" />
            </button>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Tap to record breathing sounds (up to {MAX_RECORDING_SECONDS}s), or upload an existing audio file below.
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium text-clinical-blue hover:underline"
            >
              <FileAudio className="w-3.5 h-3.5" /> Upload audio file instead
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = "";
              }}
            />
          </motion.div>
        )}

        {stage === "requesting" && (
          <motion.div key="requesting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-6 h-6 text-clinical-blue animate-spin" />
            <p className="text-xs text-muted-foreground">Requesting microphone access…</p>
          </motion.div>
        )}

        {stage === "recording" && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8 gap-4">
            <button
              type="button"
              onClick={stopRecording}
              className="relative w-16 h-16 rounded-full bg-clinical-red text-white flex items-center justify-center shadow-lg shadow-red-500/30"
            >
              <span className="absolute inset-0 rounded-full bg-clinical-red animate-ping opacity-40" />
              <Square className="w-5 h-5 relative fill-current" />
            </button>
            <div className="text-center">
              <p className="text-lg font-mono font-bold text-foreground">{formatTime(seconds)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Recording… tap to stop</p>
            </div>
          </motion.div>
        )}

        {stage === "recorded" && audioUrl && (
          <motion.div key="recorded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-card rounded-lg border border-border px-4 py-3">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-9 h-9 rounded-full bg-clinical-blue-light text-clinical-blue flex items-center justify-center shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <audio
                ref={audioElRef}
                src={audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="flex-1 h-9"
                controls
              />
            </div>
            {errorMessage && (
              <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {errorMessage}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={uploadRecording}
                className="flex-1 h-10 rounded-lg bg-clinical-blue hover:bg-[#1557A0] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Use This Recording
              </button>
              <button
                type="button"
                onClick={reset}
                className="h-10 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-secondary flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-record
              </button>
            </div>
          </motion.div>
        )}

        {stage === "uploading" && (
          <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-6 h-6 text-clinical-blue animate-spin" />
            <p className="text-xs text-muted-foreground">Uploading recording…</p>
          </motion.div>
        )}

        {stage === "uploaded" && uploadedRecording && (
          <motion.div key="uploaded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between gap-3 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-green-800">Recording ready for analysis</p>
                <p className="text-[11px] text-green-700/80 truncate">{uploadedRecording.originalFilename}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="shrink-0 h-8 px-2.5 rounded-lg border border-green-200 text-[11px] font-medium text-green-700 hover:bg-green-100 flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </motion.div>
        )}

        {stage === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {errorMessage}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 h-9 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary flex items-center justify-center gap-1.5"
              >
                <FileAudio className="w-3.5 h-3.5" /> Upload audio file
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="flex-1 h-9 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary flex items-center justify-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" /> Try mic again
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = "";
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
