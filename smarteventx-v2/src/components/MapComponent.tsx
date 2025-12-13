'use client';

import { useEffect, useRef, memo } from 'react';

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

interface MapComponentProps {
  address: string;
  coordinates?: { lat: number; lng: number };
  height?: string;
  // Add live tracking props
  vendorLocation?: { lat: number; lng: number; timestamp?: Date };
  venueLocation?: { lat: number; lng: number };
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

const MapComponent = ({ 
  address, 
  coordinates, 
  height = '400px',
  vendorLocation,
  venueLocation,
  onLocationUpdate
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const vendorMarkerInstance = useRef<any>(null);
  const venueMarkerInstance = useRef<any>(null);
  const polylineInstance = useRef<any>(null);

  // Function to load Google Maps script
  const loadGoogleMaps = (callback: () => void) => {
    // Check if we're in a browser environment and Google Maps is already loaded
    if (typeof window !== 'undefined' && window.google) {
      callback();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // If script exists, wait for it to load
      existingScript.addEventListener('load', callback);
      return;
    }

    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // If no API key is provided, use a fallback approach
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      console.warn('Google Maps API key not found in environment variables. Using fallback approach.');
      // Call callback to prevent blocking the UI
      callback();
      return;
    }

    const script = document.createElement('script');
    // Include additional parameters to help with debugging and use weekly version
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = callback;
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      console.error('This may be due to API key restrictions or network issues.');
      console.error('Please ensure your API key is properly configured in the Google Cloud Console.');
      console.error('The key must be authorized for http://localhost:3001/* as a referrer.');
      // Show fallback map
      showFallbackMap();
      // Call callback anyway to prevent blocking the UI
      callback();
    };
    document.head.appendChild(script);
  };

  // Function to initialize the map
  const initMap = () => {
    // Check if Google Maps is available
    if (typeof window === 'undefined' || !window.google) {
      console.warn('Google Maps not available. Map functionality will be limited.');
      // Show a static map or informative message
      showFallbackMap();
      return;
    }

    if (!mapRef.current) return;

    const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York City
    const location = coordinates || defaultLocation;

    try {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: location,
      });

