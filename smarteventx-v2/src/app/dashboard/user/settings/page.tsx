'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Settings from '@/components/dashboard/Settings';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UserSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { translate } = useLanguage();

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Page Header */}
        <div className="bg-white shadow-sm dark:bg-gray-800">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{translate('settings_title')}</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {translate('settings_manage')}
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/user')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                {translate('back_to_dashboard')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main>
          <Settings />
        </main>
      </div>
    </ProtectedRoute>
  );
}