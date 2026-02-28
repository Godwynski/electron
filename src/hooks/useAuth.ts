import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

export function useAuth(requireAuth: boolean = false) {
  const { user, session, role, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !session) {
        router.push('/');
      } else if (!requireAuth && session) {
        // Only redirect from landing if we have a session
        router.push('/dashboard');
      }
    }
  }, [requireAuth, router, session, loading]);

  return { user, session, role, loading };
}
