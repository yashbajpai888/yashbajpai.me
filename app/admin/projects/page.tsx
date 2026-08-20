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
import { 
  FolderGit, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  ExternalLink, 
  Eye, 
  Loader2, 
  AlertCircle,
  Sparkles
} from "lucide-react";
import Image from "next/image";

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

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formNum, setFormNum] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || cloudName === "your_cloudinary_cloud_name" || uploadPreset === "your_cloudinary_upload_preset") {
      alert("Cloudinary environment variables are not configured in your .env.local file yet. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
      return;
    }

    setUploadingImage(true);
    console.log("Starting Cloudinary upload for file:", file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }

      const data = await res.json();
      console.log("Uploaded successfully to Cloudinary. URL:", data.secure_url);
      setFormImage(data.secure_url);
      alert("Image uploaded and path populated via Cloudinary!");
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      alert(`Cloudinary Upload failed: ${err.message || err}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "projects"), orderBy("num", "asc"));
      const querySnapshot = await getDocs(q);
      const data: Project[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          id: doc.id,
          num: docData.num || "01",
          title: docData.title || "",
          category: docData.category || "",
          image: docData.image || "",
          description: docData.description || "",
          tags: docData.tags || [],
          link: docData.link || ""
        });
      });
      setProjects(data);
    } catch (err: any) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects from database. Check security rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setFormNum(String(projects.length + 1).padStart(2, "0"));
    setFormTitle("");
    setFormCategory("");
    setFormImage("");
    setFormDescription("");
    setFormTags("");
    setFormLink("#");
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormNum(project.num);
    setFormTitle(project.title);
    setFormCategory(project.category);
    setFormImage(project.image);
    setFormDescription(project.description);
    setFormTags(project.tags.join(", "));
    setFormLink(project.link);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCategory || !formImage || !formDescription) {
      alert("Please fill in all required fields.");
      return;
    }

    setFormSubmitting(true);
    const parsedTags = formTags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const projectPayload = {
      num: formNum,
      title: formTitle.trim(),
      category: formCategory.trim(),
      image: formImage,
      description: formDescription,
      tags: parsedTags,
      link: formLink || "#",
      updatedAt: Timestamp.now()
    };

    try {
      if (editingProject) {
        // Edit flow
        const docRef = doc(db, "projects", editingProject.id);
        await updateDoc(docRef, projectPayload);
        alert("Project updated successfully!");
      } else {
        // Add flow
        await addDoc(collection(db, "projects"), {
          ...projectPayload,
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

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" permanently?`)) return;

    try {
      await deleteDoc(doc(db, "projects", id));
      alert("Project deleted successfully.");
      fetchProjects();
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      alert(`Database delete failed: ${err.message}`);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1a1a24] pb-6 gap-4">
        <div>
          <h1 className="font-condensed text-3xl font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
            <span>Portfolio Projects</span>
            <FolderGit className="w-5 h-5 text-rose-500" />
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
            Create, update, and manage your dynamic website project showcase grid
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="text-xs uppercase font-bold tracking-widest px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center gap-2 transition-all shadow-md shadow-rose-950/20 active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-600/30 p-4 rounded text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loader */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-neutral-500 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500 mb-2" />
          <span>Syncing database configuration...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-[#1a1a24] rounded-lg p-12 text-center max-w-xl mx-auto space-y-4">
          <FolderGit className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">No Projects Found</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Your Firestore database collection `projects` is currently empty. The public website is running in **Mock Fallback Mode** using hardcoded projects. Add your first project now to switch the public grid to dynamic mode!
          </p>
          <button
            onClick={openAddModal}
            className="text-xs uppercase font-bold tracking-widest px-4 py-2 border border-rose-500/30 hover:border-rose-500 rounded bg-[#0d0d12] text-rose-400 hover:text-white transition-colors"
          >
            Create First Project
          </button>
        </div>
      ) : (
        /* Projects List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col bg-[#0b0b0e] border border-[#1a1a24] rounded overflow-hidden relative shadow-md"
            >
              {/* Project Card Thumbnail */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#111116] border-b border-[#14141c]">
                {project.image.startsWith("/") || project.image.startsWith("http") ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600 font-mono">
                    No preview image loaded
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                
                <div className="absolute top-4 left-4 z-10 text-[10px] font-bold font-condensed tracking-widest bg-rose-600 px-2 py-0.5 text-white rounded">
                  PROJECT {project.num}
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-condensed text-lg font-bold tracking-wider text-white">
                    {project.title}
                  </h3>
                  <p className="text-[9px] tracking-widest text-rose-500 font-bold mb-2">
                    {project.category}
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

                  <div className="pt-4 border-t border-[#14141c] flex items-center justify-between">
                    <span className="text-[9px] text-neutral-500 font-mono font-bold truncate max-w-[140px]" title={project.link}>
                      Link: {project.link === "#" ? "None" : project.link}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-1.5 rounded border border-[#22222d] text-neutral-400 hover:text-white hover:border-rose-500 transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        className="p-1.5 rounded border border-[#22222d] text-neutral-400 hover:text-rose-500 hover:border-rose-500/50 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0e0e14] border border-[#222230] rounded-xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181822] border border-[#2a2a38] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="font-condensed text-2xl font-extrabold uppercase text-white flex items-center gap-2">
                <span>{editingProject ? "Edit Project" : "Add New Project"}</span>
                <Sparkles className="w-4 h-4 text-rose-500 fill-rose-500" />
              </h3>
              <p className="text-neutral-400 text-xs mt-1">
                Configure details below. Public site shows updates dynamically.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                    Order (e.g. 01)
                  </label>
                  <input
                    type="text"
                    required
                    value={formNum}
                    onChange={(e) => setFormNum(e.target.value)}
                    placeholder="01"
                    className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                    Project Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="VELOCE BIKES"
                    className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="E-COMMERCE WEBSITE"
                  className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                  Thumbnail Image path / URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="e.g. /images/project_veloce.png"
                    className="flex-1 bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                  <label className="cursor-pointer bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-3.5 py-2 rounded flex items-center justify-center transition-colors select-none min-w-[90px]">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Upload"
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                  Project Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe project details, technology used, outcome..."
                  className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                  Tags (comma-separated list)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Next.js, Tailwind CSS, Three.js"
                  className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                  Live Preview Link / URL (e.g. https://rx-presiq.vercel.app/)
                </label>
                <input
                  type="text"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="e.g. https://rx-presiq.vercel.app/"
                  className="w-full bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase font-bold text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900 text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded shadow-lg shadow-rose-950/50 transition-all active:scale-[0.99]"
                >
                  {formSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <span>Save Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
