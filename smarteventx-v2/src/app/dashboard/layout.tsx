"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Professional navigation bar with settings and logout in a 3-line menu
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <img src="/imglogo.jpeg" alt="EWE Logo" className="h-8 w-8 rounded-full object-contain responsive" />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  EWE
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              {user.role === 'user' && (
                <>
                  <Link href="/dashboard/user" className="text-gray-700 hover:text-primary-600 transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/user/services" className="text-gray-700 hover:text-primary-600 transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">
                    Services
                  </Link>
                </>
              )}
              
              {user.role === 'vendor' && (
                <>
                  <Link href="/dashboard/vendor" className="text-gray-700 hover:text-primary-600 transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/vendor/services" className="text-gray-700 hover:text-primary-600 transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">
                    My Services
                  </Link>
                </>
              )}
              
              {user.role === 'admin' && (
                <>
                  <Link href="/dashboard/admin" className="text-gray-700 hover:text-primary-600 transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/admin/services" className="text-gray-700 hover:text-primary-600 transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">
                    Services
                  </Link>
                  <Link href="/dashboard/admin/events" className="text-gray-700 hover:text-primary-600 transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">
                    Events
                  </Link>
                  {/* Book Vendor Service removed — booking happens on the Services page */}
                  {/* Vendor Tracking link removed as per user request */}
                </>
              )}
              
              {/* Settings and Logout Menu - Enhanced 3-line menu bar */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center text-gray-700 hover:text-primary-600 transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="none">
                      <Link
                        href={`/dashboard/${user.role}/settings`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile menu button - Enhanced with dark blue color */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <svg className={`h-6 w-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden bg-white shadow-lg dark:bg-gray-800`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user.role === 'user' && (
            <>
              <Link href="/dashboard/user" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 bg-blue-600 hover:bg-blue-700 text-white">
                Dashboard
              </Link>
              <Link href="/dashboard/user/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 bg-blue-600 hover:bg-blue-700 text-white">
                Services
              </Link>
            </>
          )}
          
          {user.role === 'vendor' && (
            <>
              <Link href="/dashboard/vendor" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 bg-blue-600 hover:bg-blue-700 text-white">
                Dashboard
              </Link>
              <Link href="/dashboard/vendor/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 bg-blue-600 hover:bg-blue-700 text-white">
                My Services
              </Link>
            </>
          )}
          
          {user.role === 'admin' && (
            <>
              <Link href="/dashboard/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 bg-blue-600 hover:bg-blue-700 text-white">
                Dashboard
              </Link>
              <Link href="/dashboard/admin/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 bg-blue-600 hover:bg-blue-700 text-white">
                Services
              </Link>
              <Link href="/dashboard/admin/events" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 bg-blue-600 hover:bg-blue-700 text-white">
                Events
              </Link>
              {/* Book Vendor Service removed — booking happens on the Services page */}
              {/* Vendor Tracking link removed as per user request */}
            </>
          )}
          
          <div className="border-t border-gray-200 my-2 dark:border-gray-700"></div>
          <Link 
            href={`/dashboard/${user.role}/settings`} 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            Settings
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div>
        {children}
      </div>
    </div>
  );
}