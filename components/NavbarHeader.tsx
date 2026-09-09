"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function NavbarHeader() {
  return (
    <header className="w-full border-b border-[#18181f] py-3.5 md:py-4 px-4 sm:px-6 md:px-12 flex items-center justify-between text-[10px] sm:text-xs tracking-wider md:tracking-widest uppercase font-semibold text-[#8e8e98] bg-[#060607]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
        <span className="text-rose-500 font-bold truncate">DIGITAL MARKETING</span>
        <span className="text-neutral-600 hidden sm:inline">|</span>
        <span className="text-neutral-300 hidden sm:inline truncate">DIGITAL CREATOR</span>
      </div>

      <div className="flex items-center space-x-1.5 sm:space-x-2 text-neutral-300 bg-[#0e0e12] border border-[#20202a] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full hover:border-rose-500/50 transition-colors shrink-0">
        <span className="tracking-wider text-[9px] sm:text-xs">AVAILABLE FOR FREELANCE</span>
        <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-500 fill-rose-500" />
      </div>
    </header>
  );
}
