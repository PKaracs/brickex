"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type SyntheticEvent,
  type VideoHTMLAttributes,
} from "react";

type AutoplayVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "autoPlay" | "muted" | "playsInline" | "src"
> & {
  src: string;
};

export function AutoplayVideo({
  src,
  loop = true,
  preload = "auto",
  onCanPlay,
  onLoadedData,
  ...props
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay can still be blocked by browser settings; user controls remain available.
      });
    }
  }, []);

  useEffect(() => {
    startPlayback();
    const frame = window.requestAnimationFrame(startPlayback);

    const handleVisibilityChange = () => {
      if (!document.hidden) startPlayback();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [src, startPlayback]);

  const handleCanPlay = (event: SyntheticEvent<HTMLVideoElement>) => {
    onCanPlay?.(event);
    startPlayback();
  };

  const handleLoadedData = (event: SyntheticEvent<HTMLVideoElement>) => {
    onLoadedData?.(event);
    startPlayback();
  };

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      loop={loop}
      playsInline
      preload={preload}
      onCanPlay={handleCanPlay}
      onLoadedData={handleLoadedData}
      {...props}
    />
  );
}
