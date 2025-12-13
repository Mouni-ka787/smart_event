"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    const defaultTitle = 'EWE';

    // Pre-defined titles for cleaner mapping
    const titleMap: { [key: string]: string } = {
      '/': defaultTitle,
      '/about': 'About Us',
      '/services': 'Services',
      '/vendors': 'Vendors',
      '/events': 'Events',
      '/login': 'Login',
      '/register': 'Register',
      '/dashboard': 'Dashboard',
      '/dashboard/admin': 'Admin Dashboard',
      '/dashboard/user': 'User Dashboard',
      '/dashboard/vendor': 'Vendor Dashboard',
    };

    // Check for a direct match in the map
    if (titleMap[pathname]) {
      return titleMap[pathname];
    }

    // Handle dynamic routes (e.g., /events/[id], /booking/123)
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 1) {
        const parentPath = `/${pathSegments[0]}`;
        if (titleMap[parentPath]) {
            // For a path like /events/some-event-id, return the parent title, "Events"
            return titleMap[parentPath];
        }
    }
    
    // Fallback for any other page not in the map
    if (pathSegments.length > 0) {
        const title = pathSegments[0];
        // Capitalize the first letter for a clean title
        return title.charAt(0).toUpperCase() + title.slice(1);
    }

    return defaultTitle;
  };
  
  const pageTitle = getPageTitle();

  useEffect(() => {
    // Close mobile menu on path change
    setIsMenuOpen(false);
  }, [pathname]);


  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300 bg-slate-50 dark:bg-slate-900 backdrop-blur-sm shadow-md border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img src="/imglogo.jpeg" alt="SmartEventX Logo" className="h-10 w-10 rounded-full object-contain responsive" />
              <span className="ml-3 text-xl font-bold text-gray-800 dark:text-white">{pageTitle}</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-theme-accent dark:hover:text-theme-accent transition-colors font-medium">
              Home
            </Link>
            <Link href="/services" className="text-gray-600 dark:text-gray-300 hover:text-theme-accent dark:hover:text-theme-accent transition-colors font-medium">
              Services
            </Link>
            <Link href="/vendors" className="text-gray-600 dark:text-gray-300 hover:text-theme-accent dark:hover:text-theme-accent transition-colors font-medium">
              Vendors
            </Link>
            <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-theme-accent dark:hover:text-theme-accent transition-colors font-medium">
              About
            </Link>
          </nav>
          
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-theme-accent dark:hover:text-theme-accent transition-colors font-medium">
              Sign in
            </Link>
            <Link href="/register" className="btn btn-accent btn-responsive">
              Sign up
            </Link>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-theme-accent dark:hover:text-theme-accent focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className={`h-6 w-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden bg-white dark:bg-gray-800 shadow-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-theme-accent">
            Home
          </Link>
          <Link href="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-theme-accent">
            Services
          </Link>
          <Link href="/vendors" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-theme-accent">
            Vendors
          </Link>
          <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-theme-accent">
            About
          </Link>
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
          <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-theme-accent">
            Sign in
          </Link>
          <Link href="/register" className="block w-full text-center px-3 py-2 rounded-md text-base font-medium btn btn-accent btn-responsive mt-2">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}