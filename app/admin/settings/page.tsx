"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadMediaFile } from "@/lib/upload";
import { 
  Settings as SettingsIcon, 
  Sparkles, 
  Key, 
  Database, 
  Loader2, 
  Layout, 
  Mail,
  GraduationCap,
  ListOrdered,
  Plus,
  Trash2,
  Upload,
  FileText
} from "lucide-react";
import ResumeManagementSection from "@/components/admin/ResumeManagementSection";

interface EducationItem {
  id: string;
  title: string;
  institution: string;
  years: string;
}

interface ProcessStep {
  id: string;
  num: string;
  title: string;
  desc: string;
}

const DEFAULT_EDUCATION: EducationItem[] = [
  {
    id: "1",
    title: "B.Sc. in Visual Communication Design",
    institution: "Binus University",
    years: "2018 - 2022"
  },
  {
    id: "2",
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
  { id: "1", num: "01", title: "DISCOVER", desc: "Understanding goals, audience, and project requirements." },
  { id: "2", num: "02", title: "IDEATE", desc: "Planning, wireframing, and creating the right concept." },
  { id: "3", num: "03", title: "DESIGN", desc: "Crafting visual design with a focus on user experience." },
  { id: "4", num: "04", title: "DEVELOP", desc: "Building fast, responsive, and high-performing websites." },
  { id: "5", num: "05", title: "DELIVER", desc: "Testing, optimizing, and launching with perfection." }
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<
    "cms-hero" | "cms-resume" | "cms-education-skills" | "cms-process-quote" | "cms-contact" | "env"
  >("cms-hero");

  // CMS State - Hero & Stats
  const [heroGreeting, setHeroGreeting] = useState("Hello, I'm");
  const [heroName, setHeroName] = useState("YASH BAJPAI");
  const [heroSubtitle, setHeroSubtitle] = useState("GTM ENGINEER SOFTWARE DEVELOPER & DIGITAL MARKETING");
  const [heroDescription, setHeroDescription] = useState("I design and build stylish, user-focused web experiences that combine creativity with strategy. Passionate about clean design, smooth interactions, and details that make a difference.");
  const [heroAvailability, setHeroAvailability] = useState("AVAILABLE WORLDWIDE");
  const [heroPortraitImage, setHeroPortraitImage] = useState("/images/yash_portrait.png");
  const [heroBadgeText, setHeroBadgeText] = useState("Turning ideas into powerful digital experiences. ✦");
  const [statExp, setStatExp] = useState("3+");
  const [statProj, setStatProj] = useState("40+");
  const [statClients, setStatClients] = useState("20+");

  // CMS State - Education & Skills
  const [educationList, setEducationList] = useState<EducationItem[]>(DEFAULT_EDUCATION);
  const [skillsList, setSkillsList] = useState<string[]>(DEFAULT_SKILLS);
  const [newSkillInput, setNewSkillInput] = useState("");

  // CMS State - Process & Quote
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(DEFAULT_PROCESS);
  const [aboutQuote, setAboutQuote] = useState("Good design is not just how it looks, but how it works.");
  const [aboutSignature, setAboutSignature] = useState("Yash");
  const [aboutTagline, setAboutTagline] = useState("LET'S CREATE SOMETHING GREAT TOGETHER.");

  // CMS State - Contact & Footer
  const [contactHeadline, setContactHeadline] = useState("LET'S WORK TOGETHER");
  const [contactDescription, setContactDescription] = useState("I'm currently open for new projects and collaborations. Let's create something amazing that drives results.");
  const [contactEmail, setContactEmail] = useState("yashbjp888@gmail.com");
  const [contactWebsite, setContactWebsite] = useState("www.yashbajpai.com");
  const [contactPhone, setContactPhone] = useState("+91 79720 78625");
  const [contactLocation, setContactLocation] = useState("Nagpur, India");
  const [contactWorkspaceImage, setContactWorkspaceImage] = useState("/images/contact_laptop.png");

  // Cloudinary uploading states
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [uploadingWorkspace, setUploadingWorkspace] = useState(false);

  // System Environment states
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});

  const fetchCMSData = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "settings", "homepage"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Hero
        if (data.hero) {
          setHeroGreeting(data.hero.greeting || "Hello, I'm");
          setHeroName(data.hero.name || "YASH BAJPAI");
          setHeroSubtitle(data.hero.subtitle || "GTM ENGINEER SOFTWARE DEVELOPER & DIGITAL MARKETING");
          setHeroDescription(data.hero.description || "");
          setHeroAvailability(data.hero.availability || "AVAILABLE WORLDWIDE");
          setHeroPortraitImage(data.hero.portraitImage || "/images/yash_portrait.png");
          setHeroBadgeText(data.hero.rotatingBadgeText || "Turning ideas into powerful digital experiences. ✦");
          setStatExp(data.hero.yearsExperience || "3+");
          setStatProj(data.hero.projectsCompleted || "40+");
          setStatClients(data.hero.happyClients || "20+");
        }

        // Education & Skills
        if (Array.isArray(data.education) && data.education.length > 0) {
          setEducationList(data.education);
        }
        if (Array.isArray(data.skills) && data.skills.length > 0) {
          setSkillsList(data.skills);
        }

        // Process & Quote
        if (Array.isArray(data.process) && data.process.length > 0) {
          setProcessSteps(data.process);
        }
        if (data.about) {
          setAboutQuote(data.about.quote || "Good design is not just how it looks, but how it works.");
          setAboutSignature(data.about.signature || "Yash");
          setAboutTagline(data.about.tagline || "LET'S CREATE SOMETHING GREAT TOGETHER.");
        }

        // Contact details
        if (data.contact) {
          setContactHeadline(data.contact.headline || "LET'S WORK TOGETHER");
          setContactDescription(data.contact.description || "I'm currently open for new projects and collaborations. Let's create something amazing that drives results.");
          setContactEmail(data.contact.email || "yashbjp888@gmail.com");
          setContactWebsite(data.contact.website || "www.yashbajpai.com");
          setContactPhone(data.contact.phone || "+91 79720 78625");
          setContactLocation(data.contact.location || "Nagpur, India");
          setContactWorkspaceImage(data.contact.workspaceImage || "/images/contact_laptop.png");
        }
      }
    } catch (err: any) {
      console.warn("Failed to load settings document from Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMSData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "resume" || tabParam === "cms-resume") {
        setActiveTab("cms-resume");
      }
    }
    setEnvStatus({
      FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "mock-api-key",
      FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "rayhan-portfolio",
      CLOUDINARY: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== "your_cloudinary_cloud_name"
    });
  }, []);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    setLoadingState: (loading: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingState(true);
    try {
      const mediaUrl = await uploadMediaFile(file, { folder: "settings" });
      setter(mediaUrl);
      alert("File uploaded successfully!");
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setLoadingState(false);
    }
  };

  // Education Helpers
  const addEducationItem = () => {
    setEducationList((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: "New Degree or Certification",
        institution: "University / Platform Name",
        years: "2024"
      }
    ]);
  };

  const updateEducationItem = (id: string, field: keyof EducationItem, value: string) => {
    setEducationList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeEducationItem = (id: string) => {
    setEducationList((prev) => prev.filter((item) => item.id !== id));
  };

  // Skill Tag Helpers
  const addSkillTag = () => {
    const trimmed = newSkillInput.trim().toUpperCase();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList((prev) => [...prev, trimmed]);
      setNewSkillInput("");
    }
  };

  const removeSkillTag = (skillToRemove: string) => {
    setSkillsList((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Process Step Helpers
  const updateProcessStep = (id: string, field: keyof ProcessStep, value: string) => {
    setProcessSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  // Save All CMS Content
  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        hero: {
          greeting: heroGreeting,
          name: heroName,
          subtitle: heroSubtitle,
          description: heroDescription,
          availability: heroAvailability,
          portraitImage: heroPortraitImage,
          rotatingBadgeText: heroBadgeText,
          yearsExperience: statExp,
          projectsCompleted: statProj,
          happyClients: statClients
        },
        education: educationList,
        skills: skillsList,
        process: processSteps,
        about: {
          quote: aboutQuote,
          signature: aboutSignature,
          tagline: aboutTagline
        },
        contact: {
          headline: contactHeadline,
          description: contactDescription,
          email: contactEmail,
          website: contactWebsite,
          phone: contactPhone,
          location: contactLocation,
          workspaceImage: contactWorkspaceImage
        },
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(db, "settings", "homepage"), payload);
      alert("All Homepage CMS content saved successfully! Your front page is now updated live.");
    } catch (err: any) {
      console.error("Error saving CMS data:", err);
      alert(`Database save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "cms-hero", label: "Hero & Media", icon: Layout },
    { id: "cms-resume", label: "Resume Settings", icon: FileText },
    { id: "cms-education-skills", label: "Education & Skills", icon: GraduationCap },
    { id: "cms-process-quote", label: "Process & Quote", icon: ListOrdered },
    { id: "cms-contact", label: "Footer & Contact", icon: Mail },
    { id: "env", label: "System Config", icon: Key }
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-8">
      {/* Header */}
      <div className="border-b border-[#1a1a24] pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-condensed text-3xl font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
            <span>Website CMS &amp; Settings</span>
            <SettingsIcon className="w-5 h-5 text-rose-500" />
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
            Edit and control 100% of your website content, images, timeline, skills, and metrics live
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-neutral-500 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500 mb-2" />
          <span>Syncing CMS configuration from Firestore...</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Column: Tab switcher */}
          <div className="w-full md:w-60 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 select-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors shrink-0 text-left ${
                    activeTab === tab.id
                      ? "bg-rose-600/10 text-rose-400 border border-rose-500/20"
                      : "text-neutral-400 border border-transparent hover:text-white hover:bg-[#111118]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Content Form */}
          <div className="flex-1 w-full bg-[#0b0b0e] border border-[#1a1a24] rounded-lg p-6 sm:p-8 shadow-2xl relative">
            <form onSubmit={handleSaveCMS} className="space-y-6">
              
              {/* Tab Resume Management */}
              {activeTab === "cms-resume" && (
                <ResumeManagementSection />
              )}

              {/* Tab 1: Hero & Media */}
              {activeTab === "cms-hero" && (
                <div className="space-y-5">
                  <h2 className="text-xs uppercase font-bold tracking-wider text-rose-500 mb-4 border-b border-[#14141c] pb-2">
                    Hero Section Copywriting &amp; Media
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Cursive Greeting Text
                      </label>
                      <input
                        type="text"
                        required
                        value={heroGreeting}
                        onChange={(e) => setHeroGreeting(e.target.value)}
                        placeholder="Hello, I'm"
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Main Name Display
                      </label>
                      <input
                        type="text"
                        required
                        value={heroName}
                        onChange={(e) => setHeroName(e.target.value)}
                        placeholder="YASH BAJPAI"
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                      Headline Subtitle
                    </label>
                    <input
                      type="text"
                      required
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      placeholder="GTM ENGINEER SOFTWARE DEVELOPER & DIGITAL MARKETING"
                      className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors uppercase font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                      Hero Bio / Description Paragraph
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={heroDescription}
                      onChange={(e) => setHeroDescription(e.target.value)}
                      className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Availability Badge Text
                      </label>
                      <input
                        type="text"
                        required
                        value={heroAvailability}
                        onChange={(e) => setHeroAvailability(e.target.value)}
                        placeholder="AVAILABLE WORLDWIDE"
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Rotating Badge Text Ring
                      </label>
                      <input
                        type="text"
                        required
                        value={heroBadgeText}
                        onChange={(e) => setHeroBadgeText(e.target.value)}
                        placeholder="Turning ideas into powerful digital experiences. ✦"
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Portrait Image Upload */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                      Portrait Image Path / URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={heroPortraitImage}
                        onChange={(e) => setHeroPortraitImage(e.target.value)}
                        placeholder="/images/yash_portrait.png"
                        className="flex-1 bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                      />
                      <label className="cursor-pointer bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-3.5 py-2 rounded flex items-center justify-center transition-colors select-none min-w-[90px]">
                        {uploadingPortrait ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setHeroPortraitImage, setUploadingPortrait)}
                          disabled={uploadingPortrait}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <h3 className="text-xs uppercase font-bold tracking-wider text-rose-500 pt-4 border-b border-[#14141c] pb-2">
                    Hero Section Metrics
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Years Experience
                      </label>
                      <input
                        type="text"
                        required
                        value={statExp}
                        onChange={(e) => setStatExp(e.target.value)}
                        placeholder="3+"
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Projects Completed
                      </label>
                      <input
                        type="text"
                        required
                        value={statProj}
                        onChange={(e) => setStatProj(e.target.value)}
                        placeholder="40+"
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Happy Clients
                      </label>
                      <input
                        type="text"
                        required
                        value={statClients}
                        onChange={(e) => setStatClients(e.target.value)}
                        placeholder="20+"
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Education & Skills */}
              {activeTab === "cms-education-skills" && (
                <div className="space-y-6">
                  {/* Education Timeline Management */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#14141c] pb-2 mb-4">
                      <h2 className="text-xs uppercase font-bold tracking-wider text-rose-500 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        <span>Education Timeline</span>
                      </h2>
                      <button
                        type="button"
                        onClick={addEducationItem}
                        className="text-[10px] uppercase font-bold tracking-wider bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {educationList.map((edu, idx) => (
                        <div key={edu.id} className="p-3.5 rounded bg-[#111116] border border-[#22222d] space-y-2 relative group">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                              Entry #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeEducationItem(edu.id)}
                              className="text-neutral-500 hover:text-rose-500 p-1 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                value={edu.title}
                                onChange={(e) => updateEducationItem(edu.id, "title", e.target.value)}
                                placeholder="Degree / Certification Title"
                                className="w-full bg-[#161620] border border-[#272736] rounded px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-rose-500"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={edu.years}
                                onChange={(e) => updateEducationItem(edu.id, "years", e.target.value)}
                                placeholder="Years (e.g. 2018 - 2022)"
                                className="w-full bg-[#161620] border border-[#272736] rounded px-2.5 py-1.5 text-xs text-rose-400 font-mono focus:outline-none focus:border-rose-500"
                              />
                            </div>
                          </div>

                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducationItem(edu.id, "institution", e.target.value)}
                            placeholder="Institution / School Name"
                            className="w-full bg-[#161620] border border-[#272736] rounded px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Pill Manager */}
                  <div>
                    <h2 className="text-xs uppercase font-bold tracking-wider text-rose-500 border-b border-[#14141c] pb-2 mb-4">
                      Skills Tag Pills
                    </h2>

                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkillTag();
                          }
                        }}
                        placeholder="Add new skill (e.g. THREE.JS, NEXT.JS)..."
                        className="flex-1 bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 uppercase"
                      />
                      <button
                        type="button"
                        onClick={addSkillTag}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-4 py-2 rounded transition-colors"
                      >
                        Add Tag
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 p-4 bg-[#111116] border border-[#22222d] rounded-md">
                      {skillsList.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-200 bg-[#1a1a24] border border-[#2c2c3d] px-3 py-1 rounded-full group hover:border-rose-500/50"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkillTag(skill)}
                            className="text-neutral-500 hover:text-rose-400 transition-colors ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Process & Quote */}
              {activeTab === "cms-process-quote" && (
                <div className="space-y-6">
                  {/* Work Process steps editor */}
                  <div>
                    <h2 className="text-xs uppercase font-bold tracking-wider text-rose-500 border-b border-[#14141c] pb-2 mb-4 flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4" />
                      <span>5-Step Work Process</span>
                    </h2>

                    <div className="space-y-3">
                      {processSteps.map((step) => (
                        <div key={step.id} className="p-3.5 rounded bg-[#111116] border border-[#22222d] space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-rose-500 w-8">
                              {step.num}
                            </span>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => updateProcessStep(step.id, "title", e.target.value)}
                              placeholder="Step Title (e.g. DISCOVER)"
                              className="flex-1 bg-[#161620] border border-[#272736] rounded px-2.5 py-1.5 text-xs text-white font-bold uppercase focus:outline-none focus:border-rose-500"
                            />
                          </div>
                          <input
                            type="text"
                            value={step.desc}
                            onChange={(e) => updateProcessStep(step.id, "desc", e.target.value)}
                            placeholder="Step description..."
                            className="w-full bg-[#161620] border border-[#272736] rounded px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Crimson Quote card editor */}
                  <div>
                    <h2 className="text-xs uppercase font-bold tracking-wider text-rose-500 border-b border-[#14141c] pb-2 mb-4">
                      Crimson Quote Card Copy
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                          Signature Quote Text
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={aboutQuote}
                          onChange={(e) => setAboutQuote(e.target.value)}
                          className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors italic leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                            Cursive Signature Name
                          </label>
                          <input
                            type="text"
                            required
                            value={aboutSignature}
                            onChange={(e) => setAboutSignature(e.target.value)}
                            className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                            Card Tagline / Callout
                          </label>
                          <input
                            type="text"
                            required
                            value={aboutTagline}
                            onChange={(e) => setAboutTagline(e.target.value)}
                            placeholder="LET'S CREATE SOMETHING GREAT TOGETHER."
                            className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors uppercase font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Contact & Footer */}
              {activeTab === "cms-contact" && (
                <div className="space-y-4">
                  <h2 className="text-xs uppercase font-bold tracking-wider text-rose-500 mb-4 border-b border-[#14141c] pb-2">
                    Contact Information &amp; Footer Section
                  </h2>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                      Footer Main Headline
                    </label>
                    <input
                      type="text"
                      required
                      value={contactHeadline}
                      onChange={(e) => setContactHeadline(e.target.value)}
                      placeholder="LET'S WORK TOGETHER"
                      className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors uppercase font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                      Footer Subtitle Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={contactDescription}
                      onChange={(e) => setContactDescription(e.target.value)}
                      className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Inquiry Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Public Website URL
                      </label>
                      <input
                        type="text"
                        required
                        value={contactWebsite}
                        onChange={(e) => setContactWebsite(e.target.value)}
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Public Contact Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        Public Location Address
                      </label>
                      <input
                        type="text"
                        required
                        value={contactLocation}
                        onChange={(e) => setContactLocation(e.target.value)}
                        className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Workspace Image Upload */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                      Workspace Laptop Image Path / URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={contactWorkspaceImage}
                        onChange={(e) => setContactWorkspaceImage(e.target.value)}
                        placeholder="/images/contact_laptop.png"
                        className="flex-1 bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                      />
                      <label className="cursor-pointer bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-3.5 py-2 rounded flex items-center justify-center transition-colors select-none min-w-[90px]">
                        {uploadingWorkspace ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setContactWorkspaceImage, setUploadingWorkspace)}
                          disabled={uploadingWorkspace}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: System Configurations */}
              {activeTab === "env" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xs uppercase font-bold tracking-wider text-rose-500 mb-4 border-b border-[#14141c] pb-2">
                      System Environment Config
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4 text-xs">
                      <div className="p-4 rounded bg-[#0d0d12] border border-[#1d1d28] flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white font-mono">NEXT_PUBLIC_FIREBASE_API_KEY</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">Firebase SDK connection key</p>
                        </div>
                        {envStatus.FIREBASE_API_KEY ? (
                          <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">CONFIGURED</span>
                        ) : (
                          <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">MOCK MODE</span>
                        )}
                      </div>

                      <div className="p-4 rounded bg-[#0d0d12] border border-[#1d1d28] flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white font-mono">NEXT_PUBLIC_FIREBASE_PROJECT_ID</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">Firebase hosting container ID</p>
                        </div>
                        {envStatus.FIREBASE_PROJECT_ID ? (
                          <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">CONFIGURED</span>
                        ) : (
                          <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">MOCK MODE</span>
                        )}
                      </div>

                      <div className="p-4 rounded bg-[#0d0d12] border border-[#1d1d28] flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">Cloudinary image upload cloud identifier</p>
                        </div>
                        {envStatus.CLOUDINARY ? (
                          <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">CONFIGURED</span>
                        ) : (
                          <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">UNCONFIGURED</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-rose-500" />
                      <span>Security &amp; Deployment note</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Make sure to apply the security rules found in <code className="text-rose-400">firestore.rules</code> within your Firebase Console to prevent unauthorized read/write access. Write permissions to this `settings/homepage` document are restricted to authenticated admin accounts only.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              {activeTab !== "env" && activeTab !== "cms-resume" && (
                <div className="pt-4 border-t border-[#14141c] flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900 text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded shadow-lg shadow-rose-950/50 transition-all active:scale-[0.99]"
                  >
                    {saving ? (
                      <span>Saving Copy...</span>
                    ) : (
                      <>
                        <span>Save All CMS Content</span>
                        <Sparkles className="w-3.5 h-3.5 fill-rose-500/30" />
                      </>
                    )}
                  </button>
                </div>
              )}

            </form>
          </div>

        </div>
      )}
    </div>
  );
}
