"use client";

import React, { useState } from "react";
import NavbarHeader from "@/components/NavbarHeader";
import HeroSection from "@/components/HeroSection";
import SelectedProjectsSection from "@/components/SelectedProjectsSection";
import EducationSkillsProcessSection from "@/components/EducationSkillsProcessSection";
import ContactFooterSection from "@/components/ContactFooterSection";
import ContactModal from "@/components/ContactModal";

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#060607] text-white flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Sticky Header Bar */}
      <NavbarHeader />

      {/* Hero Section */}
      <HeroSection onOpenContact={() => setIsContactOpen(true)} />

      {/* Selected Projects Showcase Grid */}
      <SelectedProjectsSection />

      {/* Education, Skills & 5-Step Work Process & Quote */}
      <EducationSkillsProcessSection />

      {/* Let's Work Together & Contact Footer */}
      <ContactFooterSection onOpenContact={() => setIsContactOpen(true)} />

      {/* Contact Inquiry Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </main>
  );
}
