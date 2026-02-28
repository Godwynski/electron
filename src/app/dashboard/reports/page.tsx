"use client";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { 
  BarChart3, 
  TrendingUp, 
  Users as UsersIcon, 
  Clock, 
  BookOpen, 
  AlertCircle,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  FileSpreadsheet,
  CheckCircle,
  Archive
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const { user, role, loading } = useAuth(true);
  const [reportData, setReportData] = useState<ReportStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  interface ReportStats {
    finesCount?: number;
    totalFines?: number;
    pendingRequests?: number;
    approvedRequests?: number;
    totalUsers?: number;
    totalBooks?: number;
    totalRequests?: number;
    totalRevenue?: number;
  }

  const isAdmin = role === 'admin';
  const isStaff = role === 'staff' || isAdmin;
  const isBorrower = role === 'borrower';

  const fetchReportData = useCallback(async () => {
    // setIsRefreshing(true); // Removing to avoid synchronous setState in effect
    
    if (isBorrower) {
        // Fetch personal borrowing stats & fines
        const { data: myFines } = await supabase.from('fines').select('*').eq('user_id', user?.id);
        const { data: myRequests } = await supabase.from('borrow_requests').select('status').eq('user_id', user?.id);
        
        setReportData({
            finesCount: myFines?.length || 0,
            totalFines: myFines?.reduce((acc: number, f: { amount: string }) => acc + parseFloat(f.amount), 0) || 0,
            pendingRequests: myRequests?.filter((r: { status: string }) => r.status === 'pending').length || 0,
            approvedRequests: myRequests?.filter((r: { status: string }) => r.status === 'approved').length || 0
        });
    } else if (isStaff || isAdmin) {
        // Simple aggregates
        const { count: usersCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true });
        const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
        const { count: requestCount } = await supabase.from('borrow_requests').select('*', { count: 'exact', head: true });
        const { data: fines } = await supabase.from('fines').select('amount');

        setReportData({
            totalUsers: usersCount || 0,
            totalBooks: booksCount || 0,
            totalRequests: requestCount || 0,
            totalRevenue: fines?.reduce((acc: number, f: { amount: string }) => acc + parseFloat(f.amount), 0) || 0
        });
    }
    setIsRefreshing(false);
  }, [user, isAdmin, isStaff, isBorrower]);

  useEffect(() => {
    const init = async () => {
      if (!loading && user) {
        await fetchReportData();
      }
    };
    init();
  }, [loading, user, fetchReportData]);

  if (loading || isRefreshing) {
    return (
     <div className="flex items-center justify-center min-h-[60vh]">
       <div className="w-8 h-8 rounded-full border-t-2 border-primary-500 animate-spin" />
     </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-slate-800 tracking-tight">System Intelligence</h1>
          <p className="text-slate-500 mt-2 font-sans tracking-wide">
            {isAdmin ? "Full organizational oversight and system health." : 
             isStaff ? "Operational trends and library circulation metrics." : 
             "Personal archive activity and financial standing."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium shadow-sm">
             <Filter className="w-4 h-4" />
             Last 30 Days
           </button>
           <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-medium shadow-lg shadow-slate-200/50">
             <Download className="w-4 h-4" />
             Export Report
           </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isBorrower ? (
          <>
            <StatCard icon={Clock} label="Pending Borrows" value={reportData?.pendingRequests} color="bg-orange-50 text-orange-600" trend="+12%" up />
            <StatCard icon={CheckCircle} label="Active Loans" value={reportData?.approvedRequests} color="bg-green-50 text-green-600" trend="+2" up />
            <StatCard icon={CreditCard} label="Outstanding Fines" value={`₱${reportData?.totalFines}`} color="bg-red-50 text-red-600" trend="Clear soon" up={false} />
            <StatCard icon={TrendingUp} label="Trust Score" value="98/100" color="bg-blue-50 text-blue-600" trend="High" up />
          </>
        ) : (
          <>
            <StatCard icon={UsersIcon} label="Total Members" value={reportData?.totalUsers} color="bg-primary-50 text-primary-600" trend="+14% MoM" up />
            <StatCard icon={BookOpen} label="Total Titles" value={reportData?.totalBooks} color="bg-blue-50 text-blue-600" trend="+20 new" up />
            <StatCard icon={Clock} label="Active Requests" value={reportData?.totalRequests} color="bg-orange-50 text-orange-600" trend="-5% vs LW" up={false} />
            <StatCard icon={CreditCard} label="Fines Incurred" value={`₱${reportData?.totalRevenue}`} color="bg-slate-900 text-white" trend="+₱42 today" up />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section (Mock Visual) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-800">Circulation Activity</h3>
                <p className="text-sm text-slate-400 mt-1">Daily interaction volume over the last month.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
           </div>
           
           {/* Mock Visualization placeholders */}
           <div className="h-64 flex items-end gap-3 pb-2 pt-10">
              {[60, 45, 80, 55, 30, 95, 70, 85, 40, 65, 50, 90, 35, 75].map((h, i) => (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.05, duration: 0.8 }}
                  key={i} 
                  className={`flex-1 rounded-t-lg transition-all border border-transparent hover:border-white hover:shadow-lg ${i % 2 === 0 ? 'bg-primary-500' : 'bg-slate-100'}`}
                />
              ))}
           </div>
           <div className="flex justify-between mt-6 px-1">
              {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w) => (
                <span key={w} className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">{w}</span>
              ))}
           </div>
        </div>

        {/* Secondary Section */}
        <div className="space-y-8">
             {/* Report Types for Admin / Staff */}
             {(isAdmin || isStaff) && (
               <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                  <h3 className="text-xl font-serif font-bold mb-6">Generated Modules</h3>
                  <div className="space-y-4">
                    <ReportDownloadItem label="User Demographics" icon={UsersIcon} />
                    <ReportDownloadItem label="Inventory Aging" icon={Archive} />
                    <ReportDownloadItem label="Financial Statement" icon={FileSpreadsheet} />
                    {isAdmin && <ReportDownloadItem label="System Audit Logs" icon={AlertCircle} premium />}
                  </div>
               </div>
             )}

             {/* Personal Summary for Borrowers */}
             {isBorrower && (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                   <h3 className="text-xl font-serif font-bold text-slate-800 mb-6">Record Health</h3>
                   <div className="space-y-6">
                      <ProgressItem label="Profile Completeness" val={85} color="bg-primary-500" />
                      <ProgressItem label="Timed Returns" val={92} color="bg-green-500" />
                      <ProgressItem label="Resource Care" val={100} color="bg-blue-500" />
                   </div>
                </div>
             )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined;
  color: string;
  trend: string;
  up: boolean;
}

function StatCard({ icon: Icon, label, value, color, trend, up }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${color} border border-white/10 shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-bold tracking-tight px-2 py-1 rounded-lg ${up ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'}`}>
          {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-0.5">{label}</p>
        <h4 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h4>
      </div>
    </motion.div>
  );
}

function ReportDownloadItem({ label, icon: Icon, premium }: { label: string, icon: React.ElementType, premium?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-400 group-hover:text-primary-400 transition-colors" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {premium && (
        <span className="text-[10px] font-bold bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded uppercase tracking-tighter">Admin</span>
      )}
    </div>
  );
}

function ProgressItem({ label, val, color }: { label: string, val: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-slate-700">{val}%</span>
      </div>
      <div className="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${val}%` }}
          transition={{ duration: 1.5, type: 'spring' }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
