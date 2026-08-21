"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, ExternalLink, X, Sparkles, Play, Monitor, Film, Palette, MessageSquare, Video as VideoIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Project {
  id: string;
  num: string;
  title: string;
  category: string;
  image: string;
  description: string;
  tags: string[];
  link: string;
}

interface SelectedProjectsSectionProps {
  onOpenContactService?: (serviceName: string) => void;
}

const CATEGORIES = ["ALL", "WEBSITES", "AI VIDEO ADS", "PRODUCT DEMOS", "LOGO DESIGN"];

export default function SelectedProjectsSection({ onOpenContactService }: SelectedProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [previewTab, setPreviewTab] = useState<"media" | "live" | "details">("media");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, "projects"), orderBy("num", "asc"));
        const snap = await getDocs(q);
        const fetched: Project[] = [];
        snap.forEach((doc) => {
          const d = doc.data();
          fetched.push({
            id: doc.id,
            num: d.num || "01",
            title: d.title || "",
            category: d.category || "",
            image: d.image || "",
            description: d.description || "",
            tags: d.tags || [],
            link: d.link || ""
          });
        });
        setProjectsList(fetched);
      } catch (err) {
        console.warn("Failed to load projects from Firestore:", err);
      }
    };
    fetchProjects();
  }, []);

  const matchCategory = (catStr: string, filterKey: string) => {
    const cat = (catStr || "").toUpperCase().trim();
    const key = filterKey.toUpperCase().trim();

    if (key === "ALL") return true;

    const isLogo = cat.includes("LOGO") || cat.includes("BRAND") || cat.includes("IDENTITY");
    const isAiAd = cat.includes("AI") || cat.includes("AD") || cat.includes("REELS") || cat.includes("TIKTOK");
    const isDemo = cat.includes("PRODUCT") || cat.includes("DEMO") || cat.includes("EXPLAINER") || cat.includes("WALKTHROUGH");

    if (key === "WEBSITE" || key === "WEBSITES") {
      if (cat.includes("WEB") || cat.includes("SITE") || cat.includes("APP") || cat.includes("DEV") || cat.includes("STORE") || cat === "WEBSITE" || cat === "") return true;
      return !isLogo && !isAiAd && !isDemo;
    }

    if (key === "LOGO DESIGN" || key === "LOGO") {
      return isLogo;
    }

    if (key === "AI VIDEO AD" || key === "AI VIDEO ADS" || key === "AI VIDEO") {
      return isAiAd;
    }

    if (key === "PRODUCT DEMO" || key === "PRODUCT DEMOS") {
      return isDemo;
    }

    return cat.includes(key);
  };

  const filteredProjects = projectsList.filter((p) => matchCategory(p.category, activeCategory));


  const isVideo = (url?: string) => {
    if (!url) return false;
    const l = url.toLowerCase();
    return l.endsWith(".mp4") || l.endsWith(".webm") || l.includes("youtube.com") || l.includes("youtu.be") || l.includes("vimeo.com");
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  };

  const getCategoryIcon = (categoryStr: string) => {
    const c = categoryStr.toUpperCase();
    if (c.includes("AI") || c.includes("AD") || c.includes("VIDEO")) return VideoIcon;
    if (c.includes("PRODUCT") || c.includes("DEMO")) return Film;
    if (c.includes("LOGO") || c.includes("BRAND")) return Palette;
    return Monitor;
  };


  return (
    <section id="projects" className="w-full py-16 px-6 md:px-12 border-b border-[#18181f] bg-[#060607]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-[#1a1a24] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-500 font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SHOWCASE PORTFOLIO</span>
            </div>
            <h2 className="font-condensed text-2xl sm:text-4xl font-extrabold tracking-wider uppercase text-white">
              SELECTED PROJECTS &amp; WORKS
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full transition-all border ${
                  activeCategory === cat
                    ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40 scale-105"
                    : "bg-[#0e0e14] text-neutral-400 border-[#222230] hover:text-white hover:border-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Cards Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => {
              const CatIcon = getCategoryIcon(project.category);
              const hasVideo = isVideo(project.link) || isVideo(project.image);
              const hasImage = project.image && project.image.trim().length > 0;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  onClick={() => {
                    setSelectedProject(project);
                    setPreviewTab(hasVideo ? "live" : "media");
                  }}
                  className="group cursor-pointer flex flex-col bg-[#0b0b0e] border border-[#1a1a24] rounded-lg overflow-hidden hover:border-rose-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20"
                >
                  {/* Project Card Image / Preview Thumbnail */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#111116] border-b border-[#14141c]">
                    {hasImage ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        unoptimized
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#141420] via-[#0d0d14] to-[#08080c] p-6 text-center">
                        <CatIcon className="w-8 h-8 text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="font-condensed text-base font-bold uppercase tracking-wider text-white">
                          {project.title}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-rose-400 font-semibold mt-1">
                          {project.category}
                        </span>
                      </div>
                    )}

                    {/* Media Type Overlay Badge */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/80 border border-white/10 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-white">
                      <CatIcon className="w-3 h-3 text-rose-500" />
                      <span>{project.category}</span>
                    </div>

                    {hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-rose-600/90 border border-white/30 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>

                  {/* Card Footer Info */}
                  <div className="p-5 flex items-center justify-between bg-[#0b0b0e]">
                    <div className="flex items-center gap-3">
                      {/* Number Badge */}
                      <span className="font-condensed text-2xl font-black text-rose-500">
                        {project.num}
                      </span>
                      <div>
                        <h3 className="font-condensed text-base font-bold tracking-wider text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-[10px] tracking-widest text-neutral-400 font-medium uppercase">
                          Click to preview project ✦
                        </p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full border border-[#22222d] flex items-center justify-center text-neutral-400 group-hover:border-rose-500 group-hover:text-white group-hover:bg-rose-600 transition-all shrink-0">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 px-6 bg-[#0c0c10] border border-[#1e1e2c] rounded-lg text-center my-4">
            <p className="text-neutral-400 text-xs uppercase tracking-wider font-semibold">
              No projects listed under <span className="text-rose-500">{activeCategory}</span> yet.
            </p>
            <p className="text-neutral-300 text-xs mt-1">
              Need a custom project in this category? Send an inquiry directly.
            </p>
          </div>
        )}
      </div>

      {/* Rich Interactive Project Preview Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0e0e14] border border-[#242436] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header Bar */}
              <div className="px-6 py-4 border-b border-[#1c1c28] bg-[#0b0b0f] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-condensed text-2xl font-black text-rose-500">
                    {selectedProject.num}
                  </span>
                  <div>
                    <h3 className="font-condensed text-xl font-extrabold uppercase text-white tracking-wide">
                      {selectedProject.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400">
                      {selectedProject.category}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-8 h-8 rounded-full bg-[#181822] border border-[#2a2a38] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview Mode Switcher Tabs */}
              <div className="flex items-center gap-2 px-6 py-2.5 bg-[#12121c] border-b border-[#1e1e2c] text-xs">
                <button
                  onClick={() => setPreviewTab("media")}
                  className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition-all ${
                    previewTab === "media"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                      : "text-neutral-400 hover:text-white bg-[#181824]"
                  }`}
                >
                  📷 Poster / Image
                </button>

                {selectedProject.link && selectedProject.link !== "#" && (
                  <button
                    onClick={() => setPreviewTab("live")}
                    className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      previewTab === "live"
                        ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                        : "text-neutral-400 hover:text-white bg-[#181824]"
                    }`}
                  >
                    <span>🚀 Live Preview / Video</span>
                  </button>
                )}

                <button
                  onClick={() => setPreviewTab("details")}
                  className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition-all ${
                    previewTab === "details"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                      : "text-neutral-400 hover:text-white bg-[#181824]"
                  }`}
                >
                  📋 Details &amp; Tags
                </button>
              </div>

              {/* Preview Content Area */}
              <div className="relative flex-1 w-full min-h-[320px] max-h-[500px] bg-[#060608] overflow-hidden">
                {previewTab === "live" && selectedProject.link && selectedProject.link !== "#" ? (
                  isVideo(selectedProject.link) ? (
                    selectedProject.link.includes("youtube.com") || selectedProject.link.includes("vimeo.com") || selectedProject.link.includes("youtu.be") ? (
                      <iframe
                        src={getEmbedUrl(selectedProject.link)}
                        title={selectedProject.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full min-h-[360px] border-0"
                      />
                    ) : (
                      <video
                        src={selectedProject.link}
                        controls
                        autoPlay
                        className="w-full h-full max-h-[440px] object-contain mx-auto"
                      />
                    )
                  ) : (
                    <div className="w-full h-full min-h-[360px] relative">
                      <iframe
                        src={selectedProject.link}
                        title={selectedProject.title}
                        className="w-full h-full border-0 bg-white"
                        sandbox="allow-scripts allow-same-origin"
                      />
                      <div className="absolute bottom-3 right-3 bg-black/80 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-md text-[10px] text-neutral-300">
                        Interactive Live Preview
                      </div>
                    </div>
                  )
                ) : previewTab === "media" && selectedProject.image && selectedProject.image.trim().length > 0 ? (
                  <div className="relative w-full h-full min-h-[360px]">
                    <Image
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                ) : (
                  /* Fallback Gradient Media Container */
                  <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#181826] via-[#101018] to-[#08080d] text-center">
                    <Sparkles className="w-12 h-12 text-rose-500 mb-4 animate-pulse" />
                    <h3 className="font-condensed text-3xl font-extrabold text-white uppercase tracking-wider mb-2">
                      {selectedProject.title}
                    </h3>
                    <p className="text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
                      {selectedProject.category}
                    </p>
                    <p className="text-neutral-300 text-xs max-w-lg leading-relaxed font-light">
                      {selectedProject.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Description & Action Footer */}
              <div className="p-6 bg-[#0e0e14] border-t border-[#1c1c28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold text-neutral-300 bg-[#161622] border border-[#262638] px-2.5 py-1 rounded uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {onOpenContactService && (
                    <button
                      onClick={() => {
                        onOpenContactService(selectedProject.category || selectedProject.title);
                        setSelectedProject(null);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-xs uppercase font-bold text-neutral-300 bg-[#1a1a26] hover:bg-neutral-800 border border-[#28283a] rounded transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                      <span>Inquire Service</span>
                    </button>
                  )}

                  {selectedProject.link && selectedProject.link !== "#" && (
                    <a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2 text-xs uppercase font-bold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-lg shadow-rose-950/50 transition-all active:scale-95"
                    >
                      <span>Open Project Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
