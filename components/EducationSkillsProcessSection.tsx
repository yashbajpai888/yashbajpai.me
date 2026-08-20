import React, { useEffect, useState } from "react";
import { Search, Lightbulb, Edit3, Code, Send, Quote, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface EducationItem {
  id?: string;
  title: string;
  institution: string;
  years: string;
}

interface ProcessStep {
  id?: string;
  num: string;
  title: string;
  desc: string;
}

const DEFAULT_EDUCATION: EducationItem[] = [
  {
    title: "B.Sc. in Visual Communication Design",
    institution: "Binus University",
    years: "2018 - 2022"
  },
  {
    title: "UI/UX Design Certification",
    institution: "Google Career Certificates",
    years: "2023"
  }
];

const DEFAULT_SKILLS = [
  "WEB DESIGN",
  "UI/UX DESIGN",
  "FIGMA",
  "FRAMER",
  "ADOBE XD",
  "PHOTOSHOP",
  "WEBFLOW",
  "HTML / CSS",
  "JAVASCRIPT",
  "GSAP ANIMATION",
  "SEO BASICS"
];

const DEFAULT_PROCESS: ProcessStep[] = [
  { num: "01", title: "DISCOVER", desc: "Understanding goals, audience, and project requirements." },
  { num: "02", title: "IDEATE", desc: "Planning, wireframing, and creating the right concept." },
  { num: "03", title: "DESIGN", desc: "Crafting visual design with a focus on user experience." },
  { num: "04", title: "DEVELOP", desc: "Building fast, responsive, and high-performing websites." },
  { num: "05", title: "DELIVER", desc: "Testing, optimizing, and launching with perfection." }
];

const STEP_ICONS = [Search, Lightbulb, Edit3, Code, Send];

export default function EducationSkillsProcessSection() {
  const [educationList, setEducationList] = useState<EducationItem[]>(DEFAULT_EDUCATION);
  const [skillsList, setSkillsList] = useState<string[]>(DEFAULT_SKILLS);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(DEFAULT_PROCESS);
  const [quote, setQuote] = useState("Good design is not just how it looks, but how it works.");
  const [signature, setSignature] = useState("Yash");
  const [tagline, setTagline] = useState("LET'S CREATE SOMETHING GREAT TOGETHER.");

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const docRef = doc(db, "settings", "homepage");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          if (Array.isArray(data.education) && data.education.length > 0) {
            setEducationList(data.education);
          }
          if (Array.isArray(data.skills) && data.skills.length > 0) {
            setSkillsList(data.skills);
          }
          if (Array.isArray(data.process) && data.process.length > 0) {
            setProcessSteps(data.process);
          }
          if (data.about) {
            setQuote(data.about.quote || "Good design is not just how it looks, but how it works.");
            setSignature(data.about.signature || "Yash");
            setTagline(data.about.tagline || "LET'S CREATE SOMETHING GREAT TOGETHER.");
          }
        }
      } catch (err) {
        console.warn("Failed to load Education, Skills & Process data from Firestore, using static defaults:", err);
      }
    };
    fetchSectionData();
  }, []);

  return (
    <section className="w-full py-16 px-6 md:px-12 border-b border-[#18181f] bg-[#060607]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
        
        {/* Left Column (5 cols): EDUCATION & SKILLS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 flex flex-col space-y-8 pr-0 lg:pr-4 border-r-0 lg:border-r border-[#1a1a24]"
        >
          <h2 className="font-condensed text-xl font-bold tracking-wider uppercase text-white pb-3 border-b border-[#1a1a24]">
            EDUCATION &amp; SKILLS
          </h2>

          {/* Subsection: Education */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-4">
              EDUCATION
            </h3>

            <div className="space-y-5">
              {educationList.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      {edu.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-medium">{edu.institution}</p>
                  </div>
                  <span className="text-xs font-semibold text-rose-500 font-mono">
                    {edu.years}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subsection: Skills */}
          <div className="pt-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-4">
              SKILLS
            </h3>

            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <span key={skill} className="skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Middle Column (4 cols): WORK PROCESS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-4 flex flex-col space-y-6"
        >
          <h2 className="font-condensed text-xl font-bold tracking-wider uppercase text-white pb-3 border-b border-[#1a1a24]">
            WORK PROCESS
          </h2>

          <div className="relative pl-2 space-y-6">
            {/* Timeline Line */}
            <div className="absolute left-[21px] top-6 bottom-6 w-[1px] bg-[#1d1d28] -z-0" />

            {processSteps.map((step, idx) => {
              const StepIcon = STEP_ICONS[idx % STEP_ICONS.length] || Search;
              return (
                <div key={idx} className="relative z-10 flex items-start gap-4 group">
                  {/* Step Number Badge */}
                  <span className="font-condensed text-xs font-extrabold text-rose-500 pt-1 w-4 text-right">
                    {step.num}
                  </span>

                  {/* Step Icon Circle */}
                  <div className="w-8 h-8 rounded-full bg-[#0d0d12] border border-[#22222d] flex items-center justify-center text-neutral-300 group-hover:border-rose-500 group-hover:text-rose-400 transition-colors shadow-md">
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Step Details */}
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-rose-400 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-light mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column (3 cols): Crimson Quote Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-3 h-full"
        >
          <div className="red-quote-card h-full min-h-[380px] p-6 sm:p-8 rounded-sm flex flex-col justify-between relative overflow-hidden group">
            {/* Glowing Accent Orbs */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-900/30 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Giant Red Quote Symbol */}
              <Quote className="w-10 h-10 text-rose-600 fill-rose-600/30 mb-6 opacity-90" />

              <p className="text-white text-base sm:text-lg font-medium leading-relaxed italic tracking-wide">
                &ldquo;{quote}&rdquo;
              </p>
            </div>

            {/* Signature & Bottom Callout */}
            <div className="mt-8 pt-6 border-t border-rose-900/40">
              <div className="font-script text-4xl text-neutral-200 tracking-wide mb-6">
                {signature}
              </div>

              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5">
                <span>{tagline}</span>
                <Sparkles className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
