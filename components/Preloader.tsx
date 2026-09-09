"use client";

import React, { useEffect, useState, useRef } from "react";

export default function Preloader() {
  const [progress, setProgress] = useState(1);
  const [stageText, setStageText] = useState("INITIALIZING EXPERIENCE");
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const isWindowLoadedRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Lock body scrolling immediately on initial page load
    document.body.classList.add("is-loading");
    startTimeRef.current = Date.now();

    // Check if initial page is already loaded (e.g. fast cache / hydration)
    if (document.readyState === "complete") {
      isWindowLoadedRef.current = true;
    }

    const handleLoad = () => {
      isWindowLoadedRef.current = true;
    };

    window.addEventListener("load", handleLoad);

    // Fallback safety timeout (max 6s) so preloader never hangs indefinitely
    const safetyTimeout = setTimeout(() => {
      isWindowLoadedRef.current = true;
    }, 6000);

    const MINIMUM_LOAD_TIME = 3000; // Exact 3s minimum experience

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const minTimeReached = elapsed >= MINIMUM_LOAD_TIME;
      const isReady = minTimeReached && isWindowLoadedRef.current;

      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        if (!isReady) {
          // Calculate paced progress across the 3000ms minimum window
          let target = 1;
          if (elapsed < 1000) {
            // 0 - 1s: 1 -> 25%
            target = 1 + (elapsed / 1000) * 24;
          } else if (elapsed < 2000) {
            // 1 - 2s: 25 -> 60%
            target = 25 + ((elapsed - 1000) / 1000) * 35;
          } else if (elapsed < 2700) {
            // 2 - 2.7s: 60 -> 90%
            target = 60 + ((elapsed - 2000) / 700) * 30;
          } else {
            // 2.7 - 3s: 90 -> 97%
            target = 90 + ((elapsed - 2700) / 300) * 7;
          }

          // Cap simulated progress at 97% until both minimum 3s & window load are fulfilled
          const nextVal = Math.min(97, Math.max(prev + 0.4, target));
          return nextVal;
        } else {
          // Both conditions met: swiftly advance to 100%
          const step = Math.max(1.5, (100 - prev) / 2.5);
          const next = prev + step;
          return next >= 100 ? 100 : next;
        }
      });
    }, 25);

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(safetyTimeout);
      clearInterval(interval);
    };
  }, []);

  // Update dynamic stage text based on current percentage
  useEffect(() => {
    const rounded = Math.floor(progress);
    if (rounded < 25) {
      setStageText("INITIALIZING EXPERIENCE");
    } else if (rounded < 50) {
      setStageText("LOADING ASSETS");
    } else if (rounded < 75) {
      setStageText("BUILDING EXPERIENCE");
    } else if (rounded < 98) {
      setStageText("FINALIZING SYSTEM");
    } else {
      setStageText("READY");
    }
  }, [progress]);

  // Handle 100% completion pause and sliding split-gate reveal
  useEffect(() => {
    if (progress >= 100) {
      // Short 250ms pause at 100%
      const gateTimer = setTimeout(() => {
        setIsGateOpen(true);

        // Unlock body scroll as gates open
        document.body.classList.remove("is-loading");

        // Completely unmount/hide after gates slide out of viewport (900ms)
        const unmountTimer = setTimeout(() => {
          setIsHidden(true);
        }, 950);

        return () => clearTimeout(unmountTimer);
      }, 250);

      return () => clearTimeout(gateTimer);
    }
  }, [progress]);

  if (isHidden) {
    return null;
  }

  const roundedProgress = Math.min(100, Math.floor(progress));
  const formattedProgress = roundedProgress < 10 ? `0${roundedProgress}` : `${roundedProgress}`;

  return (
    <div
      role="status"
      aria-label="Loading website"
      className="site-loader fixed inset-0 z-[99999] pointer-events-none select-none overflow-hidden"
    >
      {/* ========================================================
          TOP GATE PANEL (Slides UP on reveal)
          ======================================================== */}
      <div
        className={`absolute top-0 left-0 right-0 h-[50vh] bg-[#070709] border-b border-rose-500/20 z-10 transition-transform duration-[900ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isGateOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Subtle Background Technical Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141418_1px,transparent_1px),linear-gradient(to_bottom,#141418_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-25" />

        {/* Ambient Radial Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(225,29,72,0.1)_0%,transparent_70%)]" />

        {/* Top Header Technical HUD Labels */}
        <div className="relative z-20 flex items-center justify-between px-6 md:px-12 pt-6 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping" />
            <span className="font-semibold text-neutral-300">DIAMANT INFRASTRUCTURE</span>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-neutral-400">
            <span className="text-rose-500 font-bold">SYSTEM INITIALIZATION</span>
            <span className="text-neutral-600">//</span>
            <span className="text-neutral-400">V2.4.0</span>
          </div>
        </div>

        {/* Seam Laser Glow at Bottom of Top Gate */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/80 to-transparent shadow-[0_0_8px_#f43f5e]" />
      </div>

      {/* ========================================================
          BOTTOM GATE PANEL (Slides DOWN on reveal)
          ======================================================== */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[50vh] bg-[#070709] border-t border-rose-500/20 z-10 transition-transform duration-[900ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isGateOpen ? "translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Subtle Background Technical Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141418_1px,transparent_1px),linear-gradient(to_bottom,#141418_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-25" />

        {/* Ambient Radial Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(225,29,72,0.1)_0%,transparent_70%)]" />

        {/* Bottom Footer Technical HUD Labels */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">
          <div className="flex items-center space-x-2">
            <span className="text-neutral-400">DIGITAL EXPERIENCE</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-rose-500 font-bold">SYS.STATUS:</span>
            <span className="text-neutral-300 font-semibold">{stageText}</span>
          </div>
        </div>

        {/* Seam Laser Glow at Top of Bottom Gate */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/80 to-transparent shadow-[0_0_8px_#f43f5e]" />
      </div>

      {/* ========================================================
          CENTRAL CINEMATIC UI (Fades out when gates open)
          ======================================================== */}
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center px-4 transition-all duration-300 ${
          isGateOpen ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Central Graphic Container with Technical Outer Rings */}
        <div className="relative flex items-center justify-center mb-7 sm:mb-9">
          {/* Ambient Background Glow */}
          <div className="absolute w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-rose-600/15 blur-3xl animate-pulse" />

          {/* Outer Technical Dashed Ring 1 (Spin Reverse) */}
          <div className="absolute w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] md:w-[240px] md:h-[240px] rounded-full border border-dashed border-rose-500/25 animate-spin-reverse" />

          {/* Outer Technical Arc Ring 2 (Orbital indicator) */}
          <div className="absolute w-[180px] h-[180px] sm:w-[224px] sm:h-[224px] md:w-[268px] md:h-[268px] rounded-full border-t border-r border-rose-500/40 border-b-transparent border-l-transparent animate-loader-spin" />

          {/* EXACT PROVIDED CIRCULAR LOADER GRAPHIC */}
          <img
            src="/assets/loader.png"
            alt="Loading Experience"
            className="site-loader__graphic animate-loader-spin w-28 sm:w-36 md:w-44 lg:w-48 h-auto object-contain drop-shadow-[0_0_30px_rgba(225,29,72,0.25)] relative z-10"
          />
        </div>

        {/* Large Cinematic Numeric Display */}
        <div className="site-loader__percentage flex items-baseline justify-center mb-1.5">
          <span className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]">
            {formattedProgress}
          </span>
          <span className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-rose-500 ml-1">
            %
          </span>
        </div>

        {/* Intelligent Dynamic Stage Text */}
        <div className="site-loader__status flex items-center space-x-1.5 text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] text-neutral-300 uppercase mb-6">
          <span>{stageText}</span>
          <span className="text-rose-500 animate-pulse">●</span>
        </div>

        {/* Slim Premium Progress Bar Section */}
        <div className="w-[280px] sm:w-[360px] md:w-[420px] max-w-[80vw]">
          {/* Progress Sub-Details */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-400 mb-2 uppercase">
            <span className="flex items-center space-x-1">
              <span className="text-rose-500 font-semibold">LOAD</span>
              <span>// PROTOCOL</span>
            </span>
            <span>{roundedProgress} / 100</span>
          </div>

          {/* Progress Bar Track */}
          <div className="site-loader__progress w-full h-[4px] bg-neutral-900 border border-neutral-800/90 rounded-full overflow-hidden relative shadow-inner">
            {/* Active Fill with Glow */}
            <div
              className="site-loader__progress-bar h-full bg-gradient-to-r from-rose-700 via-rose-500 to-rose-400 rounded-full transition-all duration-100 ease-out shadow-[0_0_15px_rgba(225,29,72,0.8)] relative overflow-hidden"
              style={{ width: `${roundedProgress}%` }}
            >
              {/* Shimmer Light Sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
