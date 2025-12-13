"use client";

import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { bookingsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function TrackingPage() {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    if (!user || !id) return;
    
    try {
      setLoading(true);
      const data = await bookingsAPI.getById(user.token, id as string);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch booking');
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Booking not found</h3>
            <p className="mt-1 text-sm text-gray-500">The booking you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <div className="mt-6">
              <a href="/dashboard/user" className="text-primary-600 hover:text-primary-500">
                Back to dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sample tracking updates - in a real app, this would come from the API
  const trackingUpdates = [
    {
      id: 1,
      status: "Order Confirmed",
      time: "10:00 AM",
      description: "Your order has been confirmed by the vendor."
    },
    {
      id: 2,
      status: "Preparing",
      time: "11:30 AM",
      description: "The vendor is preparing your order."
    },
    {
      id: 3,
      status: "On the way",
      time: "1:15 PM",
      description: "The vendor is on the way to your location.",
      active: true
    },
    {
      id: 4,
      status: "Arrived",
      time: "2:30 PM (est)",
      description: "The vendor will arrive at your location."
    },
    {
      id: 5,
      status: "Service Completed",
      time: "5:00 PM (est)",
      description: "Service completion and payment release."
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Page Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Track Your Service</h1>
          </div>
        </div>

        {/* Main Content */}
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tracking Info */}
                <div className="lg:col-span-2">
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 className="text-xl font-medium text-gray-900">Booking #{booking._id?.substring(0, 8)}</h2>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">{booking.service?.name} by {booking.vendor?.name}</p>
                    </div>
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
                            <dl className="mt-2 space-y-2">
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Event Name</dt>
                                <dd className="text-sm text-gray-900">{booking.eventName}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Date</dt>
                                <dd className="text-sm text-gray-900">{new Date(booking.eventDate).toLocaleDateString()}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Guests</dt>
                                <dd className="text-sm text-gray-900">{booking.guestCount}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Location</dt>
                                <dd className="text-sm text-gray-900 text-right">
                                  {booking.service?.location?.address || 'Not specified'}
                                </dd>
                              </div>
                            </dl>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Vendor Contact</h3>
                            <dl className="mt-2 space-y-2">
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                <dd className="text-sm text-gray-900">{booking.vendor?.name}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                <dd className="text-sm text-gray-900">+1 (555) 123-4567</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="text-sm text-gray-900">vendor@example.com</dd>
                              </div>
                            </dl>
                          </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="mt-8">
                          <h3 className="text-lg font-medium text-gray-900">Real-time Location</h3>
                          <div className="mt-4 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                              <p className="mt-2 text-gray-500">Interactive Map with Vendor Location</p>
                              <p className="text-sm text-gray-500">Vendor is currently 5 miles away</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div>
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 className="text-xl font-medium text-gray-900">Tracking Progress</h2>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">Current status: On the way</p>
                      <p className="mt-1 text-sm text-gray-500">Estimated arrival: 2:30 PM</p>
                    </div>
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flow-root">
                          <ul className="divide-y divide-gray-200">
                            {trackingUpdates.map((update) => (
                              <li key={update.id} className="py-4">
                                <div className="flex items-center">
                                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                    update.active 
                                      ? 'bg-primary-500 text-white' 
                                      : update.id < 4 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-200 text-gray-500'
                                  }`}>
                                    {update.id < 4 ? (
                                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <span className="text-xs font-medium">{update.id}</span>
                                    )}
                                  </div>
                                  <div className="ml-3 min-w-0 flex-1">
                                    <p className={`text-sm font-medium ${
                                      update.active ? 'text-primary-600' : 'text-gray-900'
                                    }`}>
                                      {update.status}
                                    </p>
                                    <p className="text-sm text-gray-500">{update.time}</p>
                                    <p className="text-sm text-gray-500">{update.description}</p>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code for Payment Release */}
                  <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 className="text-xl font-medium text-gray-900">Service Completion</h2>
                    </div>
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">
                            Once the service is completed, the admin will scan this QR code to release payment to the vendor.
                          </p>
                          <div className="mt-4 flex justify-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center">
                              <span className="text-gray-500">QR Code</span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Contact Support
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}