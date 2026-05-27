"use client";

import { useRef, useState, type ReactNode } from "react";

function SpeakerMutedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

/**
 * Hero background video. Always autoplays muted/looped (browsers block
 * autoplay with sound). When `sound` is enabled, a speaker toggle lets the
 * visitor turn sound on/off. Pass `src` (e.g. a Sanity video URL) and/or
 * `<source>` children as local fallbacks.
 */
export function HeroVideo({
  src,
  poster,
  sound = false,
  className = "absolute inset-0 h-full w-full object-cover",
  ariaLabel,
  children,
}: {
  src?: string;
  poster?: string;
  sound?: boolean;
  className?: string;
  ariaLabel?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    if (!next) void v.play().catch(() => {});
  };

  return (
    <>
      <video
        ref={ref}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        src={src}
        aria-label={ariaLabel}
      >
        {children}
      </video>
      {sound ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={muted ? "소리 켜기" : "소리 끄기"}
          className="absolute bottom-5 right-5 z-20 flex size-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
        >
          {muted ? <SpeakerMutedIcon /> : <SpeakerIcon />}
        </button>
      ) : null}
    </>
  );
}
