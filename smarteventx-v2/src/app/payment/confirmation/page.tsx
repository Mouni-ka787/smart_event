"use client";

import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { bookingsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Suspense } from 'react';

// Create a component that uses useSearchParams
function PaymentConfirmationContent() {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (bookingId && user) {
      fetchBookingDetails();
    }
  }, [bookingId, user]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      if (!user) {
        throw new Error('User not authenticated');
      }
      const data = await bookingsAPI.getById(user!.token, bookingId || '');
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading booking</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Confirmation</h1>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center">
                  <div className="flex justify-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                      <svg className="h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mt-4 text-2xl font-medium text-gray-900">Payment Successful!</h3>
                  <div className="mt-2 max-w-xl mx-auto text-gray-500">
                    <p>
                      Your payment has been processed successfully through PayPal. A confirmation email has been sent to your email address.
                    </p>
                  </div>

                  <div className="mt-8 bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                    <h4 className="text-lg font-medium text-gray-900">Booking Details</h4>
                    <div className="mt-4 space-y-4">
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Service</p>
                        <p className="text-sm font-medium text-gray-900">{booking?.service?.name || 'N/A'}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Vendor</p>
                        <p className="text-sm font-medium text-gray-900">{booking?.vendor?.name || 'N/A'}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Event Name</p>
                        <p className="text-sm font-medium text-gray-900">{booking?.eventName || 'N/A'}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Event Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {booking?.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Guests</p>
                        <p className="text-sm font-medium text-gray-900">{booking?.guestCount || 'N/A'}</p>
                      </div>
                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <p className="text-base font-medium text-gray-900">Total Paid</p>
                        <p className="text-base font-medium text-gray-900">${booking?.totalPrice?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="text-sm font-medium text-gray-900">PayPal</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Transaction ID</p>
                        <p className="text-sm font-medium text-gray-900">{booking?.paypalCaptureId?.substring(0, 12) || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-lg font-medium text-gray-900">Next Steps</h4>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <h5 className="text-sm font-medium text-gray-900">Review Details</h5>
                            <p className="text-xs text-gray-500">Check your booking information</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-yellow-500 text-white">
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <h5 className="text-sm font-medium text-gray-900">Track Service</h5>
                            <p className="text-xs text-gray-500">Monitor your booking status</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white">
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <h5 className="text-sm font-medium text-gray-900">Contact Vendor</h5>
                            <p className="text-xs text-gray-500">Communicate with your provider</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => router.push(`/tracking/${bookingId}`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Track Your Service
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/user')}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Back to Dashboard
                    </button>
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

// Wrap the component with Suspense
export default function PaymentConfirmation() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentConfirmationContent />
    </Suspense>
  );
}