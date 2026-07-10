"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Muted, looping YouTube hero video with native controls hidden and captions
 * forced off. Uses the official YouTube IFrame Player API so we can reliably
 * unload the captions module (URL params like cc_load_policy=0 don't disable
 * auto-generated captions when a viewer has them globally enabled).
 * On hover a single custom play/pause button appears.
 */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function HoverVideoEmbed({
  id,
  title = "YouTube video player",
  className,
}: {
  id: string;
  title?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const killCaptions = (player: any) => {
      try {
        player.unloadModule("captions");
        player.unloadModule("cc");
        player.setOption("captions", "track", {});
      } catch {
        /* module not ready yet */
      }
    };

    const create = () => {
      if (cancelled || !containerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        width: "100%",
        height: "100%",
        videoId: id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: id,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          cc_load_policy: 0,
        },
        events: {
          onReady: (e: any) => {
            e.target.mute();
            e.target.playVideo();
            killCaptions(e.target);
          },
          onStateChange: (e: any) => {
            // 재생이 시작될 때마다 자막이 다시 켜지지 않도록 재차 제거
            killCaptions(e.target);
            if (e.data === window.YT.PlayerState.PLAYING) setPlaying(true);
            else if (e.data === window.YT.PlayerState.PAUSED) setPlaying(false);
          },
        },
      });
    };

    if (window.YT?.Player) {
      create();
    } else {
      if (!document.getElementById("yt-iframe-api")) {
        const s = document.createElement("script");
        s.id = "yt-iframe-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        create();
      };
    }

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [id]);

  const toggle = () => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) {
      p.pauseVideo();
      setPlaying(false);
    } else {
      p.playVideo();
      setPlaying(true);
    }
  };

  return (
    <div className={`group relative aspect-video w-full ${className ?? ""}`}>
      {/* YT.Player가 이 div를 iframe으로 대체 (width/height 100%) */}
      <div className="absolute inset-0 h-full w-full">
        <div ref={containerRef} className="h-full w-full" title={title} />
      </div>
      {/* Hover-only play/pause button */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "일시정지" : "재생"}
        className="absolute bottom-4 left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/75 focus-visible:opacity-100 group-hover:opacity-100"
      >
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
