"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { Sparkles, KeyRound, Mail, AlertCircle, ArrowLeft, LogOut, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const { user, isAdmin, error: authError } = useAdminAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Sync auth errors and unauthorized states from the hook
  useEffect(() => {
    if (authError) {
      setError(authError);
      setLoading(false);
    }
  }, [authError]);

  useEffect(() => {
    if (user && !isAdmin && !authError) {
      setError("Unauthorized. Admin privileges are required to access this area.");
      setLoading(false);
    }
  }, [user, isAdmin, authError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setResetSuccess(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      let friendlyMessage = "Invalid credentials or authorization error.";
      if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        friendlyMessage = "Incorrect email or password. Please check your credentials or ensure the admin user exists in Firebase Console.";
      } else if (err.code === "auth/too-many-requests") {
        friendlyMessage = "Too many failed login attempts. Please try again later.";
      } else {
        console.error("Unexpected login failure:", err);
      }

      console.warn("Firebase Auth attempt failed:", err.code || err.message);
      setError(friendlyMessage);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setResetSuccess(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSuccess("Password reset email sent! Please check your inbox (and spam folder) for instructions.");
    } catch (err: any) {
      let friendlyMessage = "Failed to send reset email. Please try again.";
      if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/user-not-found") {
        friendlyMessage = "No user account was found registered with this email address.";
      } else if (err.code === "auth/too-many-requests") {
        friendlyMessage = "Too many password reset requests. Please wait a few minutes before trying again.";
      } else {
        console.error("Password reset error:", err);
      }
      console.warn("Password reset failed:", err.code || err.message);
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to sign out.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060607] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portfolio</span>
        </Link>

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto mb-4">
            <Sparkles className="w-6 h-6 fill-rose-500/20" />
          </div>
          <h1 className="font-condensed text-3xl font-black tracking-wider text-white uppercase">
            YASH BAJPAI
          </h1>
          <p className="text-xs text-rose-500 uppercase font-bold tracking-widest mt-1">
            Private Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0b0b0e] border border-[#1a1a24] rounded-lg p-6 sm:p-8 shadow-2xl relative">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6 border-b border-[#14141c] pb-3">
            {user && !isAdmin ? "ACCESS DENIED" : isResetMode ? "RESET PASSWORD" : "SIGN IN"}
          </h2>

          {user && !isAdmin ? (
            <div className="space-y-4">
              <div className="bg-rose-950/40 border border-rose-600/30 p-3.5 rounded text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">UNAUTHORIZED ACCOUNT</p>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Logged in as <code className="text-white">{user.email}</code>. 
                    This account does not have administrator privileges.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Please make sure this user&apos;s UID (<code className="text-rose-400 font-mono text-[10px]">{user.uid}</code>) has been provisioned with <code className="text-white">role: &quot;admin&quot;</code> inside your Firestore database.
              </p>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest py-3 rounded transition-all active:scale-[0.99]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : isResetMode ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="bg-rose-950/40 border border-rose-600/30 p-3.5 rounded text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <p className="text-xs text-neutral-400 leading-relaxed">
                Enter your admin email address below and we&apos;ll send you a link to reset your password.
              </p>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@yashbajpai.com"
                    className="w-full bg-[#111116] border border-[#22222d] rounded-md pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900 text-white font-bold text-xs uppercase tracking-widest py-3 rounded shadow-lg shadow-rose-950/40 transition-all active:scale-[0.99]"
                >
                  {loading ? (
                    <span>Sending Reset Link...</span>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setError(null);
                    setResetSuccess(null);
                  }}
                  className="w-full text-center text-xs text-neutral-400 hover:text-white transition-colors uppercase font-bold tracking-wider py-1"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-rose-950/40 border border-rose-600/30 p-3.5 rounded text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@yashbajpai.com"
                    className="w-full bg-[#111116] border border-[#22222d] rounded-md pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setError(null);
                      setResetSuccess(null);
                    }}
                    className="text-[10px] uppercase font-bold tracking-wider text-rose-500 hover:text-rose-400 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#111116] border border-[#22222d] rounded-md pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900 text-white font-bold text-xs uppercase tracking-widest py-3 rounded shadow-lg shadow-rose-950/40 transition-all active:scale-[0.99]"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-neutral-500 text-center mt-6 uppercase tracking-wider">
          Authorized personnel only. Access logging is active.
        </p>

      </div>
    </div>
  );
}
