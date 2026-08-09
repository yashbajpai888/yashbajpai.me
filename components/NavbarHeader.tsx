"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function NavbarHeader() {
  return (
    <header className="w-full border-b border-[#18181f] py-4 px-6 md:px-12 flex items-center justify-between text-xs tracking-widest uppercase font-semibold text-[#8e8e98] bg-[#060607]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <span className="text-rose-500 font-bold">WEB DESIGNER</span>
        <span className="text-neutral-600">|</span>
        <span className="text-neutral-300">DIGITAL CREATOR</span>
      </div>

      <div className="flex items-center space-x-2 text-neutral-300 bg-[#0e0e12] border border-[#20202a] px-3 py-1.5 rounded-full hover:border-rose-500/50 transition-colors">
        <span className="tracking-wider">AVAILABLE FOR FREELANCE</span>
        <Sparkles className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
      </div>
    </header>
  );
}
