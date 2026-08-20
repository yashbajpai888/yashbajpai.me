"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { 
  LayoutDashboard, 
  Mail, 
  FolderGit, 
  Settings as SettingsIcon, 
  LogOut, 
  Loader2, 
  Sparkles, 
  User as UserIcon 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAdminAuth();

  const isLoginPage = pathname === "/admin";

  useEffect(() => {
    if (!loading) {
      if (isLoginPage) {
        if (user && isAdmin) {
          router.push("/admin/dashboard");
        }
      } else {
        if (!user || !isAdmin) {
          router.push("/admin");
        }
      }
    }
  }, [user, isAdmin, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060607] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#060607] flex flex-col items-center justify-center text-white p-4 text-center">
        <Loader2 className="w-6 h-6 text-rose-500 animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Redirecting to Admin Portal...
        </p>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Contacts", href: "/admin/contacts", icon: Mail },
    { name: "Projects", href: "/admin/projects", icon: FolderGit },
    { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#060607] text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0a0a0f] border-b md:border-b-0 md:border-r border-[#1a1a24] flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#14141c] flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="font-condensed text-lg font-black tracking-wider text-white">
              YASH BAJPAI
            </span>
          </Link>
          <span className="text-[9px] uppercase font-bold tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            ADMIN
          </span>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-4 border-b border-[#14141c] flex items-center gap-3 bg-[#0d0d12]/30">
          <div className="w-9 h-9 rounded-full bg-[#181824] border border-[#242432] flex items-center justify-center text-neutral-300">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">
              {user.displayName || "Admin User"}
            </p>
            <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-950/30"
                    : "text-neutral-400 hover:text-white hover:bg-[#111118]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-[#14141c]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-rose-950/20 hover:border-rose-900/30 border border-transparent transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#060607]">
        {children}
      </main>
    </div>
  );
}
