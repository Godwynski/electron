"use client";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Library,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth(true); // require auth
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-brand-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-primary-500 animate-spin" />
      </div>
    );
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard", active: true },
    { icon: Library, label: "Collections", href: "#", active: false },
    { icon: Settings, label: "Settings", href: "#", active: false },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-brand-800/80 backdrop-blur-xl border-r border-white/5">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/20 rounded-xl border border-primary-500/30">
            <BookOpen className="w-6 h-6 text-primary-500" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-xl font-semibold tracking-wide text-white">
            Nexus<span className="text-primary-500">Archives</span>
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item, idx) => (
          <button
            key={idx}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              item.active 
                ? "bg-primary-500/10 text-primary-400 border border-primary-500/20" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-medium tracking-wide">{item.label}</span>
            </div>
            {item.active && <ChevronRight className="w-4 h-4" />}
          </button>
        ))}
      </div>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-brand-900/50 rounded-2xl p-4 border border-white/5">
          <p className="text-sm font-medium text-slate-300 truncate mb-1">
            {user?.email}
          </p>
          <p className="text-xs text-slate-500 mb-4">Head Librarian</p>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 transition-colors border border-accent-500/20 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-900 text-foreground flex overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-brand-900/80 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-20 flex items-center justify-between px-6 border-b border-white/5 bg-brand-800/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary-500" strokeWidth={1.5} />
            <h1 className="font-serif text-lg font-semibold text-white">NexusArchives</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
