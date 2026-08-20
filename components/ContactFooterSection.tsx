import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, Globe, Phone as PhoneIcon, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ContactFooterSectionProps {
  onOpenContact: () => void;
}

export default function ContactFooterSection({ onOpenContact }: ContactFooterSectionProps) {
  const [headline, setHeadline] = useState("LET'S WORK TOGETHER");
  const [description, setDescription] = useState("I'm currently open for new projects and collaborations. Let's create something amazing that drives results.");
  const [email, setEmail] = useState("yashbjp888@gmail.com");
  const [website, setWebsite] = useState("www.yashbajpai.com");
  const [phone, setPhone] = useState("+91 79720 78625");
  const [location, setLocation] = useState("Nagpur, India");
  const [workspaceImage, setWorkspaceImage] = useState("/images/contact_laptop.png");

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const docRef = doc(db, "settings", "homepage");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.contact) {
            setHeadline(data.contact.headline || "LET'S WORK TOGETHER");
            setDescription(data.contact.description || "I'm currently open for new projects and collaborations. Let's create something amazing that drives results.");
            setEmail(data.contact.email || "yashbjp888@gmail.com");
            setWebsite(data.contact.website || "www.yashbajpai.com");
            setPhone(data.contact.phone || "+91 79720 78625");
            setLocation(data.contact.location || "Nagpur, India");
            setWorkspaceImage(data.contact.workspaceImage || "/images/contact_laptop.png");
          }
        }
      } catch (err) {
        console.warn("Failed to load contact footer configurations, using static defaults:", err);
      }
    };
    fetchContactData();
  }, []);

  return (
    <footer className="w-full py-16 px-6 md:px-12 bg-[#050506] text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

        {/* Left Column (5 cols): Headline & Prompt */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 flex flex-col space-y-5"
        >
          <h2 className="font-condensed text-4xl sm:text-5xl font-extrabold uppercase tracking-tight leading-tight text-white flex items-center gap-2">
            <span>{headline.includes(" ") ? (
              <>
                {headline.substring(0, headline.lastIndexOf(" "))}
                <br />
                {headline.substring(headline.lastIndexOf(" ") + 1)}
              </>
            ) : (
              headline
            )}</span>
            <Sparkles className="w-6 h-6 text-rose-500 fill-rose-500 ml-1 self-start mt-2" />
          </h2>

          <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed max-w-sm">
            {description}
          </p>

          <div>
            <button
              onClick={onOpenContact}
              className="inline-flex items-center space-x-2 text-xs uppercase font-semibold tracking-wider text-neutral-200 bg-[#0d0d12] border border-[#22222f] hover:border-rose-500 px-4 py-2.5 rounded-full transition-all group"
            >
              <div className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span>AVAILABLE FOR FREELANCE</span>
            </button>
          </div>
        </motion.div>

        {/* Middle Column (4 cols): Contact Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-4 flex flex-col space-y-4"
        >
          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="flex items-center space-x-3.5 p-2 rounded-lg hover:bg-[#0c0c10] transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-[#0e0e14] border border-[#22222d] flex items-center justify-center text-neutral-300 group-hover:border-rose-500 group-hover:text-rose-400 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
              {email}
            </span>
          </a>

          {/* Website */}
          <a
            href={website.startsWith("http") ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3.5 p-2 rounded-lg hover:bg-[#0c0c10] transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-[#0e0e14] border border-[#22222d] flex items-center justify-center text-neutral-300 group-hover:border-rose-500 group-hover:text-rose-400 transition-colors">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
              {website}
            </span>
          </a>

          {/* Phone */}
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="flex items-center space-x-3.5 p-2 rounded-lg hover:bg-[#0c0c10] transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-[#0e0e14] border border-[#22222d] flex items-center justify-center text-neutral-300 group-hover:border-rose-500 group-hover:text-rose-400 transition-colors">
              <PhoneIcon className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-neutral-300 group-hover:text-white transition-colors font-mono">
              {phone}
            </span>
          </a>

          {/* Location */}
          <div className="flex items-center space-x-3.5 p-2">
            <div className="w-9 h-9 rounded-full bg-[#0e0e14] border border-[#22222d] flex items-center justify-center text-neutral-300">
              <MapPin className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-neutral-300">
              {location}
            </span>
          </div>
        </motion.div>

        {/* Right Column (3 cols): Workspace Laptop Mockup Photo */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-3 flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-[320px] aspect-[4/3] rounded-lg overflow-hidden border border-[#20202d] shadow-2xl group bg-[#0d0d12]">
            {workspaceImage.startsWith("/") || workspaceImage.startsWith("http") ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={workspaceImage}
                alt="Workspace Setup"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <Image
                src="/images/contact_laptop.png"
                alt="Yash Bajpai Desk Setup Mockup"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto mt-16 pt-6 border-t border-[#14141c] flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase font-semibold text-neutral-400 gap-4">
        <div>
          &copy; {new Date().getFullYear()} YASH BAJPAI. ALL RIGHTS RESERVED.
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-rose-500">NEXT.JS &amp; FIREBASE INTEGRATED</span>
          <span>✦</span>
          <span>{location}</span>
        </div>
      </div>
    </footer>
  );
}
