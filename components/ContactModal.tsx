"use client";

import React, { useState } from "react";
import { X, Send, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export default function ContactModal({ isOpen, onClose, initialService }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [service, setService] = useState(initialService || "Website Design & Development");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  React.useEffect(() => {
    if (initialService) {
      setService(initialService);
    }
  }, [initialService]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      // 1. Submit directly to Web3Forms API using browser FormData
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "b913a243-f1b0-4ba6-baad-c617848cd74a";
      const formData = new FormData(e.currentTarget);
      
      if (!formData.has("access_key")) {
        formData.append("access_key", accessKey);
      }
      if (!formData.has("subject")) {
        formData.append("subject", `New Inquiry: ${service} from ${name}`);
      }
      if (!formData.has("from_name")) {
        formData.append("from_name", "Yash Bajpai Portfolio");
      }
      if (!formData.has("service")) {
        formData.append("service", service);
      }

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to submit inquiry to Web3Forms.");
      }

      // 2. Also log to Firebase DB via /api/contact in background (for Admin Dashboard)
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, phone, company, service })
      }).catch((err) => {
        console.warn("Firebase backup log error:", err);
      });

      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setMessage("");
    } catch (err: any) {
      console.error("Web3Forms submission error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to send message. Please try again.");
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0e0e14] border border-[#222230] rounded-xl p-6 sm:p-8 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181822] border border-[#2a2a38] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-rose-500 font-bold text-xs uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LET&apos;S WORK TOGETHER</span>
              </div>
              <h3 className="font-condensed text-3xl font-extrabold uppercase text-white">
                START A PROJECT
              </h3>
              <p className="text-neutral-400 text-xs mt-1">
                Fill out the form below and Yash will get back to you within 24 hours.
              </p>
            </div>

            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121c16] border border-emerald-500/40 p-6 rounded-lg text-center my-6"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-white uppercase tracking-wide text-sm mb-1">
                  MESSAGE SENT SUCCESSFULLY!
                </h4>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  Thank you for reaching out! Your message has been logged and sent to Yash.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="access_key" value="b913a243-f1b0-4ba6-baad-c617848cd74a" />

                {status === "error" && (
                  <div className="bg-rose-950/50 border border-rose-600/50 p-3 rounded text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-[#14141c] border border-[#242432] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                    YOUR EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-[#14141c] border border-[#242432] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                      PHONE NUMBER (OPTIONAL)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-[#14141c] border border-[#242432] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                      COMPANY NAME (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-[#14141c] border border-[#242432] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                    SERVICE REQUIRED
                  </label>
                  <select
                    name="service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-[#14141c] border border-[#242432] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                  >
                    <option value="Logo & Brand Design">Logo &amp; Brand Design</option>
                    <option value="AI Video Ads">AI Video Ads</option>
                    <option value="Product Demo Videos">Product Demo Videos</option>
                    <option value="Website Design & Development">Website Design &amp; Development</option>
                    <option value="Full Branding & Development Package">Full Branding &amp; Development Package</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                    PROJECT DETAILS / MESSAGE
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your project goals, timeline, or scope..."
                    className="w-full bg-[#14141c] border border-[#242432] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  />
                </div>



                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-md shadow-lg shadow-rose-950/50 transition-all active:scale-[0.99]"
                  >
                    {status === "submitting" ? (
                      <span>SENDING MESSAGE...</span>
                    ) : (
                      <>
                        <span>SEND INQUIRY</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
