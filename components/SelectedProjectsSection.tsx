import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, ExternalLink, X } from "lucide-react";
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

export default function SelectedProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);

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

  return (
    <section className="w-full py-16 px-6 md:px-12 border-b border-[#18181f] bg-[#060607]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Horizontal Rule */}
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-[#1a1a24]">
          <h2 className="font-condensed text-xl sm:text-2xl font-bold tracking-wider uppercase text-white flex items-center gap-3">
            SELECTED PROJECTS
          </h2>

          <button className="text-xs uppercase font-semibold tracking-widest text-neutral-400 hover:text-rose-500 flex items-center gap-2 transition-colors group">
            <span>VIEW ALL PROJECTS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3 Projects Horizontal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projectsList.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              onClick={() => setSelectedProject(project)}
              className="group cursor-pointer flex flex-col bg-[#0b0b0e] border border-[#1a1a24] rounded-sm overflow-hidden hover:border-rose-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20"
            >
              {/* Project Card Image Thumbnail */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#111116]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>

              {/* Card Footer Info */}
              <div className="p-4 flex items-center justify-between bg-[#0b0b0e]">
                <div className="flex items-center gap-3">
                  {/* Number Badge */}
                  <span className="font-condensed text-2xl font-extrabold text-rose-500">
                    {project.num}
                  </span>
                  <div>
                    <h3 className="font-condensed text-base font-bold tracking-wider text-white group-hover:text-rose-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-[10px] tracking-widest text-neutral-400 font-medium">
                      {project.category}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full border border-[#22222d] flex items-center justify-center text-neutral-400 group-hover:border-rose-500 group-hover:text-white group-hover:bg-rose-600 transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Quick View Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-[#0e0e12] border border-[#262633] rounded-lg overflow-hidden shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full h-64 sm:h-80 bg-[#16161d]">
                <Image
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] via-transparent to-transparent" />
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-condensed text-3xl font-black text-rose-500">
                    {selectedProject.num}
                  </span>
                  <span className="text-xs tracking-widest text-neutral-400 font-semibold px-2.5 py-1 bg-[#1a1a24] rounded-full border border-[#2a2a38]">
                    {selectedProject.category}
                  </span>
                </div>

                <h2 className="font-condensed text-3xl sm:text-4xl font-extrabold text-white mb-4">
                  {selectedProject.title}
                </h2>

                <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                  {selectedProject.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold text-neutral-300 bg-[#171720] border border-[#282836] px-3 py-1 rounded-sm uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#1d1d28]">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="px-5 py-2 text-xs uppercase font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2 text-xs uppercase font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-lg shadow-rose-950/50 transition-all"
                  >
                    <span>Live Preview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
