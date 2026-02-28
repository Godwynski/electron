"use client";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { 
  ClipboardList, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw,
  Book,
  User as UserIcon,
  Loader2
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RequestWithDetails {
  id: string;
  book_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  created_at: string;
  book_title: string;
  user_email: string;
}

export default function RequestsPage() {
  const { user, role, loading } = useAuth(true);
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'returned' | 'rejected'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const isAdmin = role === 'admin';
  const isStaff = role === 'staff' || isAdmin;

  const fetchRequests = useCallback(async () => {
    // setIsLoading(true);
    let query = supabase
      .from('borrow_requests')
      .select(`
        *,
        books:book_id (title),
        profiles:user_id (email)
      `)
      .order('created_at', { ascending: false });

    if (!isStaff) {
      query = query.eq('user_id', user?.id);
    }

    const { data, error } = await query;
    
    if (error) console.error("Error fetching requests:", error.message);
    else {
      interface RawRequest {
        id: string;
        book_id: string;
        user_id: string;
        status: 'pending' | 'approved' | 'rejected' | 'returned';
        created_at: string;
        books: { title: string } | null;
        profiles: { email: string } | null;
      }

      const rawData = data as unknown as RawRequest[];
      const mapped = (rawData || []).map((r) => ({
        ...r,
        book_title: r.books?.title || 'Unknown Title',
        user_email: r.profiles?.email || 'Unknown User'
      })) as RequestWithDetails[];
      setRequests(mapped);
    }
    setIsLoading(false);
  }, [user, isStaff]);

  useEffect(() => {
    const init = async () => {
        if (!loading && user) {
            await fetchRequests();
        }
    };
    init();
  }, [loading, user, fetchRequests]);

  const handleAction = async (requestId: string, action: 'approve' | 'reject' | 'return') => {
    setIsProcessing(requestId);
    let error;

    if (action === 'approve') {
       const { error: err } = await supabase.rpc('approve_borrow_request', { request_id: requestId });
       error = err;
    } else if (action === 'return') {
       const { error: err } = await supabase.rpc('return_book', { request_id: requestId });
       error = err;
    } else {
       const { error: err } = await supabase.from('borrow_requests').update({ status: 'rejected' }).eq('id', requestId);
       error = err;
    }

    if (error) alert(error.message);
    else await fetchRequests();
    setIsProcessing(null);
  };

  const filtered = requests.filter(r => {
    const matchesSearch = r.book_title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading || isLoading) {
    return (
     <div className="flex items-center justify-center min-h-[60vh]">
       <div className="w-8 h-8 rounded-full border-t-2 border-primary-500 animate-spin" />
     </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-slate-800 tracking-tight">
            {isStaff ? "Borrow Request Pipeline" : "My Current Requests"}
          </h1>
          <p className="text-slate-500 mt-2 font-sans tracking-wide">
            {isStaff ? "Audit and process circulating resource allocation." : "Track the status of your library reservations."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search book or user..."
               className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none w-72 shadow-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
             <FilterBtn active={statusFilter === 'all'} label="All" onClick={() => setStatusFilter('all')} />
             <FilterBtn active={statusFilter === 'pending'} label="Pending" onClick={() => setStatusFilter('pending')} />
             <FilterBtn active={statusFilter === 'approved'} label="Approved" onClick={() => setStatusFilter('approved')} />
           </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource Archive</th>
                {isStaff && <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requester Identity</th>}
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status Index</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Activity Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filtered.map((req) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={req.id} 
                    className="group hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-primary-50 group-hover:text-primary-500 transition-all border border-slate-100">
                           <Book className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{req.book_title}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">ID: {req.book_id.slice(0, 8)}...</p>
                         </div>
                      </div>
                    </td>
                    {isStaff && (
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                               <UserIcon className="w-3.5 h-3.5" />
                             </div>
                             <span className="text-sm font-medium text-slate-600">{req.user_email}</span>
                          </div>
                        </td>
                    )}
                    <td className="px-8 py-6">
                       <div className="flex justify-center">
                          <StatusBadge status={req.status} />
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right font-sans">
                       <div className="flex items-center justify-end gap-6 h-full">
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-700">{new Date(req.created_at).toLocaleDateString()}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          
                          {/* Quick Actions (Staff Only and Status Specific) */}
                          <div className="flex items-center gap-2">
                             {isStaff && req.status === 'pending' && (
                                <>
                                  <button 
                                    disabled={isProcessing === req.id}
                                    onClick={() => handleAction(req.id, 'approve')}
                                    className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                  >
                                    {isProcessing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                  </button>
                                  <button 
                                    disabled={isProcessing === req.id}
                                    onClick={() => handleAction(req.id, 'reject')}
                                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                             )}
                             {isStaff && req.status === 'approved' && (
                                <button 
                                  disabled={isProcessing === req.id}
                                  onClick={() => handleAction(req.id, 'return')}
                                  className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 px-4 text-xs font-bold"
                                >
                                  {isProcessing === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                  RETURN
                                </button>
                             )}
                             
                             {!isStaff && req.status === 'returned' && (
                                <span className="text-[10px] font-bold text-slate-300 pointer-events-none">CLOSED</span>
                             )}
                          </div>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
              <ClipboardList className="w-12 h-12 stroke-[1.5]" />
              <div className="text-center">
                <p className="text-lg font-serif italic">No interaction records found.</p>
                <p className="text-sm mt-1">Adjust your filter or search terms to refine results.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterBtn({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: RequestWithDetails['status'] }) {
  const configs = {
    pending: { icon: Clock, bg: 'bg-orange-50', text: 'text-orange-600', label: 'Pending Audit' },
    approved: { icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-600', label: 'Active Loan' },
    returned: { icon: RotateCcw, bg: 'bg-blue-50', text: 'text-blue-600', label: 'Archived Return' },
    rejected: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-600', label: 'Denied Request' }
  };
  
  const config = configs[status];
  const Icon = config.icon;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${config.bg} ${config.text} border border-black/5`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
    </div>
  );
}
