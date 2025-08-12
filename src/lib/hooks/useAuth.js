// src/lib/hooks/useAuth.js (CREATE THIS NEW FILE)
// ============================================
// Custom hook to check authentication and role
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export function useAuth(requiredRole = null) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get token from cookie
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) {
          router.push('/login');
          return;
        }

        // Verify token on the server side by calling an API endpoint
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const userData = await response.json();
        
        // Check role if required
        if (requiredRole && userData.role !== requiredRole) {
          // Redirect to appropriate dashboard
          const redirectUrl = userData.role === 'teacher' 
            ? '/teacher/dashboard' 
            : '/assistant/dashboard';
          router.push(redirectUrl);
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [requiredRole, router]);

  return { user, loading };
}
