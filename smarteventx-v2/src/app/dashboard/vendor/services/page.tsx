'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

export default function VendorServicesPage() {
  const [adminServices, setAdminServices] = useState<any[]>([]);
  const [vendorServices, setVendorServices] = useState<any[]>([]);
  const [adminEvents, setAdminEvents] = useState<any[]>([]); // Add admin events state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null); // Add editing event state
  const [viewingEvent, setViewingEvent] = useState<any>(null); // Add viewing event state
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchServicesAndEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user || !user.token) {
          throw new Error('No authentication token found');
        }

        // Fetch all services
        const allServicesData = await api.services.getAll();
        
        // Filter admin services (services without a vendor or with different vendor)
        const adminServicesData = allServicesData.services?.filter((service: any) => 
          !service.vendor || service.vendor._id !== user._id
        ) || [];
        
        // Filter vendor's own services
        const vendorServicesData = allServicesData.services?.filter((service: any) => 
          service.vendor && service.vendor._id === user._id
        ) || [];
        
        setAdminServices(adminServicesData);
        setVendorServices(vendorServicesData);
        
        // Fetch vendor events where vendor's services are included
        try {
          // Use the new vendor-specific endpoint to get events where vendor's services are included
          const vendorEventsData = await api.vendor.getEvents(user.token);
          setAdminEvents(vendorEventsData || []);
        } catch (err: any) {
          console.error('Error fetching vendor events:', err);
          // Don't set error for events as it's not critical
        }
      } catch (err: any) {
        console.error('Error fetching services and events:', err);
        setError(err.message || 'Failed to fetch services and events');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchServicesAndEvents();
    }
  }, [user]);

  // Function to handle editing a service
  const handleEditService = (service: any) => {
    setEditingService(service);
    router.push(`/dashboard/vendor?edit=${service._id}`);
  };
  
  // Function to handle editing an event
  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    router.push(`/dashboard/vendor?editEvent=${event._id}`);
  };

  // Function to handle viewing an event
  const handleViewEvent = (event: any) => {
    setViewingEvent(event);
  };

  // Function to close event view modal
  const handleCloseViewEvent = () => {
    setViewingEvent(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only vendors can view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Services & Events</h1>
              <p className="mt-1 text-sm text-gray-500">
                View admin-created services and events, and manage your own services
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/vendor')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading services and events</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Events Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Admin-Created Events</h2>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {adminEvents.length > 0 ? (
                  adminEvents.map((event) => (
                    <li key={event._id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">{event.name}</p>
                            <p className="text-sm text-gray-500">{event.category}</p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Admin Event
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              {event.createdBy?.name || 'Admin'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>${event.totalPrice} • {new Date(event.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                        </div>
                        <div className="mt-2">
                          <button 
                            onClick={() => router.push(`/events/${event._id}`)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="text-center py-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No admin-created events</h3>
                        <p className="mt-1 text-sm text-gray-500">Admins haven't created any events yet.</p>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Vendor's Services Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Your Services</h2>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {vendorServices.length > 0 ? (
                  vendorServices.map((service) => (
                    <li key={service._id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">{service.name}</p>
                            <p className="text-sm text-gray-500">{service.category}</p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Your Service
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              {service.vendor?.name || 'You'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>${service.price} • {service.priceType}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                        </div>
                        <div className="mt-2">
                          <button 
                            onClick={() => handleEditService(service)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="text-center py-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">You haven't created any services yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Create your first service from your dashboard.</p>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Event Detail Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {viewingEvent.name}
                </h3>
                <button
                  onClick={handleCloseViewEvent}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 px-7 py-3">
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{viewingEvent.category}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {viewingEvent.description}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        ${viewingEvent.totalPrice}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Created By</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {viewingEvent.createdBy?.name || 'Admin'}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          viewingEvent.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {viewingEvent.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}