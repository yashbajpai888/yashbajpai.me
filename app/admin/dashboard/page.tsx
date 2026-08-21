"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Mail, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  Inbox, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
  status: string;
  read: boolean;
  phone?: string;
  company?: string;
}

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
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
          phone: docData.phone,
          company: docData.company
        });
      });
      setSubmissions(data);
    } catch (err: any) {
      console.error("Failed to load dashboard submissions:", err);
      setError("Failed to sync database records. Check console log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Compute Metrics in-memory to prevent indexing errors
  const total = submissions.length;
  const newCount = submissions.filter(s => s.status === "new" || !s.read).length;
  const contacted = submissions.filter(s => s.status === "contacted").length;
  const converted = submissions.filter(s => s.status === "converted").length;
  const closed = submissions.filter(s => s.status === "closed").length;

  const recentSubmissions = submissions.slice(0, 5);

  const statsCards = [
    {
      title: "Total Inquiries",
      value: total,
      icon: Inbox,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "New / Unread",
      value: newCount,
      icon: Mail,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Contacted",
      value: contacted,
      icon: MessageSquare,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Converted / Closed",
      value: converted + closed,
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1a1a24] pb-6 gap-4">
        <div>
          <h1 className="font-condensed text-3xl font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
            <span>Dashboard Overview</span>
            <Sparkles className="w-5 h-5 text-rose-500 fill-rose-500" />
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
            Real-time metric summary and activity tracking
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="text-xs uppercase font-bold tracking-widest px-4 py-2 border border-[#22222d] hover:border-rose-500 rounded bg-[#0d0d12] text-neutral-300 hover:text-white transition-colors"
        >
          {loading ? "Refreshing..." : "Sync Database"}
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-600/30 p-4 rounded-md text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-[#0b0b0e] border border-[#1a1a24] p-6 rounded hover:border-rose-500/40 transition-all group shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="font-condensed text-4xl font-extrabold text-white mt-4 group-hover:translate-x-1 transition-transform">
                {loading ? "..." : card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Recent Submissions (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#0b0b0e] border border-[#1a1a24] rounded overflow-hidden">
            <div className="p-5 border-b border-[#14141c] flex items-center justify-between">
              <h2 className="text-xs uppercase font-bold tracking-wider text-white">
                Recent Inquiries
              </h2>
              <Link 
                href="/admin/contacts" 
                className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                Loading database entries...
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No submissions found.
              </div>
            ) : (
              <div className="divide-y divide-[#14141c]">
                {recentSubmissions.map((sub) => {
                  const dateStr = sub.createdAt instanceof Timestamp
                    ? sub.createdAt.toDate().toLocaleDateString()
                    : sub.createdAt?.seconds 
                    ? new Date(sub.createdAt.seconds * 1000).toLocaleDateString()
                    : new Date(sub.createdAt).toLocaleDateString();

                  return (
                    <div key={sub.id} className="p-5 hover:bg-[#0e0e14]/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{sub.name}</span>
                          {(!sub.read || sub.status === "new") && (
                            <span className="text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{sub.email}</p>
                        <p className="text-xs text-neutral-500 line-clamp-1 mt-2 max-w-md italic">
                          &ldquo;{sub.message}&rdquo;
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 text-right shrink-0">
                        <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-600" />
                          {dateStr}
                        </span>
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                          sub.status === "new" ? "text-rose-500 border-rose-500/20 bg-rose-500/5" :
                          sub.status === "contacted" ? "text-amber-500 border-amber-500/20 bg-amber-500/5" :
                          sub.status === "converted" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                          "text-neutral-400 border-[#22222d] bg-[#0d0d12]"
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Tips & Platform Status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Metrics Graph / Analytics Preview Card */}
          <div className="bg-[#0b0b0e] border border-[#1a1a24] p-5 rounded relative overflow-hidden">
            <h3 className="text-xs uppercase font-bold tracking-wider text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <span>Conversion Stats</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] uppercase font-semibold text-neutral-400 mb-1">
                  <span>Inquiry-to-Contacted Rate</span>
                  <span>{total > 0 ? Math.round(((contacted + converted) / total) * 100) : 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#14141c] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-600 rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? ((contacted + converted) / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] uppercase font-semibold text-neutral-400 mb-1">
                  <span>Conversion Rate</span>
                  <span>{total > 0 ? Math.round((converted / total) * 100) : 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#14141c] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (converted / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Database Status Info */}
          <div className="bg-[#0b0b0e] border border-[#1a1a24] p-5 rounded">
            <h3 className="text-xs uppercase font-bold tracking-wider text-white mb-3">
              Database Status
            </h3>
            <ul className="space-y-2.5 text-[11px] text-neutral-400">
              <li className="flex justify-between">
                <span>Firestore Config:</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider font-mono">CONNECTED</span>
              </li>
              <li className="flex justify-between">
                <span>Auth Provider:</span>
                <span className="text-neutral-200">Firebase Auth</span>
              </li>
              <li className="flex justify-between">
                <span>Target Email:</span>
                <span className="text-neutral-200 truncate max-w-[150px] font-mono">
                  {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Configured" : "Mock (Local)"}
                </span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
