"use client";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { 
  Library, 
  Search, 
  Activity, 
  BookOpen, 
  ChevronRight,
  TrendingUp,
  Award,
  BookMarked
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Stats {
  totalBooks: number;
  activeRequests: number;
  myLoans: number;
}

export default function DashboardOverview() {
  const { user, role, loading } = useAuth(true);
  const [stats, setStats] = useState<Stats>({ totalBooks: 0, activeRequests: 0, myLoans: 0 });
  const [recentBooks, setRecentBooks] = useState<{ id: string, title: string, author: string }[]>([]);

  const isAdmin = role === 'admin';
  const isStaff = role === 'staff' || isAdmin;

  const fetchDashboardData = useCallback(async () => {
    // 1. Fetch stats
    const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
    
    let activeReqs = 0;
    if (isStaff) {
      const { count } = await supabase.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      activeReqs = count || 0;
    }

    let myLoansCount = 0;
    if (user) {
      const { count } = await supabase.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'approved');
      myLoansCount = count || 0;
    }

    setStats({
      totalBooks: booksCount || 0,
      activeRequests: activeReqs,
      myLoans: myLoansCount
    });

    // 2. Fetch recent books
    const { data: recents } = await supabase.from('books').select('*').order('created_at', { ascending: false }).limit(3);
    setRecentBooks(recents || []);
  }, [user, isStaff]);

  useEffect(() => {
    const init = async () => {
      if (!loading && user) {
        await fetchDashboardData();
      }
    };
    init();
  }, [loading, user, fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-t-2 border-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary-100 shadow-sm">
              {role?.toUpperCase()} ACCESS
            </span>
          </div>
          <h2 className="font-serif text-4xl font-semibold text-slate-800 tracking-tight">
            Greetings, {user?.email?.split('.')[0] || 'Scholar'}.
          </h2>
          <p className="text-slate-500 mt-2 font-sans">The archives are fully operational and synchronized.</p>
        </div>

        <Link 
          href="/dashboard/collections"
          className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/5 transition-all group"
        >
          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-primary-50 transition-colors">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
          </div>
          <span className="text-sm font-bold text-slate-600 group-hover:text-primary-600">Explore Collections</span>
        </Link>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          icon={BookOpen} 
          label="Archived Volumes" 
          value={stats.totalBooks} 
          sub="Available for study" 
          color="primary"
        />
        <StatCard 
          icon={isStaff ? Activity : BookMarked} 
          label={isStaff ? "Pending Audits" : "My Active Loans"} 
          value={isStaff ? stats.activeRequests : stats.myLoans} 
          sub={isStaff ? "Awaiting processing" : "Resources in hand"} 
          color="blue"
        />
        <StatCard 
          icon={Award} 
          label="Member Standing" 
          value="Distinguished" 
          sub="No outstanding fines" 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Additions */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-slate-800">Fresh from Archives</h3>
              <Link href="/dashboard/collections" className="text-sm font-bold text-primary-600 hover:text-primary-500 flex items-center gap-1 group">
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentBooks.map((book, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={book.id} 
                  className="bg-white border border-slate-200 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer"
                >
                   <div className="w-full aspect-[3/4] bg-slate-50 rounded-2xl mb-6 flex items-center justify-center border border-slate-100 group-hover:bg-primary-50 transition-colors">
                      <Library className="w-10 h-10 text-slate-200 group-hover:text-primary-200" />
                   </div>
                   <h4 className="font-serif font-bold text-slate-800 line-clamp-1">{book.title}</h4>
                   <p className="text-xs text-slate-400 mt-1">{book.author}</p>
                </motion.div>
              ))}
           </div>
        </div>

        {/* Quick Tips/Action */}
        <div className="space-y-6">
           <h3 className="text-xl font-serif font-bold text-slate-800">Library Notice</h3>
           <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                 <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                    <TrendingUp className="w-6 h-6 text-primary-400" />
                 </div>
                 <h4 className="text-lg font-bold mb-3">Expand the Knowledge</h4>
                 <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Digital synchronization is active. All interactions are recorded for the integrity of the collective archive.
                 </p>
                 <button className="w-full py-4 bg-primary-600 hover:bg-primary-500 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/20">
                    Read Guidelines
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  color: 'primary' | 'blue' | 'amber';
}

function StatCard({ icon: Icon, label, value, sub, color }: StatCardProps) {
  const colors = {
    primary: "bg-primary-50 text-primary-600 border-primary-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all"
    >
      <div className={`p-4 rounded-2xl w-fit mb-6 border ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-0.5">{label}</p>
      <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{value}</h3>
      <p className="text-xs text-slate-400 mt-2 font-medium">{sub}</p>
    </motion.div>
  );
}
