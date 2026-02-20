"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function useAuth(requireAuth: boolean = false) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error fetching session:", error.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      
      if (requireAuth && !session) {
        router.push('/');
      } else if (!requireAuth && session) {
        // If we don't require auth (e.g. login page), redirect away from login if already authenticated
        router.push('/dashboard');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT' && requireAuth) {
           router.push('/');
        } else if (event === 'SIGNED_IN' && !requireAuth) {
           router.push('/dashboard');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [requireAuth, router]);

  return { user, session, loading };
}
