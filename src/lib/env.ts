"use client";

/**
 * Runtime environment helpers for detecting Electron vs Browser context.
 */

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
    };
  }
}

/** Returns true if the app is running inside the Electron shell. */
export function isElectron(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.electronAPI?.isElectron;
}

/** 
 * Returns the appropriate redirect URL for Supabase email verification.
 * - In Electron, we don't use the redirect (polling handles it), but we still
 *   need a valid URL for Supabase — point to the web callback.
 * - In Browser, redirect to the web callback page.
 */
export function getRedirectUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  return "/auth/callback";
}
