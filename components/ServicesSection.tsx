"use client";

import React from "react";
import { Palette, Video, Film, Layout, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  deliverables: string[];
}

const SERVICES: ServiceItem[] = [
  {
    id: "logo-design",
    title: "LOGO & BRAND DESIGN",
    category: "Visual Identity",
    description: "Crafting iconic, timeless vector logos and brand identity systems that make your business instantly recognizable and memorable.",
    icon: Palette,
    badge: "Branding",
    deliverables: [
      "Custom Vector Logo Concepts",
      "Brand Guidelines & Color Palette",
      "Typography & Iconography System",
      "Print & Web Ready File Formats (SVG, PNG, AI)"
    ]
  },
  {
    id: "ai-video-ads",
    title: "AI VIDEO ADS",
    category: "Digital Marketing",
    description: "High-converting, hyper-engaging AI-generated video commercials tailored for Instagram Reels, TikTok, YouTube Shorts & Meta Ads.",
    icon: Video,
    badge: "AI Powered",
    deliverables: [
      "AI Scriptwriting & Ad Hooks",
      "Realistic AI Voiceovers & Avatars",
      "Motion Graphics & Caption Styling",
      "Multi-Format Export (9:16 & 16:9)"
    ]
  },
  {
    id: "product-demo-videos",
    title: "PRODUCT DEMO VIDEOS",
    category: "Product Showcases",
    description: "Sleek, captivating 2D/3D explainer & walkthrough videos that showcase your digital or physical product's features and drive conversions.",
    icon: Film,
    badge: "Showcase",
    deliverables: [
      "Screen Recording & UI Animations",
      "3D Product Mockup Showcase",
      "Professional Sound Design & Voiceover",
      "HD/4K Video Delivery for Web & Ads"
    ]
  },
  {
    id: "website-development",
    title: "WEBSITE DESIGN & DEV",
    category: "Full-Stack Development",
    description: "Building ultra-fast, responsive, aesthetic portfolio & SaaS websites with Next.js, Framer Motion, and strategic conversion design.",
    icon: Layout,
    badge: "Web Engineering",
    deliverables: [
      "Custom Next.js & React Web Apps",
      "Responsive UI/UX & Mobile Optimization",
      "CMS & Firebase Backend Integration",
      "SEO, Performance & Speed Optimization"
    ]
  }
];

interface ServicesSectionProps {
  onOpenContactService?: (serviceName: string) => void;
}

export default function ServicesSection({ onOpenContactService }: ServicesSectionProps) {
  return (
    <section id="services" className="w-full py-20 px-6 md:px-12 border-b border-[#18181f] bg-[#060607] text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#1a1a24] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-500 font-bold text-xs uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4" />
              <span>WHAT I DO &amp; OFFER</span>
            </div>
            <h2 className="font-condensed text-3xl sm:text-5xl font-extrabold tracking-tight uppercase text-white">
              CORE SERVICES &amp; EXPERTISE
            </h2>
          </div>
          <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-md leading-relaxed">
            From visual branding and high-converting AI video ads to product demos and web development — tailored solutions built to scale your business.
          </p>
        </div>

        {/* 4 Core Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="group relative flex flex-col justify-between bg-[#0b0b0e] border border-[#1a1a24] rounded-xl p-6 hover:border-rose-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/20"
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#12121a] border border-[#222232] flex items-center justify-center text-rose-500 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded-full">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <h3 className="font-condensed text-xl font-bold uppercase tracking-wide text-white group-hover:text-rose-400 transition-colors mb-1">
                    {service.title}
                  </h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-3">
                    {service.category}
                  </p>

                  {/* Description */}
                  <p className="text-neutral-400 text-xs font-light leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-[#161622]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-300 block mb-2">
                      KEY DELIVERABLES:
                    </span>
                    {service.deliverables.map((item, dIdx) => (
                      <div key={dIdx} className="flex items-start space-x-2 text-[11px] text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inquiry Action Button */}
                <button
                  onClick={() => onOpenContactService && onOpenContactService(service.title)}
                  className="w-full mt-4 flex items-center justify-center space-x-2 text-xs uppercase font-bold tracking-wider text-neutral-200 bg-[#12121c] border border-[#242436] hover:border-rose-500 hover:bg-rose-600 hover:text-white py-2.5 rounded-lg transition-all group/btn"
                >
                  <span>INQUIRE THIS SERVICE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
