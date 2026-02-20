"use client";

import { useStatus } from "@powersync/react";
import { Database, Search, Activity, Wifi, WifiOff, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const status = useStatus();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-medium text-white mb-2">Overview</h2>
          <p className="text-slate-400">Welcome back. Here is the status of the archives.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative group w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-500 transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search collections..."
            className="w-full bg-brand-800/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500/50 focus:bg-brand-800/80 transition-all font-medium"
          />
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-800/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Volumes</p>
              <h3 className="text-2xl font-bold text-white">0</h3>
            </div>
          </div>
          <div className="text-xs text-slate-500">Currently in local storage</div>
        </motion.div>

        {/* Stat Card 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-800/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Recent Activity</p>
              <h3 className="text-2xl font-bold text-white">0</h3>
            </div>
          </div>
          <div className="text-xs text-slate-500">Transactions today</div>
        </motion.div>

        {/* PowerSync Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-brand-800/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden"
        >
          {status.connected && (
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          )}
          
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className={`p-3 rounded-xl ${status.connected ? 'bg-primary-500/10' : 'bg-accent-500/10'}`}>
              {status.connected ? (
                <Wifi className="w-6 h-6 text-primary-400" />
              ) : (
                <WifiOff className="w-6 h-6 text-accent-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Sync Engine</p>
              <h3 className="text-2xl font-bold text-white">
                {status.connected ? 'Online' : 'Offline'}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs relative z-10">
             <span className="text-slate-500">
               {status.dataFlowStatus.uploading ? 'Pushing Data...' : 
                status.dataFlowStatus.downloading ? 'Pulling Updates...' : 
                'Up to date'}
             </span>
             {status.lastSyncedAt && (
               <span className="text-slate-600">
                 Last: {status.lastSyncedAt.toLocaleTimeString()}
               </span>
             )}
          </div>
        </motion.div>
      </div>
      
      {/* Main Panel */}
      <div className="bg-brand-800/20 border border-white/5 rounded-2xl p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
         <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-slate-500" />
         </div>
         <h3 className="text-xl font-medium text-white mb-2">The Archives are Empty</h3>
         <p className="text-slate-400 max-w-sm">
           You have successfully secured access. The sync engine is active and awaiting data models.
         </p>
      </div>

    </div>
  );
}
