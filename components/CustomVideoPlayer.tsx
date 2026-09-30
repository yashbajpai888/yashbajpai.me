"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { extractGoogleDriveFileId } from "@/lib/media";

interface CustomVideoPlayerProps {
  url: string;
  poster?: string;
  title?: string;
  className?: string;
}

export default function CustomVideoPlayer({
  url,
  poster,
  title,
  className = "",
}: CustomVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const driveFileId = extractGoogleDriveFileId(url);
  const isGoogleDrive = !!driveFileId || url.includes("drive.google.com");

  // Determine stream source: proxy for Google Drive or direct URL
  const videoSrc = isGoogleDrive && driveFileId
    ? `/api/video?id=${driveFileId}`
    : url;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // If autoplay/play policy restricts or stream fails
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleVideoError = () => {
    if (isGoogleDrive) {
      setUseIframeFallback(true);
    }
  };

  // If HTML5 video can play (direct or proxied Google Drive stream)
  if (!useIframeFallback) {
    return (
      <div
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseMove}
        className={`relative w-full h-[280px] xs:h-[320px] sm:h-[400px] md:h-[480px] max-h-[65vh] bg-black flex items-center justify-center overflow-hidden select-none group ${className}`}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          poster={poster}
          playsInline
          autoPlay
          controls={false}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={handleVideoError}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Center Big Play/Pause Toggle Splash */}
        {(!isPlaying || showControls) && (
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-rose-600 hover:scale-110 transition-all backdrop-blur-sm z-20 shadow-2xl"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-white" />
            ) : (
              <Play className="w-8 h-8 fill-white ml-1" />
            )}
          </button>
        )}

        {/* Minimal Bottom Bar: Strictly ONLY Play/Pause button */}
        <div
          className={`absolute bottom-3 left-3 z-30 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/80 hover:bg-rose-600 text-white border border-white/15 transition-all text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xl"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // If iframe fallback is active, shield both top and bottom right controls (gear, 3-dots, popout)
  const embedUrl = isGoogleDrive && driveFileId
    ? `https://drive.google.com/file/d/${driveFileId}/preview`
    : url;

  return (
    <div
      onContextMenu={handleContextMenu}
      className={`relative w-full h-[280px] xs:h-[320px] sm:h-[400px] md:h-[480px] max-h-[65vh] bg-black flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* Top Shield: Blocks Google Drive Popout/Download */}
      <div 
        className="absolute top-0 left-0 right-0 h-14 z-20 pointer-events-auto bg-gradient-to-b from-black/95 via-black/50 to-transparent flex items-center px-4"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={handleContextMenu}
      >
        <span className="text-xs font-bold text-neutral-300 truncate tracking-wide">
          {title || "Project Video"}
        </span>
      </div>

      {/* Bottom Right Shield: Covers Gear settings, 3-dots, and Fullscreen icons */}
      <div 
        className="absolute bottom-0 right-0 w-36 h-12 z-20 pointer-events-auto bg-black/90 rounded-tl-lg"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={handleContextMenu}
      />

      {/* Embedded Iframe */}
      <iframe
        src={embedUrl}
        title={title || "Video Player"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0 absolute inset-0 pointer-events-auto"
      />
    </div>
  );
}
