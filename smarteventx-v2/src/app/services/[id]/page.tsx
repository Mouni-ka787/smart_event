'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import MapComponent from '@/components/MapComponent';

interface Location {
  lat: number;
  lng: number;
  timestamp?: Date;
}

export default function ServiceDetailPage() {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'view' | 'book' | 'tracking' | 'completed'>('view');
  const [bookingForm, setBookingForm] = useState({
    eventName: '',
    eventDate: '',
    guestCount: 1,
    venueAddress: '',
    venueLat: 0,
    venueLng: 0,
    specialRequests: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [vendorLocation, setVendorLocation] = useState<Location | undefined>(undefined);
  const [trackingInterval, setTrackingInterval] = useState<any>(null);
  // Add a new state for geocoding loading
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const serviceData = await api.services.getById(id as string);
        setService(serviceData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching service:', err);
        setError('Failed to load service: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

  const handleBookService = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setBookingStep('book');
  };

  const startRealTimeTracking = () => {
    // Clear any existing interval
    if (trackingInterval) {
      clearInterval(trackingInterval);
    }
    
    // Start new interval to simulate real-time updates
    const interval = setInterval(async () => {
      if (user && booking) {
        try {
          // In a real implementation, this would fetch actual vendor location updates
          // For now, we'll simulate movement toward the venue
          setVendorLocation((prev: Location | undefined) => {
            if (!prev) return prev;
            
            // Simulate movement toward venue (this is just for demo purposes)
            const venueLat = booking.venueLocation?.coordinates?.lat || 40.7128;
            const venueLng = booking.venueLocation?.coordinates?.lng || -74.0060;
            
            // Move 1/1000th of the distance toward venue each update
            const newLat = prev.lat + (venueLat - prev.lat) / 1000;
            const newLng = prev.lng + (venueLng - prev.lng) / 1000;
            
            return { lat: newLat, lng: newLng, timestamp: new Date() };
          });
        } catch (err) {
          console.error('Error updating vendor location:', err);
        }
      }
    }, 5000); // Update every 5 seconds
    
    setTrackingInterval(interval);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-geocode when address is entered
    if (name === 'venueAddress' && value.length > 5) {
      handleAddressChange(value);
    }
  };

  const handleAddressChange = async (address: string) => {
    if (!address || address.length < 5) return;
    
    try {
      setIsGeocoding(true);
      // In a real implementation, this would call an actual geocoding API
      // For now, we'll use the existing mock API but with a slight improvement
      const coords = await api.maps.getCoordinates(address);
      
      // Update the form with the coordinates
      setBookingForm(prev => ({
        ...prev,
        venueLat: coords.lat,
        venueLng: coords.lng
      }));
    } catch (err) {
      console.error('Error geocoding address:', err);
      // Don't show error to user for geocoding, just silently fail
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !service) return;

    try {
      setIsBooking(true);
      setError(null);

      // Create booking
      const bookingData: {
        serviceId: any;
        serviceName: any;
        eventDate: string;
        guestCount: number;
        venueAddress: string;
        venueLat: number;
        venueLng: number;
        specialRequests: string;
        debugMarker?: string; // Add this optional property
      } = {
        serviceId: service._id,
        serviceName: service.name,
        eventDate: bookingForm.eventDate,
        guestCount: bookingForm.guestCount,
        venueAddress: bookingForm.venueAddress,
        venueLat: bookingForm.venueLat,
        venueLng: bookingForm.venueLng,
        specialRequests: bookingForm.specialRequests
      };

      // Add a short debug marker so we can match frontend attempts to backend logs
      const debugMarker = `BOOKING_ATTEMPT:${Date.now()}:${Math.random().toString(36).slice(2,8)}`;
      bookingData.debugMarker = debugMarker;
      console.log('Booking debug marker:', debugMarker);

      const newBooking = await api.bookings.createServiceBooking(user.token, bookingData);
      setBooking(newBooking);
      setBookingStep('tracking');
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  const handleAcceptBooking = async () => {
    if (!user || !booking) return;

    try {
      const updatedBooking = await api.bookings.acceptBooking(user.token, booking._id);
      setBooking(updatedBooking);
    } catch (err: any) {
      console.error('Error accepting booking:', err);
      setError(err.message || 'Failed to accept booking');
    }
  };

  const handleStartService = async () => {
    if (!user || !booking) return;

    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const updatedBooking = await api.bookings.startService(user.token, booking._id, {
              lat: latitude,
              lng: longitude
            });
            setBooking(updatedBooking);
            // Set vendor location for tracking
            setVendorLocation({ lat: latitude, lng: longitude, timestamp: new Date() });
            
            // Start real-time tracking
            startRealTimeTracking();
          },
          (error) => {
            console.error('Error getting location:', error);
            setError('Failed to get current location');
          }
        );
      } else {
        setError('Geolocation is not supported by this browser');
      }
    } catch (err: any) {
      console.error('Error starting service:', err);
      setError(err.message || 'Failed to start service');
    }
  };

  const handleCompleteService = async () => {
    if (!user || !booking) return;

    try {
      // Stop real-time tracking
      if (trackingInterval) {
        clearInterval(trackingInterval);
        setTrackingInterval(null);
      }
      
      const updatedBooking = await api.bookings.completeService(user.token, booking._id);
      setBooking(updatedBooking);
      setBookingStep('completed');
    } catch (err: any) {
      console.error('Error completing service:', err);
      setError(err.message || 'Failed to complete service');
    }
  };

  const handleRefreshLocation = () => {
    // In a real implementation, this would fetch the latest vendor location
    // For now, we'll just show a message
    alert('Location refreshed! In a real app, this would show the latest vendor position.');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-2xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Service Not Found</h2>
          <p className="mt-2 text-gray-600">The service you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Provided by {service.vendor?.name || 'Unknown Vendor'}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Services
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Booking Steps */}
            {bookingStep !== 'view' && (
              <div className="mb-8">
                <nav aria-label="Progress">
                  <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
                    <li className="md:flex-1">
                      <div className={`group pl-4 py-2 flex flex-col border-l-4 ${bookingStep === 'book' ? 'border-indigo-600' : 'border-gray-200'} md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4`}>
                        <span className={`text-sm font-medium ${bookingStep === 'book' ? 'text-indigo-600' : 'text-gray-500'}`}>Book Service</span>
                        <span className="text-sm font-medium">Step 1</span>
                      </div>
                    </li>
                    <li className="md:flex-1">
                      <div className={`group pl-4 py-2 flex flex-col border-l-4 ${bookingStep === 'tracking' ? 'border-indigo-600' : bookingStep === 'completed' ? 'border-indigo-600' : 'border-gray-200'} md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4`}>
                        <span className={`text-sm font-medium ${bookingStep === 'tracking' || bookingStep === 'completed' ? 'text-indigo-600' : 'text-gray-500'}`}>Track Service</span>
                        <span className="text-sm font-medium">Step 2</span>
                      </div>
                    </li>
                    <li className="md:flex-1">
                      <div className={`group pl-4 py-2 flex flex-col border-l-4 ${bookingStep === 'completed' ? 'border-indigo-600' : 'border-gray-200'} md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4`}>
                        <span className={`text-sm font-medium ${bookingStep === 'completed' ? 'text-indigo-600' : 'text-gray-500'}`}>Complete</span>
                        <span className="text-sm font-medium">Step 3</span>
                      </div>
                    </li>
                  </ol>
                </nav>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Service Details or Booking Form */}
              <div className="lg:col-span-2">
                {bookingStep === 'view' && (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Service Information</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about this service.</p>
                    </div>
                    <div className="border-t border-gray-200">
                      <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Category</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{service.category}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Price</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            ${service.price} ({service.priceType})
                          </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {service.description}
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {service.vendor?.name || 'Unknown Vendor'}
                          </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Rating</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {service.rating ? `${service.rating.toFixed(1)}/5` : 'No ratings yet'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}

                {bookingStep === 'book' && (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Book This Service</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">Fill in the details to book this service.</p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <form onSubmit={handleSubmitBooking} className="space-y-6">
                        <div>
                          <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">
                            Event Name
                          </label>
                          <input
                            type="text"
                            name="eventName"
                            id="eventName"
                            value={bookingForm.eventName}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
                            Event Date
                          </label>
                          <input
                            type="date"
                            name="eventDate"
                            id="eventDate"
                            value={bookingForm.eventDate}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700">
                            Guest Count
                          </label>
                          <input
                            type="number"
                            name="guestCount"
                            id="guestCount"
                            min="1"
                            value={bookingForm.guestCount}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-700">
                            Venue Address
                          </label>
                          <div className="mt-1 relative">
                            <input
                              type="text"
                              name="venueAddress"
                              id="venueAddress"
                              value={bookingForm.venueAddress}
                              onChange={handleInputChange}
                              required
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {isGeocoding && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Enter your venue address. Latitude and longitude will be automatically populated.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="venueLat" className="block text-sm font-medium text-gray-700">
                              Latitude
                            </label>
                            <input
                              type="number"
                              name="venueLat"
                              id="venueLat"
                              step="any"
                              value={bookingForm.venueLat}
                              onChange={handleInputChange}
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="venueLng" className="block text-sm font-medium text-gray-700">
                              Longitude
                            </label>
                            <input
                              type="number"
                              name="venueLng"
                              id="venueLng"
                              step="any"
                              value={bookingForm.venueLng}
                              onChange={handleInputChange}
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
                            Special Requests
                          </label>
                          <textarea
                            name="specialRequests"
                            id="specialRequests"
                            rows={3}
                            value={bookingForm.specialRequests}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        {error && (
                          <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                  <p>{error}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setBookingStep('view')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isBooking}
                            className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                              isBooking 
                                ? 'bg-indigo-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                          >
                            {isBooking ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Booking...
                              </>
                            ) : (
                              'Book Service'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {(bookingStep === 'tracking' || bookingStep === 'completed') && booking && (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Booking Details</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">Track your service booking.</p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{booking.eventName}</h4>
                          <p className="text-sm text-gray-500">{new Date(booking.eventDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Vendor Location</p>
                            <p className="text-sm text-gray-500">
                              {vendorLocation 
                                ? `Lat: ${vendorLocation.lat.toFixed(6)}, Lng: ${vendorLocation.lng.toFixed(6)}` 
                                : 'Not available yet'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Event Venue</p>
                            <p className="text-sm text-gray-500">{booking.venueLocation?.address}</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">Estimated Arrival</span>
                            <span className="text-sm text-gray-900">
                              {booking.vendorTrackingInfo?.estimatedArrival 
                                ? `${Math.ceil((new Date(booking.vendorTrackingInfo.estimatedArrival).getTime() - Date.now()) / (1000 * 60))} minutes` 
                                : 'Not available yet'}
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: booking.vendorTrackingInfo?.status === 'COMPLETED' 
                                  ? '100%' 
                                  : booking.vendorTrackingInfo?.status === 'EN_ROUTE' 
                                    ? '65%' 
                                    : '0%' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {bookingStep === 'tracking' && (
                        <div className="mt-6 space-y-3">
                          {booking.status === 'pending' && user && (user.role === 'vendor' && booking.vendor && (booking.vendor._id === user._id || booking.vendor === user._id)) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-yellow-800">Vendor Action Required</h3>
                                  <div className="mt-2 text-sm text-yellow-700">
                                    <p>You need to accept this booking to proceed with the service.</p>
                                  </div>
                                  <div className="mt-4">
                                    <button
                                      onClick={handleAcceptBooking}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                      Accept Booking
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {booking.status === 'pending' && user && (user.role === 'admin' || user.role === 'user') && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-blue-800">Waiting for Vendor</h3>
                                  <div className="mt-2 text-sm text-blue-700">
                                    <p>Your booking is pending vendor confirmation. Please wait for the vendor to accept your booking.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {error && (
                            <div className="rounded-md bg-red-50 p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                                  <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3">
                            {booking.status === 'confirmed' && user && (user.role === 'vendor' && booking.vendor && (booking.vendor._id === user._id || booking.vendor === user._id)) && (
                              <button
                                onClick={handleStartService}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Start Service
                              </button>
                            )}
                            {booking.status === 'in_progress' && user && (user.role === 'vendor' && booking.vendor && (booking.vendor._id === user._id || booking.vendor === user._id)) && (
                              <button
                                onClick={handleCompleteService}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                              >
                                Complete Service
                              </button>
                            )}
                            <button
                              onClick={() => setBookingStep('view')}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Back to Service
                            </button>
                          </div>
                        </div>
                      )}

                      {bookingStep === 'completed' && (
                        <div className="mt-6">
                          <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Service Completed</h3>
                                <div className="mt-2 text-sm text-green-700">
                                  <p>Your service has been completed successfully.</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {booking.qrCode && user && (user.role === 'admin' && booking.user && (booking.user._id === user._id || booking.user === user._id)) && (
                            <div className="mt-6 text-center">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Payment QR Code</h4>
                              <div className="flex justify-center">
                                <img src={booking.qrCode} alt="Payment QR Code" className="h-48 w-48 responsive" />
                              </div>
                              <p className="mt-2 text-sm text-gray-500">
                                Scan this QR code to process payment
                              </p>
                              <div className="mt-4">
                                <button
                                  onClick={async () => {
                                    try {
                                      // Process payment with QR code
                                      const updatedBooking = await api.bookings.processServicePayment(user.token, booking._id);
                                      setBooking(updatedBooking);
                                      alert('Payment processed successfully!');
                                    } catch (err: any) {
                                      console.error('Error processing payment:', err);
                                      alert('Failed to process payment: ' + (err.message || 'Unknown error'));
                                    }
                                  }}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Process Payment
                                </button>
                              </div>
                            </div>
                          )}

                          {booking.qrCode && user && (user.role !== 'admin' || (booking.user && booking.user._id !== user._id && booking.user !== user._id)) && (
                            <div className="mt-6 text-center">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Payment QR Code</h4>
                              <div className="flex justify-center">
                                <img src={booking.qrCode} alt="Payment QR Code" className="h-48 w-48 responsive" />
                              </div>
                              <p className="mt-2 text-sm text-gray-500">
                                Service completed. Please contact the admin to process payment.
                              </p>
                            </div>
                          )}

                          <div className="mt-6">
                            <button
                              onClick={() => setBookingStep('view')}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Back to Service
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {bookingStep === 'view' && (
                  <div className="mt-6 flex space-x-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Contact Vendor
                    </button>
                  </div>
                )}
              </div>

              {/* Map and Location */}
              <div>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Location</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Service location information.</p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    {service.location?.address ? (
                      <>
                        <MapComponent 
                          address={service.location.address}
                          coordinates={
                            service.location.coordinates && service.location.coordinates.length === 2
                              ? { lat: service.location.coordinates[1], lng: service.location.coordinates[0] }
                              : undefined
                          }
                          height="300px"
                          venueLocation={
                            service.location.coordinates && service.location.coordinates.length === 2
                              ? { lat: service.location.coordinates[1], lng: service.location.coordinates[0] }
                              : undefined
                          }
                          vendorLocation={vendorLocation}
                        />
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Address</h4>
                          <p className="mt-1 text-sm text-gray-500">{service.location.address}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No location information available for this service.</p>
                    )}
                  </div>
                </div>

                {/* Live Tracking Section */}
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Live Tracking</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Track your vendor's location in real-time.</p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    {user ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Vendor Status</h4>
                            <p className="text-sm text-gray-500">
                              {booking 
                                ? `Tracking is active for your booking` 
                                : 'Book a service to enable tracking'}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">Vendor Location</p>
                              <p className="text-sm text-gray-500">
                                {vendorLocation 
                                  ? `Updated just now` 
                                  : 'Not available yet'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">Event Venue</p>
                              <p className="text-sm text-gray-500">Your event location</p>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-900">Estimated Arrival</span>
                              <span className="text-sm text-gray-900">
                                {booking?.vendorTrackingInfo?.estimatedArrival 
                                  ? `${Math.ceil((new Date(booking.vendorTrackingInfo.estimatedArrival).getTime() - Date.now()) / (1000 * 60))} minutes` 
                                  : 'Not available yet'}
                              </span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: booking?.vendorTrackingInfo?.status === 'COMPLETED' 
                                    ? '100%' 
                                    : booking?.vendorTrackingInfo?.status === 'EN_ROUTE' 
                                      ? '65%' 
                                      : '0%' 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={handleRefreshLocation}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Refresh Location
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Login to Enable Live Tracking</h3>
                        <p className="mt-1 text-sm text-gray-500">You need to be logged in to view live tracking information.</p>
                        <div className="mt-6">
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => router.push('/login')}
                          >
                            Login
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vendor Information */}
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Vendor Information</h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-bold">
                            {service.vendor?.name?.charAt(0) || 'V'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{service.vendor?.name || 'Unknown Vendor'}</h4>
                        <p className="text-sm text-gray-500">
                          {service.vendor?.reviewCount || 0} reviews
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Vendor Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}