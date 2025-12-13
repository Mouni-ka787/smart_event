'use client';

import { useState, useEffect } from 'react';

export default function SimpleTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED'>('PENDING');
  const [eta, setEta] = useState<number | null>(null);

  // Start tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsTracking(true);
    setStatus('EN_ROUTE');
    
    // Watch position and update location
    navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setCurrentLocation(location);
        
        // Simulate ETA calculation (in a real app, this would come from the server)
        setEta(Math.floor(Math.random() * 30) + 5);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );
  };

  // Stop tracking
  const stopTracking = () => {
    setIsTracking(false);
    setStatus('ACCEPTED');
    setCurrentLocation(null);
    setEta(null);
  };

  // Mark as arrived
  const markAsArrived = () => {
    setStatus('ARRIVED');
    setEta(0);
  };

  // Mark as completed
  const markAsCompleted = () => {
    setStatus('COMPLETED');
    setIsTracking(false);
  };

  // Format ETA display
  const formatETA = (minutes: number | null) => {
    if (minutes === null) return 'Calculating...';
    if (minutes < 1) return 'Less than 1 minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Live Tracking</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Status</p>
          <p className="text-lg font-semibold text-blue-600 mt-1">
            {status.replace('_', ' ')}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-800">ETA</p>
          <p className="text-lg font-semibold text-green-600 mt-1">
            {formatETA(eta)}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-purple-800">Tracking</p>
          <p className="text-lg font-semibold text-purple-600 mt-1">
            {isTracking ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>
      
      {currentLocation && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-2">Current Location</h4>
          <p className="text-sm text-gray-600">
            Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-3">
        {!isTracking && status === 'PENDING' && (
          <button
            type="button"
            onClick={startTracking}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Start Tracking
          </button>
        )}
        
        {isTracking && status === 'EN_ROUTE' && (
          <button
            type="button"
            onClick={markAsArrived}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Mark Arrived
          </button>
        )}
        
        {status === 'ARRIVED' && (
          <button
            type="button"
            onClick={markAsCompleted}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Complete Service
          </button>
        )}
        
        {isTracking && (
          <button
            type="button"
            onClick={stopTracking}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Stop Tracking
          </button>
        )}
      </div>
      
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-900 mb-2">Instructions</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click "Start Tracking" when you begin traveling to the venue</li>
          <li>• Your location will be shared automatically while tracking is active</li>
          <li>• Click "Mark Arrived" when you reach the venue</li>
          <li>• Click "Complete Service" after finishing the service</li>
        </ul>
      </div>
    </div>
  );
}