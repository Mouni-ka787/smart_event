'use client';

import { useEffect } from 'react';

export default function TestMapPage() {
  useEffect(() => {
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log('Google Maps API Key:', apiKey);
    
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      console.error('Google Maps API key is not properly configured in environment variables');
      return;
    }
    
    // Try to load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
    };
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      console.error('Please check your API key configuration in Google Cloud Console');
      console.error('Make sure http://localhost:3001/* is added as an authorized referrer');
    };
    document.head.appendChild(script);
    
    return () => {
      // Clean up
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Google Maps API Test</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">API Key Status</h2>
          <p className="text-gray-600">
            Check the browser console for API key loading status.
          </p>
          <p className="text-gray-600 mt-2">
            If you see a RefererNotAllowedMapError, please ensure your API key in Google Cloud Console 
            has http://localhost:3001/* as an authorized referrer.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Fix RefererNotAllowedMapError</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Go to <a href="https://console.cloud.google.com/" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
            <li>Select your project</li>
            <li>Navigate to "APIs & Services" &gt; "Credentials"</li>
            <li>Find your API key and click "Edit"</li>
            <li>Under "Application restrictions", select "HTTP referrers (websites)"</li>
            <li>Add <code className="bg-gray-100 px-1 rounded">http://localhost:3001/*</code> to the list of authorized referrers</li>
            <li>Save your changes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}