"use client";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  Library,
  ChevronRight,
  Users,
  ClipboardList,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth(true); // require auth
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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

  const isAdmin = role === 'admin';
  const isStaff = role === 'staff' || isAdmin;

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard", active: pathname === "/dashboard" },
    { icon: Library, label: "Collections", href: "/dashboard/collections", active: pathname === "/dashboard/collections" },
    { icon: ClipboardList, label: isStaff ? "Borrow Requests" : "My Requests", href: "/dashboard/requests", active: pathname === "/dashboard/requests" },
    { icon: BarChart3, label: "Reports", href: "/dashboard/reports", active: pathname === "/dashboard/reports" },
    ...(isAdmin ? [{ icon: Users, label: "Users", href: "/dashboard/users", active: pathname === "/dashboard/users" }] : []),
    ...(isStaff ? [{ icon: Settings, label: "Settings", href: "#", active: pathname === "/dashboard/settings" }] : []),
  ];

  return (
    <div className="min-h-screen bg-brand-900 text-foreground flex overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 z-20">
        <SidebarContent user={user} role={role} handleLogout={handleLogout} navItems={navItems} />
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
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 shadow-2xl"
            >
              <SidebarContent user={user} role={role} handleLogout={handleLogout} navItems={navItems} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-20 flex items-center justify-between px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary-500" strokeWidth={1.5} />
            <h1 className="font-serif text-lg font-semibold text-slate-800">NexusArchives</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
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

interface SidebarNavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
}

function SidebarContent({ 
  user, 
  role,
  handleLogout, 
  navItems 
}: { 
  user: User | null; 
  role: string | null;
  handleLogout: () => void; 
  navItems: SidebarNavItem[];
}) {
  return (
    <div className="flex flex-col h-full bg-white backdrop-blur-xl border-r border-slate-200 font-sans">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/20 rounded-xl border border-primary-500/30">
            <BookOpen className="w-6 h-6 text-primary-500" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-xl font-semibold tracking-wide text-slate-800">
            Nexus<span className="text-primary-500">Archives</span>
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              item.active 
                ? "bg-primary-50 text-primary-600 border border-primary-100/50 shadow-sm" 
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-medium tracking-wide">{item.label}</span>
            </div>
            {item.active && <ChevronRight className="w-4 h-4" />}
          </Link>
        ))}
      </div>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <p className="text-sm font-medium text-slate-700 truncate mb-1">
            {user?.email}
          </p>
          <p className="text-xs text-slate-500 mb-4 capitalize">{role || 'Borrower'}</p>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-50 group hover:bg-accent-100 transition-all border border-accent-100 text-accent-600 text-sm font-medium shadow-sm"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
