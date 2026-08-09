"use client";

import React from "react";
import Image from "next/image";
import { Globe, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onOpenContact: () => void;
}

export default function HeroSection({ onOpenContact }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden pt-6 pb-16 px-6 md:px-12 border-b border-[#18181f]">
      {/* Background Huge Condensed PORTFOLIO Backdrop Text - Solid Red */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <span className="bg-portfolio-text text-[21vw] font-black leading-none uppercase tracking-tighter block text-[#dc2626]">
          PORTFOLIO
        </span>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative z-10 min-h-[600px]">
        {/* Left Column: Intro & Bio */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5 flex flex-col justify-end pt-12 lg:pt-24 z-20"
        >
          {/* Cursive Hello Accent */}
          <span className="font-script text-3xl sm:text-4xl text-neutral-300 ml-1 mb-[-10px] tracking-wide">
            Hello, I&apos;m
          </span>

          {/* Main Name Heading */}
          <h1 className="font-condensed text-6xl sm:text-7xl xl:text-8xl font-extrabold text-white tracking-tight leading-[0.9] uppercase my-2">
            YASH<br />BAJPAI
          </h1>

          {/* Subtitle */}
          <h2 className="text-rose-500 font-bold text-sm sm:text-base tracking-widest uppercase mt-2 mb-4">
            WEB DESIGNER & UI/UX CREATOR
          </h2>

          {/* Description Paragraph */}
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-md font-light mb-6">
            I design and build stylish, user-focused web experiences that combine creativity
            with strategy. Passionate about clean design, smooth interactions, and details
            that make a difference.
          </p>

          {/* Availability Badge */}
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider text-neutral-300 bg-[#0e0e12] border border-[#22222d] px-3.5 py-2 rounded-full hover:border-rose-500/50 transition-colors">
              <Globe className="w-3.5 h-3.5 text-rose-500" />
              <span>AVAILABLE WORLDWIDE</span>
            </span>

            <button
              onClick={onOpenContact}
              className="text-xs uppercase font-bold tracking-wider text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-full transition-all shadow-lg shadow-rose-950/40 active:scale-95"
            >
              Get In Touch
            </button>
          </div>
        </motion.div>

        {/* Center-Right Column: Hero Portrait & Rotating Badge - Positioned over TF letters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="lg:col-span-5 relative flex justify-center items-end z-20"
        >
          {/* Portrait Container - Raw <img> for 100% uncompressed PNG quality, positioned over T and F */}
          <div className="relative w-full max-w-[460px] flex justify-center items-end group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/yash_portrait.png"
              alt="Yash Bajpai — Web Designer"
              className="w-full h-auto max-h-[560px] object-contain object-bottom drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Floating Circular Badge */}
          <div className="absolute top-[45%] -right-4 sm:-right-8 -translate-y-1/2 z-30">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#0d0d12]/90 border border-rose-600/30 backdrop-blur-md flex items-center justify-center p-2 shadow-2xl">
              {/* Rotating Circular Text Ring */}
              <div className="absolute inset-0 animate-spin-slow">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <path
                    id="textPath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="text-[8.5px] font-semibold tracking-[0.18em] uppercase fill-neutral-300">
                    <textPath href="#textPath" startOffset="0%">
                      Turning ideas into powerful digital experiences. ✦
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* Center Icon */}
              <div className="w-10 h-10 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Sparkles className="w-5 h-5 fill-rose-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Far-Right Column: Key Metrics / Stats Stack */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-2 flex flex-col justify-end space-y-6 pb-4 border-l border-[#1a1a24] pl-6 lg:pl-8"
        >
          <div className="group">
            <div className="font-condensed text-4xl sm:text-5xl font-extrabold text-rose-500 group-hover:translate-x-1 transition-transform">
              3+
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
              YEARS<br />EXPERIENCE
            </div>
          </div>

          <div className="w-8 h-[1px] bg-[#1a1a24]" />

          <div className="group">
            <div className="font-condensed text-4xl sm:text-5xl font-extrabold text-rose-500 group-hover:translate-x-1 transition-transform">
              40+
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
              PROJECTS<br />COMPLETED
            </div>
          </div>

          <div className="w-8 h-[1px] bg-[#1a1a24]" />

          <div className="group">
            <div className="font-condensed text-4xl sm:text-5xl font-extrabold text-rose-500 group-hover:translate-x-1 transition-transform">
              20+
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
              HAPPY<br />CLIENTS
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
