"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, KeyRound, User, ChevronRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { loading: authLoading } = useAuth(false); // false means 'do not require auth to view this page'
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
        });
        if (error) throw error;
        setSuccessMsg("Registration successful! Check your email to verify.");
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

  return (
    <main className="min-h-screen bg-brand-900 text-foreground flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Animated Background Subtle Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      {/* Main Glass Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl grid md:grid-cols-2 bg-brand-800/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* Left Side: Branding & Welcome Message */}
        <div className="p-10 md:p-12 flex flex-col justify-between relative bg-gradient-to-br from-brand-800/50 to-transparent">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="p-3 bg-primary-500/20 rounded-2xl border border-primary-500/30">
                <BookOpen className="w-8 h-8 text-primary-500" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-2xl font-semibold tracking-wide text-white">Nexus<span className="text-primary-500 font-bold">Archives</span></h1>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-4 text-white"
            >
              Knowledge,<br />
              <span className="italic text-accent-500 text-3xl md:text-4xl">Preserved.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-slate-400 text-sm md:text-base max-w-sm leading-relaxed"
            >
              Access the grand repository. Manage collections, track records, and unveil the history of the archives securely offline.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="hidden md:block text-xs uppercase tracking-[0.2em] text-slate-500 mt-12"
          >
            Terminal Interface v1.0
          </motion.div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-10 md:p-12 flex flex-col justify-center bg-brand-900/40 relative">
          {/* Subtle separator line on desktop */}
          <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h3 className="text-xl font-medium text-white mb-6">
              {isLogin ? "Librarian Access" : "Register Librarian"}
            </h3>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200 leading-relaxed font-medium">{errorMsg}</p>
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <p className="text-sm text-green-200 leading-relaxed font-medium">{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input Group */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-brand-900/60 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all font-medium"
                />
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
                  className="w-full bg-brand-900/60 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all font-medium"
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
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="relative group overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    required={!isLogin}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-brand-900/60 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all font-medium"
                  />
                </motion.div>
              )}

              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 rounded border border-slate-600 bg-brand-900/50 group-hover:border-primary-500 transition-colors">
                    <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />
                    <div className="w-2 h-2 rounded-sm bg-primary-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Remember Session</span>
                </label>
                {isLogin && (
                  <button type="button" className="text-xs text-primary-500 hover:text-primary-400 transition-colors font-medium">Forgot Password?</button>
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
                className={`w-full bg-gradient-to-r ${isLoading ? 'from-primary-500 to-primary-600 opacity-70 cursor-not-allowed' : 'from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/20'} text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-8 group border border-white/10`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary-500 font-medium hover:text-primary-400 transition-colors"
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
