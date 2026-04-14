"use client";

import type Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseVideoElementOptions {
  videoUrl: string | null;
  layerRef: React.RefObject<Konva.Layer | null>;
}

interface UseVideoElementReturn {
  video: HTMLVideoElement | null;
  status: "idle" | "loading" | "loaded" | "error";
  videoWidth: number;
  videoHeight: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
}

export function useVideoElement({
  videoUrl,
  layerRef,
}: UseVideoElementOptions): UseVideoElementReturn {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const rafIdRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Create and manage video element
  useEffect(() => {
    if (!videoUrl) {
      setVideo(null);
      setStatus("idle");
      setVideoWidth(0);
      setVideoHeight(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const el = document.createElement("video");
    el.crossOrigin = "anonymous";
    el.preload = "auto";
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    el.src = videoUrl;

    videoRef.current = el;
    setStatus("loading");

    const handleLoaded = () => {
      setVideo(el);
      setStatus("loaded");
      setVideoWidth(el.videoWidth);
      setVideoHeight(el.videoHeight);
      setDuration(el.duration);
    };

    const handleError = () => {
      setStatus("error");
      setVideo(null);
    };

    el.addEventListener("loadeddata", handleLoaded);
    el.addEventListener("error", handleError);

    return () => {
      el.removeEventListener("loadeddata", handleLoaded);
      el.removeEventListener("error", handleError);
      el.pause();
      el.removeAttribute("src");
      el.load();
      videoRef.current = null;
      setVideo(null);
      setIsPlaying(false);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [videoUrl]);

  // rAF loop for Konva redraws while playing
  useEffect(() => {
    if (!isPlaying || !video) return;

    const tick = () => {
      setCurrentTime(video.currentTime);
      layerRef.current?.batchDraw();
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [isPlaying, video, layerRef]);

  const play = useCallback(() => {
    if (!video) return;
    video.play();
    setIsPlaying(true);
  }, [video]);

  const pause = useCallback(() => {
    if (!video) return;
    video.pause();
    setIsPlaying(false);
    setCurrentTime(video.currentTime);
  }, [video]);

  const togglePlayPause = useCallback(() => {
    if (!video) return;
    if (video.paused) {
      play();
    } else {
      pause();
    }
  }, [video, play, pause]);

  const seek = useCallback(
    (time: number) => {
      if (!video) return;
      video.currentTime = time;
      setCurrentTime(time);
      layerRef.current?.batchDraw();
    },
    [video, layerRef],
  );

  return {
    video,
    status,
    videoWidth,
    videoHeight,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    togglePlayPause,
    seek,
  };
}
