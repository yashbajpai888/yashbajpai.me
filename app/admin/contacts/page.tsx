"use client";

import React, { useEffect, useState } from "react";
import { 
  collection, 
  doc, 
  query, 
  orderBy, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Search, 
  Check, 
  Trash2, 
  MessageSquare,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Loader2,
  FileText,
  AlertCircle
} from "lucide-react";

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
  status: string;
  read: boolean;
  notes: string;
  phone?: string;
  company?: string;
  source?: string;
}

export default function AdminContactsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notesInput, setNotesInput] = useState("");
  const [updatingNotes, setUpdatingNotes] = useState(false);

  const markAsRead = async (id: string) => {
    try {
      const docRef = doc(db, "contactSubmissions", id);
      await updateDoc(docRef, { read: true });
      // Update local state to reflect read status
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, read: true } : s));
      if (selectedSub?.id === id) {
        setSelectedSub(prev => prev ? { ...prev, read: true } : null);
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const fetchSubmissions = async (selectId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "contactSubmissions"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: Submission[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          id: doc.id,
          name: docData.name || "N/A",
          email: docData.email || "N/A",
          message: docData.message || "",
          createdAt: docData.createdAt,
          status: docData.status || "new",
          read: docData.read ?? false,
          notes: docData.notes || "",
          phone: docData.phone || "",
          company: docData.company || "",
          source: docData.source || "website"
        });
      });
      setSubmissions(data);

      if (selectId) {
        const updated = data.find(s => s.id === selectId);
        if (updated) {
          setSelectedSub(updated);
          setNotesInput(updated.notes);
        }
      } else if (data.length > 0 && !selectedSub) {
        // Auto-select first message
        setSelectedSub(data[0]);
        setNotesInput(data[0].notes);
        if (!data[0].read) {
          markAsRead(data[0].id);
        }
      }
    } catch (err: any) {
      console.error("Error loading submissions:", err);
      setError("Failed to load records from Firestore. Check config and security rules.");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSelectSub = (sub: Submission) => {
    setSelectedSub(sub);
    setNotesInput(sub.notes);
    if (!sub.read) {
      markAsRead(sub.id);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const docRef = doc(db, "contactSubmissions", id);
      await updateDoc(docRef, { status: newStatus });
      
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      if (selectedSub?.id === id) {
        setSelectedSub(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Error updating status in database.");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSub) return;
    setUpdatingNotes(true);
    try {
      const docRef = doc(db, "contactSubmissions", selectedSub.id);
      await updateDoc(docRef, { notes: notesInput });
      
      setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? { ...s, notes: notesInput } : s));
      setSelectedSub(prev => prev ? { ...prev, notes: notesInput } : null);
      alert("Notes updated successfully!");
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Error saving notes to database.");
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission permanently?")) return;
    try {
      const docRef = doc(db, "contactSubmissions", id);
      await deleteDoc(docRef);
      
      const remaining = submissions.filter(s => s.id !== id);
      setSubmissions(remaining);
      
      if (selectedSub?.id === id) {
        if (remaining.length > 0) {
          setSelectedSub(remaining[0]);
          setNotesInput(remaining[0].notes);
        } else {
          setSelectedSub(null);
          setNotesInput("");
        }
      }
      alert("Submission deleted.");
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Error deleting record.");
    }
  };

  // Filter implementation
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.company && sub.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "unread" ? !sub.read :
      sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-60px)] md:min-h-screen">
      {/* Top action bar */}
      <div className="p-6 border-b border-[#1a1a24] bg-[#07070a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-condensed text-2xl font-black uppercase text-white tracking-wider">
            Inquiry Manager
          </h1>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">
            Manage, respond to, and track inbound portfolio messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSubmissions(selectedSub?.id)}
            disabled={loading}
            className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 border border-[#22222d] hover:border-rose-500 rounded bg-[#0d0d12] text-neutral-300 hover:text-white transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="m-6 bg-rose-950/40 border border-rose-600/30 p-4 rounded text-rose-300 text-xs flex items-center gap-3 shrink-0">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pane Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Pane: Submissions List */}
        <div className="w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-[#1a1a24] bg-[#08080c] flex flex-col overflow-y-auto max-h-[400px] lg:max-h-none shrink-0">
          {/* List Search & Filter Controls */}
          <div className="p-4 border-b border-[#14141c] space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search name, email, text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111116] border border-[#22222d] rounded pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto pb-1 select-none">
              {[
                { label: "All", value: "all" },
                { label: "Unread", value: "unread" },
                { label: "New", value: "new" },
                { label: "Contacted", value: "contacted" },
                { label: "Converted", value: "converted" },
                { label: "Closed", value: "closed" }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 transition-colors ${
                    statusFilter === opt.value
                      ? "bg-rose-600/10 text-rose-400 border-rose-500/30"
                      : "bg-transparent text-neutral-400 border-[#22222d] hover:text-white hover:border-[#3a3a4d]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Entries */}
          {loading && submissions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-rose-500 mb-2" />
              <span>Fetching messages...</span>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 text-xs text-center">
              <span>No inquiries matching filters.</span>
            </div>
          ) : (
            <div className="divide-y divide-[#121218]">
              {filteredSubmissions.map(sub => {
                const isSelected = selectedSub?.id === sub.id;
                const dateStr = sub.createdAt instanceof Timestamp
                  ? sub.createdAt.toDate().toLocaleDateString()
                  : sub.createdAt?.seconds 
                  ? new Date(sub.createdAt.seconds * 1000).toLocaleDateString()
                  : new Date(sub.createdAt).toLocaleDateString();

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSub(sub)}
                    className={`p-4 cursor-pointer transition-all flex items-start gap-3 relative ${
                      isSelected 
                        ? "bg-[#111116] border-l-2 border-rose-500" 
                        : "hover:bg-[#0c0c10]"
                    }`}
                  >
                    {/* Unread circle */}
                    {!sub.read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-5 left-2" />
                    )}

                    <div className="flex-1 min-w-0 pl-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold text-xs truncate ${isSelected ? "text-white" : "text-neutral-200"}`}>
                          {sub.name}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-mono shrink-0">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate">{sub.email}</p>
                      <p className="text-xs text-neutral-500 line-clamp-1 mt-1.5 italic">
                        {sub.message}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                          sub.status === "new" ? "text-rose-500 border-rose-500/20 bg-rose-500/5" :
                          sub.status === "contacted" ? "text-amber-500 border-amber-500/20 bg-amber-500/5" :
                          sub.status === "converted" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                          "text-neutral-400 border-[#22222d] bg-[#0d0d12]"
                        }`}>
                          {sub.status}
                        </span>
                        {sub.company && (
                          <span className="text-[8px] uppercase tracking-wider text-neutral-500 truncate max-w-[120px]">
                            @ {sub.company}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0 self-center" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Detailed View */}
        <div className="flex-1 bg-[#060607] overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
          {selectedSub ? (
            <div className="space-y-6">
              
              {/* Card Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1a1a24] pb-5 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    {selectedSub.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                      Channel: {selectedSub.source || "Website"}
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider font-mono">
                      ID: {selectedSub.id}
                    </span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
                    Status:
                  </label>
                  <select
                    value={selectedSub.status}
                    onChange={(e) => handleStatusChange(selectedSub.id, e.target.value)}
                    className="bg-[#0b0b0e] border border-[#222230] rounded px-2.5 py-1 text-xs text-white uppercase tracking-wider font-bold focus:outline-none focus:border-rose-500 transition-colors"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Grid Metadata Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0b0b0e] border border-[#1a1a24] p-4 rounded flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider">Email Address</p>
                    <a href={`mailto:${selectedSub.email}`} className="text-xs text-white hover:text-rose-400 truncate block font-medium transition-colors">
                      {selectedSub.email}
                    </a>
                  </div>
                </div>

                <div className="bg-[#0b0b0e] border border-[#1a1a24] p-4 rounded flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider">Phone Number</p>
                    {selectedSub.phone ? (
                      <a href={`tel:${selectedSub.phone}`} className="text-xs text-white hover:text-rose-400 truncate block font-medium transition-colors font-mono">
                        {selectedSub.phone}
                      </a>
                    ) : (
                      <p className="text-xs text-neutral-600 italic">Not provided</p>
                    )}
                  </div>
                </div>

                <div className="bg-[#0b0b0e] border border-[#1a1a24] p-4 rounded flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider">Company / Org</p>
                    <p className="text-xs text-white truncate font-medium">
                      {selectedSub.company || <span className="text-neutral-600 italic">Not provided</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Payload Block */}
              <div className="space-y-2">
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                  <span>Message Payload</span>
                </h3>
                <div className="bg-[#0b0b0e] border border-[#1a1a24] p-5 rounded relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
                  <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedSub.message}
                  </p>
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-2 pt-2 border-t border-[#14141c]">
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>Internal Admin Notes</span>
                </h3>
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Add follow-up notes, details, meeting timestamps..."
                    className="w-full bg-[#0b0b0e] border border-[#1a1a24] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={updatingNotes}
                      className="text-[10px] uppercase font-bold tracking-widest px-4 py-2 bg-[#121218] border border-[#222230] hover:border-rose-500 rounded text-neutral-300 hover:text-white transition-colors"
                    >
                      {updatingNotes ? "Saving..." : "Save Notes"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#1a1a24]">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:${selectedSub.email}`}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest px-4 py-2 border border-[#222230] hover:border-rose-500 rounded bg-[#0d0d12] text-neutral-300 hover:text-white transition-colors"
                  >
                    <Mail className="w-3 h-3 text-rose-500" />
                    <span>Email User</span>
                  </a>

                  {selectedSub.phone && (
                    <>
                      <a
                        href={`https://api.whatsapp.com/send?phone=${selectedSub.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest px-4 py-2 border border-[#222230] hover:border-emerald-500 rounded bg-[#0d0d12] text-neutral-300 hover:text-white transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                      
                      <a
                        href={`tel:${selectedSub.phone}`}
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest px-4 py-2 border border-[#222230] hover:border-blue-500 rounded bg-[#0d0d12] text-neutral-300 hover:text-white transition-colors"
                      >
                        <Phone className="w-3 h-3 text-blue-400" />
                        <span>Call Phone</span>
                      </a>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteSub(selectedSub.id)}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest px-4 py-2 border border-rose-950 hover:bg-rose-950/20 hover:border-rose-600 rounded text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3 h-3 shrink-0" />
                  <span>Delete Inquiry</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-xs py-12 text-center">
              <span>Select an inquiry from the sidebar to inspect details</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
