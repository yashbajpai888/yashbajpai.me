"use client";

import React, { useEffect, useState } from "react";
import { 
  collection, 
  doc, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary, deleteStorageFile, deleteCloudinaryAsset } from "@/lib/upload";
import { 
  validateImageFile, 
  extractGoogleDriveFileId, 
  getGoogleDriveEmbedUrl, 
  isVideoCategory,
  isWebsiteCategory,
  isLogoCategory,
  isGraphicsCategory,
  validateAndSanitizeFirestorePayload
} from "@/lib/media";
import { 
  FolderGit, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  AlertCircle,
  Sparkles,
  Palette,
  Video,
  Film,
  Layout,
  Upload,
  Image as ImageIcon,
  Play,
  Film as FilmIcon,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

export interface Project {
  id: string;
  num: string;
  title: string;
  category: string;
  image: string;
  imagePath?: string;
  previewImageUrl?: string;
  previewImagePublicId?: string;
  previewObjectFit?: "cover" | "contain";
  previewObjectPosition?: string;
  googleDriveUrl?: string;
  googleDriveFileId?: string;
  googleDriveEmbedUrl?: string;
  videoUrl?: string;
  videoPath?: string;
  videoPreviewUrl?: string;
  videoPreviewPath?: string;
  description: string;
  tags: string[];
  link: string;
}

const SECTION_OPTIONS = [
  { id: "WEBSITE", label: "Website Design & Dev", icon: Layout, categoryTag: "WEBSITE" },
  { id: "LOGO DESIGN", label: "Logo & Brand Design", icon: Palette, categoryTag: "LOGO DESIGN" },
  { id: "GRAPHICS", label: "Graphic Design & Creatives", icon: Palette, categoryTag: "GRAPHICS" },
  { id: "AI VIDEO AD", label: "AI Video Ads", icon: Video, categoryTag: "AI VIDEO AD" },
  { id: "PRODUCT DEMO", label: "Product Demo Videos", icon: Film, categoryTag: "PRODUCT DEMO" }
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin Section Filter
  const [adminFilter, setAdminFilter] = useState("ALL");

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Base Fields
  const [formNum, setFormNum] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("WEBSITE");
  const [formDescription, setFormDescription] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formLink, setFormLink] = useState("");

  // Enhanced Media & Fit Management State
  const [formPreviewImageUrl, setFormPreviewImageUrl] = useState("");
  const [formPreviewImagePublicId, setFormPreviewImagePublicId] = useState("");
  const [formPreviewObjectFit, setFormPreviewObjectFit] = useState<"cover" | "contain">("cover");
  const [formPreviewObjectPosition, setFormPreviewObjectPosition] = useState("center center");

  const [previewImageFileName, setPreviewImageFileName] = useState("");
  const [uploadingPreviewImage, setUploadingPreviewImage] = useState(false);
  const [previewImageProgress, setPreviewImageProgress] = useState(0);
  const [previewImageProvider, setPreviewImageProvider] = useState("");

  // Confirm Dialog for Deleting Image
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);

  // Video Specific State (Only used when formCategory is Video)
  const [formGoogleDriveUrl, setFormGoogleDriveUrl] = useState("");

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [testVideoModalUrl, setTestVideoModalUrl] = useState<string | null>(null);

  // Real-time Drive calculation for Video Categories
  const isCurrentVideoType = isVideoCategory(formCategory);
  const driveFileId = isCurrentVideoType ? extractGoogleDriveFileId(formGoogleDriveUrl) : null;
  const driveEmbedUrl = driveFileId ? getGoogleDriveEmbedUrl(formGoogleDriveUrl) : null;

  // Cloudinary Preview / Asset Image Upload Handler with Public ID storage & safe cleanup
  const handleUploadAssetImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaError(null);
    const val = validateImageFile(file);
    if (!val.valid) {
      setMediaError(`Image Upload: ${val.error}`);
      e.target.value = "";
      return;
    }

    setUploadingPreviewImage(true);
    setPreviewImageProgress(0);
    setPreviewImageFileName(file.name);

    try {
      const res = await uploadToCloudinary(file, (p) => setPreviewImageProgress(p));
      
      const oldPublicId = formPreviewImagePublicId;

      setFormPreviewImageUrl(res.url);
      setFormPreviewImagePublicId(res.publicId || "");
      setPreviewImageProvider(res.provider);

      // Clean up prior remote Cloudinary asset AFTER successful upload
      if (oldPublicId && oldPublicId !== res.publicId) {
        deleteCloudinaryAsset(oldPublicId);
      }
    } catch (err: any) {
      console.error("Asset image upload failed:", err);
      setMediaError(`Image Upload Failed: ${err.message || err}`);
    } finally {
      setUploadingPreviewImage(false);
      setPreviewImageProgress(0);
      e.target.value = "";
    }
  };

  // Safe Image Delete Confirmation & Firestore Sync
  const handleConfirmDeleteImage = async () => {
    setShowDeleteImageConfirm(false);
    const targetPublicId = formPreviewImagePublicId;
    const targetUrl = formPreviewImageUrl;

    setFormPreviewImageUrl("");
    setFormPreviewImagePublicId("");
    setPreviewImageFileName("");
    setPreviewImageProvider("");

    if (targetPublicId) {
      deleteCloudinaryAsset(targetPublicId);
    } else if (targetUrl && !targetUrl.startsWith("http")) {
      deleteStorageFile(targetUrl);
    }

    if (editingProject) {
      try {
        const docRef = doc(db, "projects", editingProject.id);
        await updateDoc(docRef, {
          image: "",
          previewImageUrl: "",
          previewImagePublicId: "",
          videoPreviewUrl: "",
          updatedAt: Timestamp.now(),
        });
      } catch (err) {
        console.warn("Failed to clear image doc in Firestore:", err);
      }
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "projects"), orderBy("num", "asc"));
      const querySnapshot = await getDocs(q);
      const data: Project[] = [];
      querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        data.push({
          id: docSnap.id,
          num: d.num || "01",
          title: d.title || "",
          category: d.category || "",
          image: d.image || d.previewImageUrl || d.videoPreviewUrl || "",
          imagePath: d.imagePath || "",
          previewImageUrl: d.previewImageUrl || d.image || d.videoPreviewUrl || "",
          previewImagePublicId: d.previewImagePublicId || "",
          previewObjectFit: d.previewObjectFit || "cover",
          previewObjectPosition: d.previewObjectPosition || "center center",
          googleDriveUrl: d.googleDriveUrl || "",
          googleDriveFileId: d.googleDriveFileId || "",
          googleDriveEmbedUrl: d.googleDriveEmbedUrl || "",
          videoUrl: d.videoUrl || "",
          videoPath: d.videoPath || "",
          videoPreviewUrl: d.videoPreviewUrl || "",
          videoPreviewPath: d.videoPreviewPath || "",
          description: d.description || "",
          tags: d.tags || [],
          link: d.link || ""
        });
      });
      setProjects(data);
    } catch (err: any) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddModal = (presetCategory?: string) => {
    setEditingProject(null);
    setMediaError(null);
    setFormNum(String(projects.length + 1).padStart(2, "0"));
    setFormTitle("");
    setFormCategory(presetCategory || (adminFilter !== "ALL" ? adminFilter : "WEBSITE"));
    setFormPreviewImageUrl("");
    setFormPreviewImagePublicId("");
    setFormPreviewObjectFit("cover");
    setFormPreviewObjectPosition("center center");
    setPreviewImageFileName("");
    setPreviewImageProvider("");
    setFormGoogleDriveUrl("");
    setFormDescription("");
    setFormTags("");
    setFormLink("");
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setMediaError(null);
    setFormNum(project.num);
    setFormTitle(project.title);
    setFormCategory(project.category);

    const rawImage = project.previewImageUrl || project.videoPreviewUrl || project.image || "";
    // Detect if existing document contains legacy oversized base64 data and filter it out safely
    let sanitizedImage = rawImage;
    if (rawImage.startsWith("data:") && (rawImage.includes(";base64,") || rawImage.length > 500)) {
      sanitizedImage = "";
      setMediaError("Notice: Previous preview was stored as legacy base64 data. Please upload a new image to store it in cloud storage.");
    }

    setFormPreviewImageUrl(sanitizedImage);
    setFormPreviewImagePublicId(project.previewImagePublicId || "");
    setFormPreviewObjectFit(project.previewObjectFit || "cover");
    setFormPreviewObjectPosition(project.previewObjectPosition || "center center");
    setPreviewImageFileName(sanitizedImage ? "Asset Loaded" : "");
    setPreviewImageProvider(sanitizedImage.includes("cloudinary") ? "cloudinary" : sanitizedImage ? "storage" : "");

    const existingDriveUrl = project.googleDriveUrl || (project.videoUrl && project.videoUrl.includes("drive.google.com") ? project.videoUrl : "");
    setFormGoogleDriveUrl(existingDriveUrl);

    setFormDescription(project.description);
    setFormTags(project.tags.join(", "));
    setFormLink(project.link);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCategory || !formDescription) {
      alert("Please fill in all required fields (Title, Category, Description).");
      return;
    }

    const isVideoType = isVideoCategory(formCategory);

    // Google Drive Link Validation ONLY for Video Projects
    if (isVideoType && formGoogleDriveUrl.trim() !== "") {
      const fileId = extractGoogleDriveFileId(formGoogleDriveUrl);
      if (!fileId) {
        setMediaError("Please enter a valid Google Drive video link.");
        return;
      }
    }

    if (uploadingPreviewImage) {
      alert("Please wait for image upload to complete before saving.");
      return;
    }

    // Ensure no raw base64 data URL is submitted
    if (formPreviewImageUrl && formPreviewImageUrl.startsWith("data:")) {
      alert("Image is in raw base64 format which exceeds Firestore limits. Please click Upload to store the image in cloud storage.");
      return;
    }

    setFormSubmitting(true);

    const parsedTags = formTags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const extractedFileId = isVideoType ? (extractGoogleDriveFileId(formGoogleDriveUrl) || "") : "";
    const calculatedEmbedUrl = extractedFileId ? `https://drive.google.com/file/d/${extractedFileId}/preview` : "";

    // Sanitize image url: ensure no base64 string is ever passed
    const cleanImageUrl = formPreviewImageUrl && !formPreviewImageUrl.startsWith("data:") ? formPreviewImageUrl.trim() : "";

    // Explicit, lightweight Firestore metadata payload
    const projectPayload = {
      num: formNum.trim() || "01",
      title: formTitle.trim(),
      category: formCategory.trim(),
      image: cleanImageUrl,
      imagePath: formPreviewImagePublicId || "",
      previewImageUrl: cleanImageUrl,
      previewImagePublicId: formPreviewImagePublicId || "",
      previewObjectFit: formPreviewObjectFit || "cover",
      previewObjectPosition: formPreviewObjectPosition || "center center",
      googleDriveUrl: isVideoType ? formGoogleDriveUrl.trim() : "",
      googleDriveFileId: extractedFileId,
      googleDriveEmbedUrl: calculatedEmbedUrl,
      videoUrl: isVideoType ? (calculatedEmbedUrl || (editingProject?.videoUrl && !editingProject.videoUrl.startsWith("data:") ? editingProject.videoUrl : "")) : "",
      videoPath: editingProject?.videoPath || "",
      videoPreviewUrl: isVideoType ? cleanImageUrl : "",
      videoPreviewPath: isVideoType ? (formPreviewImagePublicId || "") : "",
      description: formDescription.trim(),
      tags: parsedTags,
      link: formLink.trim() || "#",
      updatedAt: Timestamp.now()
    };

    // Pre-flight validation: verifies zero base64 data and payload size is safely under 50KB
    const validation = validateAndSanitizeFirestorePayload(projectPayload);
    if (!validation.valid) {
      alert(`Cannot save project: ${validation.error}`);
      setMediaError(validation.error || "Invalid payload size");
      setFormSubmitting(false);
      return;
    }

    try {
      if (editingProject) {
        const docRef = doc(db, "projects", editingProject.id);
        await updateDoc(docRef, validation.sanitized);
        alert("Project updated successfully!");
      } else {
        await addDoc(collection(db, "projects"), {
          ...validation.sanitized,
          createdAt: Timestamp.now()
        });
        alert("Project added successfully!");
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      console.error("Failed to save project:", err);
      alert(`Database write failed: ${err.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.title}" permanently?`)) return;

    try {
      await deleteDoc(doc(db, "projects", project.id));
      if (project.previewImagePublicId) deleteCloudinaryAsset(project.previewImagePublicId);
      if (project.imagePath) deleteStorageFile(project.imagePath);
      if (project.videoPath) deleteStorageFile(project.videoPath);
      if (project.videoPreviewPath) deleteStorageFile(project.videoPreviewPath);

      alert("Project deleted successfully.");
      fetchProjects();
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      alert(`Database delete failed: ${err.message}`);
    }
  };

  const matchCategory = (catStr: string, filterKey: string) => {
    const cat = (catStr || "").toUpperCase().trim();
    const key = filterKey.toUpperCase().trim();

    if (key === "ALL") return true;

    const isLogo = cat.includes("LOGO") || cat.includes("BRAND") || cat.includes("IDENTITY");
    const isGraphics = cat.includes("GRAPHIC") || cat.includes("CREATIVE") || cat.includes("POSTER") || cat.includes("BANNER");
    const isAiAd = cat.includes("AI") || cat.includes("AD") || cat.includes("REELS") || cat.includes("TIKTOK");
    const isDemo = cat.includes("PRODUCT") || cat.includes("DEMO") || cat.includes("EXPLAINER") || cat.includes("WALKTHROUGH");

    if (key === "WEBSITE" || key === "WEBSITES") {
      if (cat.includes("WEB") || cat.includes("SITE") || cat.includes("APP") || cat.includes("DEV") || cat.includes("STORE") || cat === "WEBSITE" || cat === "") return true;
      return !isLogo && !isGraphics && !isAiAd && !isDemo;
    }
    if (key === "LOGO DESIGN" || key === "LOGO") return isLogo;
    if (key === "GRAPHICS" || key === "GRAPHIC DESIGN") return isGraphics;
    if (key === "AI VIDEO AD" || key === "AI VIDEO ADS" || key === "AI VIDEO") return isAiAd;
    if (key === "PRODUCT DEMO" || key === "PRODUCT DEMOS") return isDemo;

    return cat.includes(key);
  };

  const filteredProjects = projects.filter((p) => matchCategory(p.category, adminFilter));
  const getSectionCount = (filterKey: string) => projects.filter((p) => matchCategory(p.category, filterKey)).length;

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1a1a24] pb-6 gap-4">
        <div>
          <h1 className="font-condensed text-3xl font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
            <span>Portfolio Projects</span>
            <FolderGit className="w-5 h-5 text-rose-500" />
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
            Service-Specific Media Workflows &amp; 16:9 Image Fit/Position Management
          </p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="text-xs uppercase font-bold tracking-widest px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center gap-2 transition-all shadow-md shadow-rose-950/20 active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Project</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-600/30 p-4 rounded text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {SECTION_OPTIONS.map((sec) => {
          const Icon = sec.icon;
          const count = getSectionCount(sec.id);
          const isSelected = adminFilter === sec.id;
          return (
            <div
              key={sec.id}
              onClick={() => setAdminFilter(isSelected ? "ALL" : sec.id)}
              className={`cursor-pointer p-4 rounded-lg border transition-all ${
                isSelected 
                  ? "bg-[#141420] border-rose-500 shadow-lg shadow-rose-950/30" 
                  : "bg-[#0b0b0e] border-[#1a1a24] hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-md bg-[#12121c] border border-[#222232] flex items-center justify-center text-rose-500">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-lg font-extrabold text-white font-condensed">
                  {count}
                </span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1 truncate">
                {sec.label}
              </h3>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] uppercase font-semibold text-rose-400">
                  {isSelected ? "● Filter Active" : "Click to Filter"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddModal(sec.categoryTag);
                  }}
                  className="text-[10px] uppercase font-bold text-neutral-300 hover:text-white bg-[#1a1a26] hover:bg-rose-600 px-2 py-1 rounded transition-colors"
                >
                  + Upload
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Filter Tabs Bar */}
      <div className="flex items-center justify-between border-b border-[#1a1a24] pb-3 gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mr-2 shrink-0">
            SHOW SECTION:
          </span>
          {["ALL", "WEBSITE", "LOGO DESIGN", "GRAPHICS", "AI VIDEO AD", "PRODUCT DEMO"].map((filter) => (
            <button
              key={filter}
              onClick={() => setAdminFilter(filter)}
              className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded transition-all whitespace-nowrap border ${
                adminFilter === filter
                  ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40"
                  : "bg-[#0b0b0e] text-neutral-400 border-[#1a1a24] hover:text-white hover:border-neutral-700"
              }`}
            >
              {filter === "ALL" ? "ALL SECTIONS" : filter} ({getSectionCount(filter)})
            </button>
          ))}
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-neutral-500 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500 mb-2" />
          <span>Syncing project database...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="border border-dashed border-[#1a1a24] rounded-lg p-12 text-center max-w-xl mx-auto space-y-4">
          <FolderGit className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">
            No Projects in {adminFilter === "ALL" ? "Database" : adminFilter}
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            There are no project entries categorized under <span className="text-rose-500">{adminFilter}</span> yet.
          </p>
          <button
            onClick={() => openAddModal(adminFilter !== "ALL" ? adminFilter : "WEBSITE")}
            className="text-xs uppercase font-bold tracking-widest px-4 py-2 border border-rose-500/30 hover:border-rose-500 rounded bg-[#0d0d12] text-rose-400 hover:text-white transition-colors"
          >
            Upload To {adminFilter === "ALL" ? "Websites" : adminFilter}
          </button>
        </div>
      ) : (
        /* Projects List Grid with Consistent 16:9 Aspect Ratio */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const previewImage = project.previewImageUrl || project.videoPreviewUrl || project.image;
            const isVideo = isVideoCategory(project.category);
            const hasVideo = isVideo && !!(project.googleDriveUrl || project.googleDriveEmbedUrl || project.videoUrl);
            const objectFit = project.previewObjectFit || "cover";
            const objectPosition = project.previewObjectPosition || "center center";

            return (
              <div
                key={project.id}
                className="group flex flex-col bg-[#0b0b0e] border border-[#1a1a24] rounded overflow-hidden relative shadow-md hover:border-rose-600/40 transition-colors"
              >
                {/* Project Card Preview Image Container (Fixed 16:9 Aspect Ratio) */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#0a0a0f] border-b border-[#14141c]">
                  {previewImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewImage}
                      alt={project.title}
                      style={{
                        objectFit: objectFit as any,
                        objectPosition: objectPosition,
                      }}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600 font-mono">
                      No image loaded
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                  
                  <div className="absolute top-3 left-3 z-10 text-[9px] font-bold font-condensed tracking-widest bg-rose-600 px-2 py-0.5 text-white rounded">
                    PROJ {project.num}
                  </div>

                  {hasVideo && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/80 border border-white/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-rose-400">
                      <Play className="w-3 h-3 fill-rose-400" />
                      <span>Google Drive Video</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-condensed text-lg font-bold tracking-wider text-white">
                      {project.title}
                    </h3>
                    <p className="text-[9px] tracking-widest text-rose-500 font-bold uppercase mb-2">
                      SECTION: {project.category}
                    </p>
                    <p className="text-xs text-neutral-400 leading-relaxed font-light line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-semibold text-neutral-300 bg-[#14141c] border border-[#22222d] px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#14141c] flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-1.5 rounded border border-[#22222d] text-neutral-400 hover:text-white hover:border-rose-500 transition-colors flex items-center gap-1 text-xs font-bold px-3 py-1"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="p-1.5 rounded border border-[#22222d] text-neutral-400 hover:text-rose-500 hover:border-rose-500/50 transition-colors flex items-center gap-1 text-xs font-bold px-3 py-1"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Service-Conditional Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0e0e14] border border-[#222230] rounded-xl p-5 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-[#181822] border border-[#2a2a38] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="font-condensed text-xl sm:text-2xl font-extrabold uppercase text-white flex items-center gap-2">
                <span>{editingProject ? "Edit Project Details" : "Upload New Project"}</span>
                <Sparkles className="w-4 h-4 text-rose-500 fill-rose-500" />
              </h3>
              <p className="text-neutral-400 text-xs mt-1">
                Configure project metadata, service-specific media &amp; 16:9 aspect ratio presentation.
              </p>
            </div>

            {mediaError && (
              <div className="mb-4 p-3 rounded bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{mediaError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* TARGET SECTION / SERVICE DROPDOWN */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-rose-400 mb-1.5">
                  TARGET SECTION / SERVICE
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    setFormCategory(e.target.value);
                    if (mediaError) setMediaError(null);
                  }}
                  className="w-full bg-[#14141c] border border-rose-900/60 rounded px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors font-semibold"
                >
                  <option value="WEBSITE">💻 WEBSITE (Website Design &amp; Dev)</option>
                  <option value="LOGO DESIGN">🎨 LOGO DESIGN (Logo &amp; Brand Design)</option>
                  <option value="GRAPHICS">🖼️ GRAPHICS (Graphic Design &amp; Creatives)</option>
                  <option value="AI VIDEO AD">🎬 AI VIDEO AD (AI Video Commercials)</option>
                  <option value="PRODUCT DEMO">📹 PRODUCT DEMO (Product Walkthroughs &amp; Demos)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                    Order Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formNum}
                    onChange={(e) => setFormNum(e.target.value)}
                    placeholder="01"
                    className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                    Project Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. VELOCE BIKES / AI COMMERCIAL DEMO"
                    className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 font-semibold"
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* SERVICE-SPECIFIC MEDIA WORKFLOW + 16:9 FIT/POSITION CONTROLS*/}
              {/* ========================================================= */}

              {/* 1. AI VIDEO AD & PRODUCT DEMO (VIDEO PROJECTS) */}
              {isVideoCategory(formCategory) && (
                <div className="p-4 bg-[#121218] border border-[#222232] rounded-lg space-y-5">
                  <div className="flex items-center justify-between border-b border-[#1c1c28] pb-2.5">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-rose-500 flex items-center gap-2">
                      <FilmIcon className="w-4 h-4" />
                      <span>VIDEO PROJECT MEDIA</span>
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-medium">Cloudinary Poster + Google Drive</span>
                  </div>

                  {/* VIDEO PREVIEW / POSTER */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                        <span>1. VIDEO PREVIEW / POSTER</span>
                      </label>
                      {formPreviewImageUrl && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteImageConfirm(true)}
                          className="text-[9px] uppercase font-bold text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Image</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-neutral-400 leading-normal">
                      Upload the image that will appear as the project/video card preview. The image will be stored on Cloudinary.
                    </p>

                    {formPreviewImageUrl ? (
                      <div className="space-y-3 bg-[#14141e] border border-[#26263a] rounded-lg p-3">
                        {/* 16:9 Aspect Ratio Live Admin Preview Container */}
                        <div className="relative w-full aspect-[16/9] bg-[#08080d] border border-[#202030] rounded overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formPreviewImageUrl}
                            alt="Admin Live Preview"
                            style={{
                              objectFit: formPreviewObjectFit,
                              objectPosition: formPreviewObjectPosition,
                            }}
                            className="w-full h-full"
                          />
                          <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-0.5 rounded text-[8px] font-bold text-rose-400 uppercase tracking-widest border border-white/10">
                            16:9 Website Card Preview
                          </div>
                        </div>

                        {/* Image Fit & Position Adjustment Controls */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Image Fit Mode
                            </label>
                            <select
                              value={formPreviewObjectFit}
                              onChange={(e) => setFormPreviewObjectFit(e.target.value as "cover" | "contain")}
                              className="w-full bg-[#181824] border border-[#2a2a3c] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                            >
                              <option value="cover">Cover (Fill 16:9 frame)</option>
                              <option value="contain">Contain (Show full image)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Focal Position
                            </label>
                            <select
                              value={formPreviewObjectPosition}
                              onChange={(e) => setFormPreviewObjectPosition(e.target.value)}
                              className="w-full bg-[#181824] border border-[#2a2a3c] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                            >
                              <option value="center center">Center (Default)</option>
                              <option value="center top">Top Center</option>
                              <option value="center bottom">Bottom Center</option>
                              <option value="left center">Left Center</option>
                              <option value="right center">Right Center</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#1e1e2c]">
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Cloudinary Poster Loaded</span>
                          </span>

                          <label className="cursor-pointer bg-[#20202e] hover:bg-[#2a2a3e] border border-[#34344a] text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors select-none">
                            {uploadingPreviewImage ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                                <span>Uploading... {previewImageProgress}%</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 text-rose-400" />
                                <span>Replace Image</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadAssetImage}
                              disabled={uploadingPreviewImage}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-[#28283a] hover:border-rose-500/60 bg-[#14141e] hover:bg-[#181824] p-4 rounded-md flex flex-col items-center justify-center text-center transition-all group">
                        {uploadingPreviewImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                            <span className="text-xs font-bold text-white">Uploading to Cloudinary... {previewImageProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-9 h-9 rounded-full bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2 group-hover:scale-110 transition-transform">
                              <Upload className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Upload Preview Image</span>
                            <span className="text-[10px] text-neutral-500 mt-1">JPG, PNG, WebP or SVG up to 10MB</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadAssetImage}
                          disabled={uploadingPreviewImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* GOOGLE DRIVE VIDEO LINK */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-rose-400" />
                        <span>2. GOOGLE DRIVE VIDEO LINK</span>
                      </label>
                      {driveEmbedUrl && (
                        <button
                          type="button"
                          onClick={() => setTestVideoModalUrl(driveEmbedUrl)}
                          className="text-[9px] uppercase font-bold text-rose-400 hover:text-white flex items-center gap-1 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded transition-colors"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Preview Video</span>
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={formGoogleDriveUrl}
                        onChange={(e) => {
                          setFormGoogleDriveUrl(e.target.value);
                          if (mediaError && mediaError.includes("Google Drive")) setMediaError(null);
                        }}
                        placeholder="https://drive.google.com/file/d/VIDEO_ID/view"
                        className={`w-full bg-[#161622] border rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none transition-colors font-mono ${
                          formGoogleDriveUrl.trim() !== "" && !driveFileId
                            ? "border-rose-600 focus:border-rose-500"
                            : formGoogleDriveUrl.trim() !== "" && driveFileId
                            ? "border-emerald-600/60 focus:border-emerald-500"
                            : "border-[#28283a] focus:border-rose-500"
                        }`}
                      />
                    </div>

                    <p className="text-[10px] text-neutral-400 leading-normal">
                      Paste a shareable Google Drive video link. The video will remain hosted on Google Drive and will be displayed on the website using an embedded player.
                    </p>

                    <div className="p-2.5 rounded bg-[#101017] border border-[#20202d] text-[10px] space-y-1.5">
                      <p className="text-amber-400/90 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Make sure the Google Drive file is shared so that website visitors can view it.</span>
                      </p>

                      {formGoogleDriveUrl.trim() !== "" && (
                        <div className="pt-1.5 border-t border-[#1c1c28]">
                          {driveFileId ? (
                            <div className="text-emerald-400 flex flex-col gap-0.5">
                              <span className="font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Video Link Ready</span>
                              </span>
                              <span className="font-mono text-[9px] text-neutral-400">
                                File ID: {driveFileId}
                              </span>
                            </div>
                          ) : (
                            <p className="text-rose-400 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Please enter a valid Google Drive video link.</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. WEBSITE PROJECT MEDIA */}
              {isWebsiteCategory(formCategory) && (
                <div className="p-4 bg-[#121218] border border-[#222232] rounded-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1c1c28] pb-2.5">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-rose-500 flex items-center gap-2">
                      <Layout className="w-4 h-4" />
                      <span>WEBSITE PROJECT MEDIA</span>
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-medium">Cloudinary Screenshot</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                        <span>WEBSITE PREVIEW / SCREENSHOT IMAGE</span>
                      </label>
                      {formPreviewImageUrl && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteImageConfirm(true)}
                          className="text-[9px] uppercase font-bold text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Image</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-neutral-400 leading-normal">
                      Upload the primary website screenshot or UI preview image (stored on Cloudinary).
                    </p>

                    {formPreviewImageUrl ? (
                      <div className="space-y-3 bg-[#14141e] border border-[#26263a] rounded-lg p-3">
                        <div className="relative w-full aspect-[16/9] bg-[#08080d] border border-[#202030] rounded overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formPreviewImageUrl}
                            alt="Website Screenshot"
                            style={{
                              objectFit: formPreviewObjectFit,
                              objectPosition: formPreviewObjectPosition,
                            }}
                            className="w-full h-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Image Fit Mode
                            </label>
                            <select
                              value={formPreviewObjectFit}
                              onChange={(e) => setFormPreviewObjectFit(e.target.value as "cover" | "contain")}
                              className="w-full bg-[#181824] border border-[#2a2a3c] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                            >
                              <option value="cover">Cover (Fill 16:9 frame)</option>
                              <option value="contain">Contain (Show full screenshot)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Focal Position
                            </label>
                            <select
                              value={formPreviewObjectPosition}
                              onChange={(e) => setFormPreviewObjectPosition(e.target.value)}
                              className="w-full bg-[#181824] border border-[#2a2a3c] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                            >
                              <option value="center center">Center (Default)</option>
                              <option value="center top">Top Center</option>
                              <option value="center bottom">Bottom Center</option>
                              <option value="left center">Left Center</option>
                              <option value="right center">Right Center</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#1e1e2c]">
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Screenshot Loaded</span>
                          </span>

                          <label className="cursor-pointer bg-[#20202e] hover:bg-[#2a2a3e] border border-[#34344a] text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors select-none">
                            {uploadingPreviewImage ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                                <span>Uploading... {previewImageProgress}%</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 text-rose-400" />
                                <span>Replace Screenshot</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadAssetImage}
                              disabled={uploadingPreviewImage}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-[#28283a] hover:border-rose-500/60 bg-[#14141e] hover:bg-[#181824] p-4 rounded-md flex flex-col items-center justify-center text-center transition-all group">
                        {uploadingPreviewImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                            <span className="text-xs font-bold text-white">Uploading to Cloudinary... {previewImageProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-9 h-9 rounded-full bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2 group-hover:scale-110 transition-transform">
                              <Upload className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Upload Website Screenshot</span>
                            <span className="text-[10px] text-neutral-500 mt-1">JPG, PNG, WebP or SVG up to 10MB</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadAssetImage}
                          disabled={uploadingPreviewImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* 3. LOGO DESIGN PROJECT MEDIA */}
              {isLogoCategory(formCategory) && (
                <div className="p-4 bg-[#121218] border border-[#222232] rounded-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1c1c28] pb-2.5">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-rose-500 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <span>LOGO &amp; BRAND MEDIA</span>
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-medium">Cloudinary Image Asset</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                        <span>LOGO / BRAND ASSET IMAGE</span>
                      </label>
                      {formPreviewImageUrl && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteImageConfirm(true)}
                          className="text-[9px] uppercase font-bold text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Asset</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-neutral-400 leading-normal">
                      Upload high-resolution logo artwork or brand identity asset (stored on Cloudinary).
                    </p>

                    {formPreviewImageUrl ? (
                      <div className="space-y-3 bg-[#14141e] border border-[#26263a] rounded-lg p-3">
                        <div className="relative w-full aspect-[16/9] bg-[#08080d] border border-[#202030] rounded overflow-hidden flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formPreviewImageUrl}
                            alt="Logo Asset"
                            style={{
                              objectFit: formPreviewObjectFit,
                              objectPosition: formPreviewObjectPosition,
                            }}
                            className="w-full h-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Image Fit Mode
                            </label>
                            <select
                              value={formPreviewObjectFit}
                              onChange={(e) => setFormPreviewObjectFit(e.target.value as "cover" | "contain")}
                              className="w-full bg-[#181824] border border-[#2a2a3c] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                            >
                              <option value="contain">Contain (Full logo visible)</option>
                              <option value="cover">Cover (Fill 16:9 frame)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Focal Position
                            </label>
                            <select
                              value={formPreviewObjectPosition}
                              onChange={(e) => setFormPreviewObjectPosition(e.target.value)}
                              className="w-full bg-[#181824] border border-[#2a2a3c] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                            >
                              <option value="center center">Center (Default)</option>
                              <option value="center top">Top Center</option>
                              <option value="center bottom">Bottom Center</option>
                              <option value="left center">Left Center</option>
                              <option value="right center">Right Center</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#1e1e2c]">
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Logo Asset Uploaded</span>
                          </span>

                          <label className="cursor-pointer bg-[#20202e] hover:bg-[#2a2a3e] border border-[#34344a] text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors select-none">
                            {uploadingPreviewImage ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                                <span>Uploading... {previewImageProgress}%</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 text-rose-400" />
                                <span>Replace Asset</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadAssetImage}
                              disabled={uploadingPreviewImage}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-[#28283a] hover:border-rose-500/60 bg-[#14141e] hover:bg-[#181824] p-4 rounded-md flex flex-col items-center justify-center text-center transition-all group">
                        {uploadingPreviewImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                            <span className="text-xs font-bold text-white">Uploading Logo to Cloudinary... {previewImageProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-9 h-9 rounded-full bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2 group-hover:scale-110 transition-transform">
                              <Upload className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Upload Logo Asset</span>
                            <span className="text-[10px] text-neutral-500 mt-1">PNG, SVG, WebP or JPG up to 10MB</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadAssetImage}
                          disabled={uploadingPreviewImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* 4. GRAPHICS DESIGN PROJECT MEDIA */}
              {isGraphicsCategory(formCategory) && !isLogoCategory(formCategory) && !isVideoCategory(formCategory) && !isWebsiteCategory(formCategory) && (
                <div className="p-4 bg-[#121218] border border-[#222232] rounded-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1c1c28] pb-2.5">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-rose-500 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <span>GRAPHIC DESIGN MEDIA</span>
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-medium">Cloudinary Graphic Asset</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                        <span>GRAPHIC CREATIVE IMAGE</span>
                      </label>
                      {formPreviewImageUrl && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteImageConfirm(true)}
                          className="text-[9px] uppercase font-bold text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Asset</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-neutral-400 leading-normal">
                      Upload graphic design artwork, poster, or banner image (stored on Cloudinary).
                    </p>

                    {formPreviewImageUrl ? (
                      <div className="space-y-3 bg-[#14141e] border border-[#26263a] rounded-lg p-3">
                        <div className="relative w-full aspect-[16/9] bg-[#08080d] border border-[#202030] rounded overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formPreviewImageUrl}
                            alt="Graphic Creative"
                            style={{
                              objectFit: formPreviewObjectFit,
                              objectPosition: formPreviewObjectPosition,
                            }}
                            className="w-full h-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Image Fit Mode
                            </label>
                            <select
                              value={formPreviewObjectFit}
                              onChange={(e) => setFormPreviewObjectFit(e.target.value as "cover" | "contain")}
                              className="w-full bg-[#181824] border border-[#2a2a3c] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                            >
                              <option value="cover">Cover (Fill 16:9 frame)</option>
                              <option value="contain">Contain (Show full artwork)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Focal Position
                            </label>
                            <select
                              value={formPreviewObjectPosition}
                              onChange={(e) => setFormPreviewObjectPosition(e.target.value)}
                              className="w-full bg-[#181824] border border-[#2a2a3c] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                            >
                              <option value="center center">Center (Default)</option>
                              <option value="center top">Top Center</option>
                              <option value="center bottom">Bottom Center</option>
                              <option value="left center">Left Center</option>
                              <option value="right center">Right Center</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#1e1e2c]">
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Graphic Asset Uploaded</span>
                          </span>

                          <label className="cursor-pointer bg-[#20202e] hover:bg-[#2a2a3e] border border-[#34344a] text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors select-none">
                            {uploadingPreviewImage ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                                <span>Uploading... {previewImageProgress}%</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 text-rose-400" />
                                <span>Replace Image</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadAssetImage}
                              disabled={uploadingPreviewImage}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-[#28283a] hover:border-rose-500/60 bg-[#14141e] hover:bg-[#181824] p-4 rounded-md flex flex-col items-center justify-center text-center transition-all group">
                        {uploadingPreviewImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                            <span className="text-xs font-bold text-white">Uploading Graphic to Cloudinary... {previewImageProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-9 h-9 rounded-full bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2 group-hover:scale-110 transition-transform">
                              <Upload className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Upload Graphic Artwork</span>
                            <span className="text-[10px] text-neutral-500 mt-1">JPG, PNG, WebP or SVG up to 10MB</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadAssetImage}
                          disabled={uploadingPreviewImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                  Project Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe project details, strategy, tools & outcome..."
                  className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Next.js, AI Commercial, Figma, 3D Render"
                  className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                  External Live Link / Project URL
                </label>
                <input
                  type="text"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-[#1c1c28] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase font-bold text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || uploadingPreviewImage}
                  className="flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded shadow-lg shadow-rose-950/50 transition-all active:scale-[0.99]"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Image */}
      {showDeleteImageConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowDeleteImageConfirm(false)}
        >
          <div 
            className="bg-[#12121c] border border-[#28283a] rounded-lg p-6 max-w-sm w-full space-y-4 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Delete Preview Image?</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              This will remove the image from the project and delete the associated Cloudinary asset safely.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteImageConfirm(false)}
                className="px-4 py-2 text-xs font-bold uppercase text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteImage}
                className="px-4 py-2 text-xs font-bold uppercase bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Quick Video Embed Test Modal */}
      {testVideoModalUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setTestVideoModalUrl(null)}
        >
          <div 
            className="relative w-full max-w-3xl bg-[#0b0b10] border border-[#222234] rounded-xl overflow-hidden shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1c1c2a]">
              <span className="text-xs uppercase font-bold text-white flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Google Drive Embedded Video Preview</span>
              </span>
              <button
                onClick={() => setTestVideoModalUrl(null)}
                className="w-7 h-7 rounded-full bg-[#181822] text-neutral-400 hover:text-white hover:bg-rose-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full aspect-video bg-black rounded overflow-hidden">
              <iframe
                src={testVideoModalUrl}
                allow="autoplay"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
