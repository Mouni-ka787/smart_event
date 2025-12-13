'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Not logged in, redirect to login
      router.push('/login');
      return;
    }

    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'vendor':
        router.push('/dashboard/vendor');
        break;
      case 'user':
        router.push('/dashboard/user');
        break;
      default:
        // Unknown role, redirect to home
        router.push('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
