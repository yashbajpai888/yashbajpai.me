import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getResumeConfig, ResumeConfig } from "@/lib/resume";

interface HeroSectionProps {
  onOpenContact: () => void;
}

export default function HeroSection({ onOpenContact }: HeroSectionProps) {
  const [greeting, setGreeting] = useState("Hello, I'm");
  const [name, setName] = useState("YASH BAJPAI");
  const [subtitle, setSubtitle] = useState("GTM ENGINEER SOFTWARE DEVELOPER & DIGITAL MARKETING");
  const [description, setDescription] = useState("I design and build stylish, user-focused web experiences that combine creativity with strategy. Passionate about clean design, smooth interactions, and details that make a difference.");
  const [portraitImage, setPortraitImage] = useState("/images/yash_portrait.png");
  const [badgeText, setBadgeText] = useState("Turning ideas into powerful digital experiences. ✦");
  const [exp, setExp] = useState("3+");
  const [proj, setProj] = useState("40+");
  const [clients, setClients] = useState("20+");
  const [resumeConfig, setResumeConfig] = useState<ResumeConfig | null>({
    url: "/Yash_S_Bajpai_Resume.pdf",
    name: "Yash_S_Bajpai_Resume.pdf",
    label: "MY RESUME",
    storagePath: "public/Yash_S_Bajpai_Resume.pdf",
    updatedAt: new Date()
  });

  const heroRef = useRef<HTMLElement>(null);
  const mouseRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    isHovering: false,
    rafId: 0,
  });

  // Cursor follow / mouse parallax logic (Active ONLY on desktop pointer:fine devices)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect reduced motion and only enable on fine-pointer devices (desktop >= 1024px)
    const isDesktopPointer = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isDesktopPointer || prefersReducedMotion) return;

    const heroEl = heroRef.current;
    if (!heroEl) return;

    const updateParallax = () => {
      const m = mouseRef.current;
      const lerpFactor = 0.08; // Smooth damping/interpolation

      m.currentX += (m.targetX - m.currentX) * lerpFactor;
      m.currentY += (m.targetY - m.currentY) * lerpFactor;

      // Update CSS custom properties directly on the Hero container (0 React re-renders)
      heroEl.style.setProperty("--hero-bg-x", `${(m.currentX * 7).toFixed(2)}px`);
      heroEl.style.setProperty("--hero-bg-y", `${(m.currentY * 5).toFixed(2)}px`);
      heroEl.style.setProperty("--hero-text-x", `${(m.currentX * 10).toFixed(2)}px`);
      heroEl.style.setProperty("--hero-text-y", `${(m.currentY * 8).toFixed(2)}px`);
      heroEl.style.setProperty("--hero-portrait-x", `${(m.currentX * 16).toFixed(2)}px`);
      heroEl.style.setProperty("--hero-portrait-y", `${(m.currentY * 14).toFixed(2)}px`);
      heroEl.style.setProperty("--hero-badge-x", `${(m.currentX * 18).toFixed(2)}px`);
      heroEl.style.setProperty("--hero-badge-y", `${(m.currentY * 16).toFixed(2)}px`);
      heroEl.style.setProperty("--hero-stats-x", `${(m.currentX * 8).toFixed(2)}px`);
      heroEl.style.setProperty("--hero-stats-y", `${(m.currentY * 6).toFixed(2)}px`);

      // Keep animation running while hovering or until smoothly settled back at 0
      const isSettled =
        !m.isHovering &&
        Math.abs(m.currentX) < 0.001 &&
        Math.abs(m.currentY) < 0.001;

      if (!isSettled) {
        m.rafId = requestAnimationFrame(updateParallax);
      } else {
        m.currentX = 0;
        m.currentY = 0;
        m.rafId = 0;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = heroEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Normalized coordinates from -1 to 1
      const normX = Math.max(-1, Math.min(1, ((mouseX / rect.width) - 0.5) * 2));
      const normY = Math.max(-1, Math.min(1, ((mouseY / rect.height) - 0.5) * 2));

      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
      mouseRef.current.isHovering = true;

      if (!mouseRef.current.rafId) {
        mouseRef.current.rafId = requestAnimationFrame(updateParallax);
      }
    };

    const handlePointerLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.isHovering = false;

      if (!mouseRef.current.rafId) {
        mouseRef.current.rafId = requestAnimationFrame(updateParallax);
      }
    };

    heroEl.addEventListener("pointermove", handlePointerMove, { passive: true });
    heroEl.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      heroEl.removeEventListener("pointermove", handlePointerMove);
      heroEl.removeEventListener("pointerleave", handlePointerLeave);
      if (mouseRef.current.rafId) {
        cancelAnimationFrame(mouseRef.current.rafId);
        mouseRef.current.rafId = 0;
      }
    };
  }, []);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const docRef = doc(db, "settings", "homepage");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.hero) {
            setGreeting(data.hero.greeting || "Hello, I'm");
            setName(data.hero.name || "YASH BAJPAI");
            setSubtitle(data.hero.subtitle || "GTM ENGINEER SOFTWARE DEVELOPER & DIGITAL MARKETING");
            setDescription(data.hero.description || "");
            setPortraitImage(data.hero.portraitImage || "/images/yash_portrait.png");
            setBadgeText(data.hero.rotatingBadgeText || "Turning ideas into powerful digital experiences. ✦");
            setExp(data.hero.yearsExperience || "3+");
            setProj(data.hero.projectsCompleted || "40+");
            setClients(data.hero.happyClients || "20+");
          }
        }
      } catch (error) {
        console.warn("Failed to load dynamic hero copy, using static fallbacks:", error);
      }
    };
    fetchHeroData();

    // Fetch dynamic resume configuration
    const fetchResume = async () => {
      const config = await getResumeConfig();
      if (config && config.url) {
        setResumeConfig(config);
      }
    };
    fetchResume();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden pt-6 pb-16 px-6 md:px-12 border-b border-[#18181f]"
    >
      {/* Background Huge Condensed PORTFOLIO Backdrop Text - Solid Red (Depth Layer 1) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <span
          className="bg-portfolio-text text-[21vw] font-black leading-none uppercase tracking-tighter block text-[#dc2626]"
          style={{
            transform: "translate3d(var(--hero-bg-x, 0px), var(--hero-bg-y, 0px), 0)",
            willChange: "transform",
          }}
        >
          PORTFOLIO
        </span>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative z-10 min-h-[600px]">
        {/* Left Column: Intro & Bio (Depth Layer 2) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5 flex flex-col justify-end pt-12 lg:pt-24 z-20"
        >
          <div
            className="flex flex-col justify-end"
            style={{
              transform: "translate3d(var(--hero-text-x, 0px), var(--hero-text-y, 0px), 0)",
              willChange: "transform",
            }}
          >
            {/* Cursive Greeting Accent */}
            <span className="font-script text-3xl sm:text-4xl text-neutral-300 ml-1 mb-[-10px] tracking-wide">
              {greeting}
            </span>

            {/* Main Name Heading */}
            <h1 className="font-condensed text-6xl sm:text-7xl xl:text-8xl font-extrabold text-white tracking-tight leading-[0.9] uppercase my-2">
              {name.split(" ").map((word, i) => (
                <React.Fragment key={i}>
                  {word}
                  {i < name.split(" ").length - 1 && <br />}
                </React.Fragment>
              ))}
            </h1>

            {/* Subtitle */}
            <h2 className="text-rose-500 font-bold text-sm sm:text-base tracking-widest uppercase mt-2 mb-4">
              {subtitle}
            </h2>

            {/* Description Paragraph */}
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-md font-light mb-6">
              {description}
            </p>
          </div>

          {/* CTA Row: My Resume & Get In Touch (Kept stable for optimal interaction) */}
          <div className="flex items-center space-x-3">
            {resumeConfig?.url && (
              <a
                href={resumeConfig.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs uppercase font-bold tracking-wider text-white bg-rose-600 hover:bg-rose-700 border border-rose-500/50 px-4 py-2 rounded-full transition-all shadow-lg shadow-rose-950/40 active:scale-95"
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>{resumeConfig.label || "MY RESUME"}</span>
              </a>
            )}

            <button
              onClick={onOpenContact}
              className="text-xs uppercase font-bold tracking-wider text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-full transition-all shadow-lg shadow-rose-950/40 active:scale-95"
            >
              Get In Touch
            </button>
          </div>
        </motion.div>

        {/* Center-Right Column: Hero Portrait & Rotating Badge (Depth Layers 3 & 4) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="lg:col-span-5 relative flex justify-center items-end z-20"
        >
          {/* Portrait Container (Depth Layer 3) */}
          <div className="relative w-full max-w-[460px] flex justify-center items-end group">
            <div
              className="w-full flex justify-center items-end"
              style={{
                transform: "translate3d(var(--hero-portrait-x, 0px), var(--hero-portrait-y, 0px), 0)",
                willChange: "transform",
              }}
            >
              <Image
                src={portraitImage}
                alt={`${name} — Portfolio`}
                width={460}
                height={560}
                priority
                quality={85}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 460px"
                className="w-full h-auto max-h-[560px] object-contain object-bottom drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Floating Circular Badge (Depth Layer 4) */}
          <div className="absolute top-[45%] right-0 sm:-right-8 -translate-y-1/2 z-30">
            <div
              className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-[#0d0d12]/95 border border-rose-600/30 flex items-center justify-center p-2 shadow-2xl"
              style={{
                transform: "translate3d(var(--hero-badge-x, 0px), var(--hero-badge-y, 0px), 0)",
                willChange: "transform",
              }}
            >
              {/* Rotating Circular Text Ring */}
              <div className="absolute inset-0 animate-spin-slow will-change-transform">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <path
                    id="textPath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="text-[8.5px] font-semibold tracking-[0.18em] uppercase fill-neutral-300">
                    <textPath href="#textPath" startOffset="0%">
                      {badgeText}
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* Center Icon */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Far-Right Column: Key Metrics / Stats Stack (Depth Layer 5) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-2 flex flex-row lg:flex-col justify-around lg:justify-end items-center lg:items-start border-t lg:border-t-0 lg:border-l border-[#1a1a24] pt-6 lg:pt-0 pb-2 lg:pb-4 pl-0 lg:pl-8 space-y-0 lg:space-y-6"
        >
          <div
            className="flex flex-row lg:flex-col justify-around lg:justify-end items-center lg:items-start w-full space-y-0 lg:space-y-6"
            style={{
              transform: "translate3d(var(--hero-stats-x, 0px), var(--hero-stats-y, 0px), 0)",
              willChange: "transform",
            }}
          >
            <div className="group text-center lg:text-left">
              <div className="font-condensed text-3xl sm:text-5xl font-extrabold text-rose-500 group-hover:translate-x-1 transition-transform">
                {exp}
              </div>
              <div className="text-[9px] sm:text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                YEARS<br />EXPERIENCE
              </div>
            </div>

            <div className="hidden lg:block w-8 h-[1px] bg-[#1a1a24]" />

            <div className="group text-center lg:text-left">
              <div className="font-condensed text-3xl sm:text-5xl font-extrabold text-rose-500 group-hover:translate-x-1 transition-transform">
                {proj}
              </div>
              <div className="text-[9px] sm:text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                PROJECTS<br />COMPLETED
              </div>
            </div>

            <div className="hidden lg:block w-8 h-[1px] bg-[#1a1a24]" />

            <div className="group text-center lg:text-left">
              <div className="font-condensed text-3xl sm:text-5xl font-extrabold text-rose-500 group-hover:translate-x-1 transition-transform">
                {clients}
              </div>
              <div className="text-[9px] sm:text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                HAPPY<br />CLIENTS
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

