"use client";

import React, { useState } from "react";
import NavbarHeader from "@/components/NavbarHeader";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import SelectedProjectsSection from "@/components/SelectedProjectsSection";
import EducationSkillsProcessSection from "@/components/EducationSkillsProcessSection";
import ContactFooterSection from "@/components/ContactFooterSection";
import ContactModal from "@/components/ContactModal";

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const handleOpenContact = (serviceName?: string) => {
    if (serviceName) {
      setSelectedService(serviceName);
    } else {
      setSelectedService(undefined);
    }
    setIsContactOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#060607] text-white flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Sticky Header Bar */}
      <NavbarHeader />

      {/* Hero Section */}
      <HeroSection onOpenContact={() => handleOpenContact()} />

      {/* Services & Expertise Showcase */}
      <ServicesSection onOpenContactService={(service) => handleOpenContact(service)} />

      {/* Selected Projects Showcase Grid */}
      <SelectedProjectsSection onOpenContactService={(service) => handleOpenContact(service)} />


      {/* Education, Skills & 5-Step Work Process & Quote */}
      <EducationSkillsProcessSection />

      {/* Let's Work Together & Contact Footer */}
      <ContactFooterSection onOpenContact={() => handleOpenContact()} />

      {/* Contact Inquiry Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        initialService={selectedService}
      />
    </main>
  );
}

