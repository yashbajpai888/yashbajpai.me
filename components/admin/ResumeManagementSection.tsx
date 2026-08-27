"use client";

import React, { useEffect, useState } from "react";
import { 
  FileText, 
  Upload, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Tag,
  Calendar,
  File
} from "lucide-react";
import { 
  getResumeConfig, 
  uploadResumeFile, 
  deleteResumeConfig, 
  updateResumeLabel, 
  validateResumeFile,
  ResumeConfig 
} from "@/lib/resume";

export default function ResumeManagementSection() {
  const [resumeConfig, setResumeConfig] = useState<ResumeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [savingLabel, setSavingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState("My Resume");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadResumeData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const config = await getResumeConfig();
      if (config) {
        setResumeConfig(config);
        setLabelInput(config.label || "My Resume");
      } else {
        setResumeConfig(null);
        setLabelInput("My Resume");
      }
    } catch (err: any) {
      console.error("Failed to fetch resume configuration:", err);
      setErrorMsg("Failed to load resume settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumeData();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate file type & size upfront
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Invalid file.");
      // Reset input value so user can re-trigger onChange if needed
      e.target.value = "";
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const newConfig = await uploadResumeFile(file, {
        label: labelInput,
        onProgress: (p) => setUploadProgress(Math.round(p)),
      });
      setResumeConfig(newConfig);
      setLabelInput(newConfig.label);
      setSuccessMsg("Resume uploaded and published live successfully!");
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setErrorMsg(err.message || "Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the active resume? This will remove the file from Storage and hide the 'MY RESUME' button on the live site.")) {
      return;
    }

    setDeleting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await deleteResumeConfig();
      setResumeConfig(null);
      setLabelInput("My Resume");
      setSuccessMsg("Resume deleted successfully. The button is now hidden on the live website.");
    } catch (err: any) {
      console.error("Resume delete error:", err);
      setErrorMsg(err.message || "Failed to delete resume file.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeConfig) return;

    const trimmedLabel = labelInput.trim() || "My Resume";

    setSavingLabel(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await updateResumeLabel(trimmedLabel);
      setResumeConfig((prev) => (prev ? { ...prev, label: trimmedLabel } : null));
      setSuccessMsg("Resume button label updated successfully!");
    } catch (err: any) {
      console.error("Label update error:", err);
      setErrorMsg(err.message || "Failed to update button label.");
    } finally {
      setSavingLabel(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      let date: Date;
      if (typeof timestamp.toDate === "function") {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-neutral-400 text-xs">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500 mb-2" />
        <span>Loading Resume Configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#14141c] pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xs uppercase font-bold tracking-wider text-rose-500 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Dynamic Resume Configuration</span>
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Manage your PDF resume, view details, replace or delete files, and customize your CTA button label.
          </p>
        </div>
      </div>

      {/* Error & Success Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded bg-rose-950/40 border border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded bg-emerald-950/40 border border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">{successMsg}</div>
        </div>
      )}

      {/* Main Resume Card */}
      {resumeConfig ? (
        <div className="bg-[#111116] border border-[#22222d] rounded-lg p-5 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1a1a24] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <File className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-wide">
                  {resumeConfig.name}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    Updated: {formatDate(resumeConfig.updatedAt)}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active on Website
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Preview, Replace, Delete */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={resumeConfig.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider bg-[#1a1a24] hover:bg-[#252533] text-neutral-200 border border-[#2e2e3f] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Preview</span>
              </a>

              <label className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors select-none">
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf,.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={handleFileSelect}
                  disabled={uploading || deleting}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || uploading}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Button Label Form */}
          <form onSubmit={handleSaveLabel} className="space-y-3">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              <span>CTA Button Display Label</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="My Resume"
                className="flex-1 bg-[#14141c] border border-[#242432] rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors font-semibold"
              />
              <button
                type="submit"
                disabled={savingLabel || labelInput.trim() === resumeConfig.label}
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold text-xs uppercase px-4 py-2 rounded transition-colors flex items-center gap-1.5"
              >
                {savingLabel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Label"}
              </button>
            </div>
            <p className="text-[10px] text-neutral-500">
              This text will be displayed on the Hero button (e.g. &quot;My Resume&quot; or &quot;Download CV&quot;).
            </p>
          </form>
        </div>
      ) : (
        /* Empty State: No resume uploaded */
        <div className="bg-[#111116] border border-[#22222d] border-dashed rounded-lg p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              No Resume Uploaded Yet
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              Upload your resume in PDF, DOCX, or PNG format (max 10 MB). Once uploaded, the &quot;MY RESUME&quot; button will automatically appear in your portfolio hero section.
            </p>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-md shadow-lg shadow-rose-950/40 transition-all cursor-pointer select-none active:scale-95">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading File... {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Resume File</span>
                </>
              )}
              <input
                type="file"
                accept="application/pdf,.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-[10px] text-neutral-500 font-mono">
            Accepted formats: PDF, DOCX, PNG, JPG • Maximum size: 10 MB
          </p>
        </div>
      )}
    </div>
  );
}
