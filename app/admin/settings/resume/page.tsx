"use client";

import React from "react";
import ResumeManagementSection from "@/components/admin/ResumeManagementSection";
import { Settings as SettingsIcon } from "lucide-react";

export default function AdminResumeSettingsPage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-8">
      {/* Header */}
      <div className="border-b border-[#1a1a24] pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-condensed text-3xl font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
            <span>Website Resume Management</span>
            <SettingsIcon className="w-5 h-5 text-rose-500" />
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
            Upload, update, preview, and manage your dynamic portfolio resume
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-[#0b0b0e] border border-[#1a1a24] rounded-lg p-6 sm:p-8 shadow-2xl">
        <ResumeManagementSection />
      </div>
    </div>
  );
}
