"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, KeyRound, ChevronRight, Eye, EyeOff, AlertCircle, Mail, Loader2, CheckCircle2, MailOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { isElectron, getRedirectUrl } from "@/lib/env";

// Validates that the email follows the STI Alabang format: LastName.IDNumber@alabang.sti.edu.ph
function isValidStiEmail(email: string): boolean {
  // Matches LastName.IDNumber@alabang.sti.edu.ph
  // LastName can contain letters, dots, or hyphens
  const stiEmailRegex = /^[a-zA-Z.-]+\.\d+@alabang\.sti\.edu\.ph$/i;
  return stiEmailRegex.test(email.trim());
}

export default function Login() {
  const { loading: authLoading } = useAuth(false);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Verification polling state (Electron only)
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"polling" | "verified" | "error">("polling");
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    // Check for error query parameter
    const queryParams = new URLSearchParams(window.location.search);
    const error = queryParams.get("error");
    if (error) {
       setErrorMsg(decodeURIComponent(error));
       // Clear error from URL
       window.history.replaceState(null, "", window.location.pathname);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Start polling for email verification
  const startVerificationPolling = useCallback((email: string, pass: string) => {
    setAwaitingVerification(true);
    setVerificationStatus("polling");

    // Poll every 5 seconds (slightly less aggressive)
    pollIntervalRef.current = setInterval(async () => {
      try {
        // Try to sign in to check if email is verified
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: pass,
        });
        
        if (error) {
          // If email is not confirmed, Supabase returns this specific error message
          if (error.message.toLowerCase().includes("email not confirmed")) {
            return; // Still polling
          }
          
          // Log other actual errors (but keep polling in case of transient network issues)
          console.warn("Polling status:", error.message);
          return;
        }

        if (data.session) {
          // User is verified and session is established!
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setVerificationStatus("verified");

          // Redirect to dashboard after success animation
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        }
      } catch (err) {
        console.error("Critical polling error:", err);
      }
    }, 5000);
  }, []);

  const handleCancelVerification = useCallback(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setAwaitingVerification(false);
    setVerificationStatus("polling");
    supabase.auth.signOut(); // Clean up the unverified session
  }, []);

  if (authLoading) {
    return <div className="min-h-screen bg-brand-900 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-t-2 border-primary-500 animate-spin" />
    </div>;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    // Validate STI Alabang email format
    if (!isValidStiEmail(username)) {
      setErrorMsg("Only STI Alabang accounts are allowed. Please use the format: LastName.IDNumber@alabang.sti.edu.ph");
      setIsLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: username,
          password: password,
        });
        if (error) throw error;
        setSuccessMsg("Access Granted. Initializing synchronization...");
      } else {
        const { error } = await supabase.auth.signUp({
          email: username,
          password: password,
          options: {
            emailRedirectTo: getRedirectUrl(),
          },
        });
        if (error) throw error;

        if (isElectron()) {
          // In Electron: start polling for verification instead of relying on redirect
          setIsLoading(false);
          startVerificationPolling(username, password);
          return;
        } else {
          // In browser: show success message, redirect handled by email link + callback page
          setSuccessMsg("Registration successful! Check your STI Outlook inbox to verify your account.");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg(String(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithAzure = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email offline_access',
          redirectTo: getRedirectUrl(),
        },
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg(String(error));
      }
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Verification Waiting Screen (Electron only)
  // ─────────────────────────────────────────────────────────
  if (awaitingVerification) {
    return (
      <main className="min-h-screen bg-brand-900 text-foreground flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-accent-500/8 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-10 text-center relative z-10"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
              <BookOpen className="w-8 h-8 text-primary-500" strokeWidth={1.5} />
            </div>
            <h1 className="font-serif text-2xl font-semibold tracking-wide text-slate-800">
              Nexus<span className="text-primary-500 font-bold">Archives</span>
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {verificationStatus === "polling" && (
              <motion.div
                key="polling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Animated Mail Icon */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="mb-6 flex justify-center"
                >
                  <div className="p-5 bg-primary-500/10 rounded-full border border-primary-500/20">
                    <MailOpen className="w-12 h-12 text-primary-500" strokeWidth={1.5} />
                  </div>
                </motion.div>

                <h2 className="text-xl font-medium text-slate-800 mb-3">
                  Check Your Outlook Inbox
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-2">
                  We sent a verification email to
                </p>
                <div className="mb-4 mx-auto inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                  <p className="text-sm text-primary-500 font-medium">{username}</p>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Click the verification link in the email. This page will update automatically once verified.
                </p>

                {/* Polling indicator */}
                <div className="flex items-center justify-center gap-2 mb-8 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs uppercase tracking-widest">Waiting for verification…</span>
                </div>

                <button
                  onClick={handleCancelVerification}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ← Back to login
                </button>
              </motion.div>
            )}

            {verificationStatus === "verified" && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="mb-6 flex justify-center">
                  <div className="p-5 bg-green-50 rounded-full border border-green-200">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                </div>
                <h2 className="text-xl font-medium text-green-600 mb-3">
                  Account Verified!
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Redirecting to dashboard…
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Normal Login / Signup Form
  // ─────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-brand-900 text-foreground flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Animated Background Subtle Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-accent-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl grid md:grid-cols-2 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden relative z-10"
      >
        {/* Left Side: Branding & Welcome Message */}
        <div className="p-10 md:p-12 flex flex-col justify-between relative bg-gradient-to-br from-slate-50 to-white">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                <BookOpen className="w-8 h-8 text-primary-500" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-2xl font-semibold tracking-wide text-slate-800">Nexus<span className="text-primary-500 font-bold">Archives</span></h1>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-4 text-slate-800"
            >
              Knowledge,<br />
              <span className="italic text-accent-500 text-3xl md:text-4xl">Preserved.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-slate-500 text-sm md:text-base max-w-sm leading-relaxed"
            >
              Access the grand repository. Manage collections, track records, and unveil the history of the archives securely offline.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="hidden md:block text-xs uppercase tracking-[0.2em] text-slate-400 mt-12"
          >
            STI College Alabang &mdash; Library System
          </motion.div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-10 md:p-12 flex flex-col justify-center bg-white relative">
          {/* Subtle separator line on desktop */}
          <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h3 className="text-xl font-medium text-slate-800 mb-6">
              {isLogin ? "Librarian Access" : "Register Librarian"}
            </h3>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 leading-relaxed font-medium">{errorMsg}</p>
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <p className="text-sm text-green-700 leading-relaxed font-medium">{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input Group */}
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 focus:bg-white transition-all font-medium"
                  />
                </div>
                {/* STI Outlook badge — signup only */}
                {!isLogin && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-primary-500/5 border border-primary-500/15 rounded-lg">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <rect x="1" y="4" width="22" height="16" rx="2" fill="#0057A8"/>
                      <path d="M1 6l11 7 11-7" stroke="#fff" strokeWidth="1.5" fill="none"/>
                      <rect x="0" y="7" width="10" height="10" rx="1.5" fill="#00437F"/>
                      <text x="5" y="14.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">O</text>
                    </svg>
                    <span className="text-xs text-slate-500">
                      STI Alabang Outlook accounts only
                      <span className="text-slate-400 ml-1">(@alabang.sti.edu.ph)</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Password Input Group */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Confirm Password (Signup only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'clip' }}
                  >
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        required={!isLogin}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 focus:bg-white transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 rounded border border-slate-300 bg-white group-hover:border-primary-500 transition-colors">
                    <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />
                    <div className="w-2 h-2 rounded-sm bg-primary-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">Remember Session</span>
                </label>
                {isLogin && (
                  <button type="button" className="text-xs text-primary-500 hover:text-primary-600 transition-colors font-medium">Forgot Password?</button>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={!isLoading ? { scale: 1.01 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${isLoading ? 'from-primary-500 to-primary-600 opacity-70 cursor-not-allowed' : 'from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/25'} text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-8 group`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <motion.div
                      initial={{ x: 0 }}
                      animate={{ x: isHovered ? 4 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-medium tracking-wider">Or continue with</span>
              </div>
            </div>

            <motion.button
              whileHover={!isLoading ? { scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              onClick={signInWithAzure}
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-700 font-medium py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm group"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              Sign in with Microsoft
            </motion.button>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary-500 font-medium hover:text-primary-600 transition-colors"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