      // Add main marker for the event/service location
      markerInstance.current = new window.google.maps.Marker({
        position: location,
        map: mapInstance.current,
        title: address || 'Event Location',
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>Event Location</strong><br>${address || 'Address not provided'}</div>`,
      });

      markerInstance.current.addListener('click', () => {
        infoWindow.open(mapInstance.current, markerInstance.current);
      });

      // Add venue marker if provided
      if (venueLocation) {
        venueMarkerInstance.current = new window.google.maps.Marker({
          position: venueLocation,
          map: mapInstance.current,
          title: 'Event Venue',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          }
        });
      }

      // Update map with vendor location if provided
      updateVendorLocation();
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      showFallbackMap();
    }
  };

  // Function to show a fallback map or message
  const showFallbackMap = () => {
    if (mapRef.current) {
      // Clear any existing content
      mapRef.current.innerHTML = '';
      
      // Create container
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.height = '100%';
      container.style.backgroundColor = '#f3f4f6';
      container.style.borderRadius = '0.5rem';
      container.style.position = 'relative';
      
      // Create content div
      const contentDiv = document.createElement('div');
      contentDiv.style.textAlign = 'center';
      contentDiv.style.padding = '1rem';
      
      // Create title
      const title = document.createElement('p');
      title.style.color = '#6b7280';
      title.style.fontSize = '0.875rem';
      title.style.fontWeight = '500';
      title.textContent = 'Map Unavailable';
      
      // Create message
      const message = document.createElement('p');
      message.style.color = '#9ca3af';
      message.style.fontSize = '0.75rem';
      message.style.marginTop = '0.25rem';
      message.textContent = 'Google Maps API not configured properly';
      
      // Create instructions
      const instructions = document.createElement('p');
      instructions.style.color = '#9ca3af';
      instructions.style.fontSize = '0.75rem';
      instructions.style.marginTop = '0.25rem';
      instructions.innerHTML = 'Add <strong>http://localhost:3001/*</strong> as authorized referrer in Google Cloud Console';
      
      // Append elements
      contentDiv.appendChild(title);
      contentDiv.appendChild(message);
      contentDiv.appendChild(instructions);
      container.appendChild(contentDiv);
      mapRef.current.appendChild(container);
    }
  };

  // Function to update vendor location on the map
  const updateVendorLocation = () => {
    if (!mapInstance.current || !vendorLocation) return;

    // Remove existing vendor marker if it exists
    if (vendorMarkerInstance.current) {
      vendorMarkerInstance.current.setMap(null);
    }

    // Add new vendor marker
    vendorMarkerInstance.current = new window.google.maps.Marker({
      position: vendorLocation,
      map: mapInstance.current,
      title: 'Vendor Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#0F9D58',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      }
    });

    // Add info window for vendor
    const vendorInfoWindow = new window.google.maps.InfoWindow({
      content: `<div><strong>Vendor Location</strong><br>Updated: ${vendorLocation.timestamp ? new Date(vendorLocation.timestamp).toLocaleTimeString() : 'Just now'}</div>`,
    });

    vendorMarkerInstance.current.addListener('click', () => {
      vendorInfoWindow.open(mapInstance.current, vendorMarkerInstance.current);
    });

    // Draw route line if both vendor and venue locations are available
    if (vendorLocation && venueLocation) {
      // Remove existing polyline if it exists
      if (polylineInstance.current) {
        polylineInstance.current.setMap(null);
      }

      // Create new polyline
      polylineInstance.current = new window.google.maps.Polyline({
        path: [
          { lat: vendorLocation.lat, lng: vendorLocation.lng },
          { lat: venueLocation.lat, lng: venueLocation.lng }
        ],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      polylineInstance.current.setMap(mapInstance.current);

      // Center map on both points
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: vendorLocation.lat, lng: vendorLocation.lng });
      bounds.extend({ lat: venueLocation.lat, lng: venueLocation.lng });
      mapInstance.current.fitBounds(bounds);
    }
  };

  // Set up the map initialization callback
  useEffect(() => {
    window.initMap = initMap;
  }, []);

  // Initialize map when component mounts or address/coordinates change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadGoogleMaps(() => {
        // Small delay to ensure Google Maps is fully loaded
        setTimeout(() => {
          try {
            initMap();
          } catch (error) {
            console.error('Error during map initialization:', error);
          }
        }, 100);
      });
    }

    return () => {
      // Clean up global callback
      if (typeof window !== 'undefined') {
        window.initMap = undefined;
      }
    };
  }, [address, coordinates, venueLocation]);

  // Update vendor location when it changes
  useEffect(() => {
    if (vendorLocation) {
      updateVendorLocation();
    }
  }, [vendorLocation]);

  return (
    <div>
      <div 
        ref={mapRef} 
        style={{ height: height, width: '100%', borderRadius: '0.5rem' }}
        className="border border-gray-300"
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Location: {address || 'Address not provided'}
        </p>
        {vendorLocation && (
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs text-gray-600">Live tracking active</span>
          </div>
        )}
      </div>
      
      {/* Live tracking info */}
      {vendorLocation && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-blue-800">Live Tracking</p>
              <p className="text-xs text-blue-600">
                Updated: {vendorLocation.timestamp ? new Date(vendorLocation.timestamp).toLocaleTimeString() : 'Just now'}
              </p>
            </div>
            <button 
              onClick={() => {
                if (onLocationUpdate && navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      onLocationUpdate({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                      });
                    },
                    (error) => {
                      console.error('Error getting location:', error);
                    }
                  );
                }
              }}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MapComponent, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.address === nextProps.address &&
    prevProps.height === nextProps.height &&
    // Compare coordinates
    prevProps.coordinates?.lat === nextProps.coordinates?.lat &&
    prevProps.coordinates?.lng === nextProps.coordinates?.lng &&
    // Compare venueLocation
    prevProps.venueLocation?.lat === nextProps.venueLocation?.lat &&
    prevProps.venueLocation?.lng === nextProps.venueLocation?.lng &&
    // Compare vendorLocation (only lat/lng, not timestamp to prevent frequent updates)
    prevProps.vendorLocation?.lat === nextProps.vendorLocation?.lat &&
    prevProps.vendorLocation?.lng === nextProps.vendorLocation?.lng
  );
});