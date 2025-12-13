'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/services/api';
import MapComponent from '@/components/MapComponent';
import QRScanner from '@/components/QRScanner';

// Debounce function to limit how often a function can run
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function UserDashboard() {
  const router = useRouter();
  const { translate } = useLanguage();
  const [adminPackages, setAdminPackages] = useState<any[]>([]);
  const [adminServices, setAdminServices] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedQRData, setScannedQRData] = useState<string | null>(null);
  const [bookingToPay, setBookingToPay] = useState<any>(null);

  // Centralized data fetching function
  const fetchData = useCallback(async () => {
    try {
      setApiError(null);
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      
      // Use Promise.all for concurrent fetching
      const [eventsResponse, servicesResponse, bookingsResponse] = await Promise.all([
        api.events.getAll(),
        api.services.getAll(),
        api.bookings.getUserBookings(user.token),
      ]);

      setAdminPackages(eventsResponse.events || []);
      const adminOnlyServices = (servicesResponse.services || []).filter(
        (service: any) => !service.vendor
      );
      setAdminServices(adminOnlyServices);
      setMyBookings(bookingsResponse.bookings || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setApiError(error.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial data when component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up interval for refreshing bookings
  useEffect(() => {
    const interval = setInterval(() => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        api.bookings.getUserBookings(user.token)
          .then(response => {
            setMyBookings(response.bookings || []);
            setApiError(null);
          })
          .catch(error => {
            console.error('Error refreshing bookings:', error);
            setApiError(error.message || 'Failed to refresh bookings.');
          });
      }
    }, 30000); // Refresh every 30 seconds instead of 10 for better performance

    return () => clearInterval(interval);
  }, [fetchData]);

  // Debounced tracking data fetch function
  const debouncedFetchTrackingData = useCallback(debounce(async () => {
    if (!selectedBooking || !showTrackingModal) return;

    try {
      setIsRefreshing(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const tracking = await api.bookings.getTracking(user.token, selectedBooking._id);
      setTrackingData(tracking);

      if (tracking.adminTracking) {
        setSelectedBooking((prev: any) => ({
          ...prev,
          adminTrackingInfo: tracking.adminTracking,
          qrCode: tracking.qrCode,
          qrData: tracking.qrData,
          status: tracking.status,
          paymentStatus: tracking.paymentStatus,
        }));
      }
      setRefreshCountdown(30);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, 500), [selectedBooking, showTrackingModal]); // 500ms debounce

  // Auto-refresh tracking data
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    if (showTrackingModal && selectedBooking) {
      debouncedFetchTrackingData();
      
      refreshInterval = setInterval(debouncedFetchTrackingData, 30000);

      countdownInterval = setInterval(() => {
        setRefreshCountdown(prev => (prev > 10 ? prev - 10 : 30));
      }, 10000);
    }

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [showTrackingModal, selectedBooking, debouncedFetchTrackingData]);

  const handleManualRefresh = () => {
    debouncedFetchTrackingData();
  };

  const processPayment = async (booking: any, qrData?: string) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      // Use provided QR data or fall back to booking QR data
      const qrDataToUse = qrData || booking.qrData;
      
      if (!qrDataToUse) {
        alert('No QR data available for payment processing');
        return;
      }

      // Process payment with the QR data
      await api.bookings.processPayment(user.token, booking._id, qrDataToUse);
      alert('Payment processed successfully!');
      fetchData(); // Refresh all data after payment
    } catch (error: any) {
      alert('Payment failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleQRScan = (data: string | null) => {
    if (data && bookingToPay) {
      setScannedQRData(data);
      processPayment(bookingToPay, data);
    }
  };

  const openQRScanner = (booking: any) => {
    setBookingToPay(booking);
    setShowQRScanner(true);
  };

  const openTrackingModal = async (booking: any) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const tracking = await api.bookings.getTracking(user.token, booking._id);
      setSelectedBooking({
        ...booking,
        qrCode: tracking.qrCode,
        qrData: tracking.qrData,
        adminTrackingInfo: tracking.adminTracking,
        status: tracking.status,
        paymentStatus: tracking.paymentStatus,
      });
      setShowTrackingModal(true);
    } catch (error) {
      console.error('Error fetching booking data:', error);
      setSelectedBooking(booking);
      setShowTrackingModal(true);
    }
  };

  const mapComponentProps = useMemo(() => {
    if (!selectedBooking) return null;

    return {
      address: selectedBooking.venueLocation?.address || 'Venue',
      coordinates: selectedBooking.venueLocation?.coordinates,
      height: "300px",
      vendorLocation: selectedBooking.adminTrackingInfo?.currentLocation?.coordinates 
        ? {
            lat: selectedBooking.adminTrackingInfo.currentLocation.coordinates[1],
            lng: selectedBooking.adminTrackingInfo.currentLocation.coordinates[0],
          }
        : undefined,
      venueLocation: selectedBooking.venueLocation?.coordinates,
    };
  }, [selectedBooking]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRScanner 
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />
        )}
        
        {/* Page Header */}
        <div className="bg-white shadow-sm dark:bg-gray-800">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{translate('user_dashboard_title')}</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {translate('user_dashboard_welcome')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {apiError && (
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{apiError}</p>
                    <p className="mt-2">Please make sure the backend server is running on port 3001.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {/* Available Packages */}
                <div className="bg-white overflow-hidden shadow rounded-xl transform transition duration-300 hover:scale-105 dark:bg-gray-800">
                  <div className="px-4 py-5 sm:p-6">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">Available Packages</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{adminPackages.length}</dd>
                    </dl>
                  </div>
                </div>
                {/* Completed Bookings */}
                <div className="bg-white overflow-hidden shadow rounded-xl transform transition duration-300 hover:scale-105 dark:bg-gray-800">
                  <div className="px-4 py-5 sm:p-6">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{translate('completed_bookings')}</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{myBookings.filter(b => b.status === 'completed').length}</dd>
                    </dl>
                  </div>
                </div>
                {/* Pending Payments */}
                <div className="bg-white overflow-hidden shadow rounded-xl transform transition duration-300 hover:scale-105 dark:bg-gray-800">
                  <div className="px-4 py-5 sm:p-6">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{translate('pending_payments')}</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                        ${myBookings.filter(b => b.paymentStatus !== 'paid').reduce((acc, b) => acc + b.totalPrice, 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
                {/* Admin Services */}
                <div className="bg-white overflow-hidden shadow rounded-xl transform transition duration-300 hover:scale-105 dark:bg-gray-800">
                  <div className="px-4 py-5 sm:p-6">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">Admin Services</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{adminServices.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* My Bookings */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">My Bookings</h2>
                    <div className="bg-white shadow rounded-xl overflow-hidden dark:bg-gray-800">
                      {myBookings.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No bookings yet. Book a package to get started!</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {myBookings.map((booking: any) => (
                            <li key={booking._id} className="px-4 py-4 sm:px-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                                      {booking.eventName || booking.event?.name || 'Event'}
                                    </p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        booking.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {booking.status}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">Event Date:</span> {new Date(booking.eventDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">Venue:</span> {booking.venueLocation?.address || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">Price:</span> ${booking.totalPrice || 0}
                                    </p>
                                  </div>
                                  <div className="mt-3 flex space-x-2">
                                    {booking.status === 'in_progress' && (
                                      <button
                                        onClick={() => openTrackingModal(booking)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                      >
                                        🗺️ Track Live
                                      </button>
                                    )}
                                    {booking.status === 'completed' && booking.qrData && (
                                      <button
                                        onClick={() => openQRScanner(booking)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                      >
                                        💳 Pay Now
                                      </button>
                                    )}
                                    <button
                                      onClick={() => openTrackingModal(booking)}
                                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                      📱 Show Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-8">
                  {/* Available Packages */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Available Packages</h2>
                    <div className="space-y-4 mt-4">
                      {adminPackages.slice(0, 3).map((pkg: any) => (
                        <div key={pkg._id} className="bg-white overflow-hidden shadow rounded-xl hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800">
                          <div className="p-5">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{pkg.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{pkg.category}</p>
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-lg font-medium text-gray-900 dark:text-white">${pkg.basePrice || 'N/A'}</span>
                              <button
                                onClick={() => router.push(`/events/${pkg._id}`)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {adminPackages.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No packages available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Live Tracking Modal */}
        {showTrackingModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Live Tracking - {selectedBooking.eventName}
                  </h3>
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className="text-gray-400 hover:text-gray-500 ml-4"
                  >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 px-7 py-3">
                  {mapComponentProps && <MapComponent {...mapComponentProps} />}
                  {selectedBooking?.status === 'completed' && selectedBooking?.qrCode && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Payment QR Code</h4>
                      <img 
                        src={selectedBooking.qrCode} 
                        alt="Payment QR Code" 
                        className="w-48 h-48 mx-auto"
                      />
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Scan this to complete payment of ${selectedBooking.totalPrice}
                      </p>
                      <button
                        onClick={() => processPayment(selectedBooking)}
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        💳 Pay with QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
