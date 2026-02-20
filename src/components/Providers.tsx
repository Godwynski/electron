"use client";

import { useEffect, useState } from 'react';
import { PowerSyncContext } from '@powersync/react';
import { powerSync, initPowerSync } from '@/lib/powersync/db';
import { supabase } from '@/lib/supabase';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [init, setInit] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

    if (!isElectron) {
      console.log("Running in standard web browser. Bypassing offline PowerSync initialization.");
      const t = setTimeout(() => setInit(true), 0);
      return () => clearTimeout(t); 
    }

    initPowerSync().then(() => {
      setInit(true);
    }).catch((err) => {
      console.error("Failed to initialize PowerSync:", err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        if (isElectron) await powerSync.disconnect();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <PowerSyncContext.Provider value={powerSync}>
      {init ? children : (
        <div className="min-h-screen bg-brand-900 flex items-center justify-center">
          <p className="text-primary-500 font-medium tracking-wide">Initializing Offline Library Space...</p>
        </div>
      )}
    </PowerSyncContext.Provider>
  );
}
