'use client';

import { useEffect } from 'react';

export default function TestSettingsPage() {
  useEffect(() => {
    // Test theme functionality
    const testTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      console.log('Current theme:', savedTheme);
      
      // Test changing theme
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      console.log('Theme changed to dark');
      
      // Test language functionality
      const savedLanguage = localStorage.getItem('language');
      console.log('Current language:', savedLanguage);
      
      // Test notification settings
      const emailNotifications = localStorage.getItem('emailNotifications');
      console.log('Email notifications:', emailNotifications);
    };
    
    testTheme();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings Test Page</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-8">
          This page tests the settings functionality. Check the browser console for output.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Theme Test</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This section tests the dark mode functionality.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Enable Dark Mode
              </button>
              <button 
                onClick={() => {
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Enable Light Mode
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Language Test</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This section tests the language settings.
            </p>
            <select 
              onChange={(e) => {
                localStorage.setItem('language', e.target.value);
                console.log('Language changed to:', e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
        
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notification Settings Test</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
              <button 
                onClick={() => {
                  const currentValue = localStorage.getItem('emailNotifications') === 'true';
                  localStorage.setItem('emailNotifications', String(!currentValue));
                  console.log('Email notifications:', !currentValue);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Toggle
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">SMS Notifications</span>
              <button 
                onClick={() => {
                  const currentValue = localStorage.getItem('smsNotifications') === 'true';
                  localStorage.setItem('smsNotifications', String(!currentValue));
                  console.log('SMS notifications:', !currentValue);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Toggle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}