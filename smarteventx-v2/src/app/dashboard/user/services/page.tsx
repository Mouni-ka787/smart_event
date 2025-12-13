'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import api from '@/services/api';

export default function UserServicesPage() {
  const router = useRouter();
  const [adminEvents, setAdminEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdminEvents();
  }, [search]);

  const fetchAdminEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {};
      
      if (search) {
        params.search = search;
      }
      
      const data = await api.events.getAll(params);
      
      // Show all admin events
      setAdminEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminEvents();
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Page Header */}
        <div className="bg-white shadow-sm dark:bg-gray-800">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Packages</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Browse and book event packages created by admin
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/user')}
                className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* Search Bar */}
              <div className="mb-6">
                <form onSubmit={handleSearch} className="relative rounded-md shadow-sm w-full md:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="Search event packages..."
                  />
                </form>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading services</h3>
                      <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Services Grid */}
              {!loading && !error && (
                <>
                  {adminEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No event packages found</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        No event packages available at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {adminEvents.map((event) => (
                        <div 
                          key={event._id} 
                          className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                          onClick={() => router.push(`/events/${event._id}`)}
                        >
                          {/* Event Image Placeholder */}
                          <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-300 flex items-center justify-center">
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-dashed border-white rounded-xl w-16 h-16 flex items-center justify-center">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="px-5 py-5">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{event.name}</h3>
                                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  {event.category}
                                </span>
                              </div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                event.isActive 
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              }`}>
                                {event.isActive ? "Available" : "Unavailable"}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {event.description || 'Complete event package with all services included'}
                            </p>

                            {/* Display included services count */}
                            {event.services && event.services.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Includes {event.services.length} service{event.services.length > 1 ? 's' : ''}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Total Package Price
                                </p>
                                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                  ${event.price}
                                </p>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/events/${event._id}`);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition duration-200 hover:scale-105"
                              >
                                View Package
                              </button>
                            </div>

                            {event.rating && (
                              <div className="flex items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">{event.rating}</span>
                                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">({event.reviewCount || 0})</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
