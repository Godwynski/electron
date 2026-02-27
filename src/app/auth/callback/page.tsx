"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type VerifyStatus = "loading" | "success" | "error";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    async function handleAuth() {
      try {
        // Supabase appends tokens as a hash fragment (#access_token=...&refresh_token=...)
        // or as a query param (?code=...) depending on the flow.
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const queryParams = new URLSearchParams(window.location.search);

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const code = queryParams.get("code");

        if (accessToken && refreshToken) {
          // Token-based flow (implicit / magic link)
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else if (code) {
          // PKCE flow
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          throw new Error("No authentication tokens found in the URL.");
        }

        setStatus("success");
        setMessage("Account verified! Redirecting to dashboard...");

        // Short delay so the user sees the success state
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Verification failed. Please try again."
        );
      }
    }

    handleAuth();
  }, [router]);

  return (
    <main className="min-h-screen bg-brand-900 text-foreground flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Glows */}
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
          <div className="p-3 bg-primary-500/20 rounded-2xl border border-primary-500/30">
            <BookOpen
              className="w-8 h-8 text-primary-500"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="font-serif text-2xl font-semibold tracking-wide text-slate-800">
            Nexus<span className="text-primary-500 font-bold">Archives</span>
          </h1>
        </div>

        {/* Status Icon */}
        <motion.div
          key={status}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 flex justify-center"
        >
          {status === "loading" && (
            <div className="p-4 bg-primary-50 rounded-full border border-primary-100">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="p-4 bg-green-50 rounded-full border border-green-100">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          )}
          {status === "error" && (
            <div className="p-4 bg-red-50 rounded-full border border-red-100">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          )}
        </motion.div>

        {/* Status Text */}
        <h2
          className={`text-lg font-medium mb-2 ${
            status === "success"
              ? "text-green-600"
              : status === "error"
              ? "text-red-600"
              : "text-slate-800"
          }`}
        >
          {status === "loading" && "Verifying..."}
          {status === "success" && "Verified!"}
          {status === "error" && "Verification Failed"}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>

        {/* Retry on error */}
        {status === "error" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors"
          >
            Back to Login
          </motion.button>
        )}
      </motion.div>
    </main>
  );
}
