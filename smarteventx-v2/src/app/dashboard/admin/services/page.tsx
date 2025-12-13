'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import TermsAndConditions from '@/components/TermsAndConditions';

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    eventName: '',
    eventDate: '',
    guestCount: '',
    venueAddress: '',
    venueLat: '',
    venueLng: ''
  });
  const { user } = useAuth();
  const router = useRouter();

  // Add effect to automatically fetch coordinates when venue address changes
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (bookingForm.venueAddress && bookingForm.venueAddress.length > 5) {
        try {
          // In a real implementation, you would call a geocoding API
          // For now, we'll simulate with a timeout to mimic API delay
          // You can replace this with actual geocoding service like Google Maps Geocoding API
          console.log('Fetching coordinates for:', bookingForm.venueAddress);
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // For demonstration, we'll use fixed coordinates
          // In a real app, you would parse the response from the geocoding service
          const simulatedLat = 40.7128; // New York City latitude
          const simulatedLng = -74.0060; // New York City longitude
          
          setBookingForm(prev => ({
            ...prev,
            venueLat: simulatedLat.toString(),
            venueLng: simulatedLng.toString()
          }));
        } catch (err) {
          console.error('Error fetching coordinates:', err);
          // Don't set error here as it's not critical
        }
      }
    };

    // Debounce the API call
    const timer = setTimeout(fetchCoordinates, 1000);
    return () => clearTimeout(timer);
  }, [bookingForm.venueAddress]);
  
  // Add effect to log when showTerms changes
  useEffect(() => {
    console.log('=== SHOW TERMS STATE CHANGED ===', showTerms);
  }, [showTerms]);

  useEffect(() => {
    const fetchServicesAndVendors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user || !user.token) {
          throw new Error('No authentication token found');
        }

        // Fetch all services for admin
        const servicesData = await api.admin.getAllServices(user.token);
        setServices(servicesData);
        
        // Fetch all vendors for assignment
        const vendorsData = await api.admin.getAllVendors(user.token);
        setVendors(vendorsData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchServicesAndVendors();
    }
  }, [user]);

  const handleAssignVendor = async () => {
    console.log('=== handleAssignVendor called ===');
    // Show terms and conditions modal before performing the assignment/booking
    if (!selectedService) {
      setAssignError('No service selected');
      return;
    }

    // Validate booking form
    if (!bookingForm.eventName || !bookingForm.eventDate || !bookingForm.guestCount || 
        !bookingForm.venueAddress || !bookingForm.venueLat || !bookingForm.venueLng) {
      setAssignError('Please fill in all booking details');
      return;
    }

    setAssignError(null);
    // Show terms and conditions for vendor
    console.log('Setting showTerms to true');
    setShowTerms(true);
    console.log('showTerms state after setting:', showTerms);
  };

  const handleAssignConfirm = async () => {
    console.log('=== handleAssignConfirm called ===');
    try {
      setAssigning(true);
      setAssignError(null);

      // Prepare assignment data (include a debug marker to correlate logs)
      const debugMarker = `BOOKING_ATTEMPT:${Date.now()}`;
      const assignmentData = {
        // For now, we'll use the service's existing vendor or a default vendor
        // In a real implementation, you might want to select a vendor dynamically
        vendorId: selectedService.vendor?._id || vendors[0]?._id || 'default-vendor-id',
        eventName: bookingForm.eventName,
        eventDate: bookingForm.eventDate,
        guestCount: parseInt(bookingForm.guestCount),
        venueAddress: bookingForm.venueAddress,
        venueLat: parseFloat(bookingForm.venueLat),
        venueLng: parseFloat(bookingForm.venueLng),
        debugMarker
      };

      // Call the API to assign vendor to service
      if (user && user.token) {
        const response = await api.admin.assignVendorToService(
          user.token,
          selectedService._id,
          assignmentData
        );
        
        // Show success message
        alert('Service booked successfully!');
      }

      // Update the service in the local state to show it's assigned
      setServices(prevServices => 
        prevServices.map(service => 
          service._id === selectedService._id 
            ? { ...service, vendor: vendors.find(v => v._id === assignmentData.vendorId) }
            : service
        )
      );

      // Close all modals
      setShowAssignModal(false);
      setShowTerms(false);
      setAssigning(false);
      
      // Reset form
      setSelectedService(null);
      setSelectedVendor('');
      setBookingForm({
        eventName: '',
        eventDate: '',
        guestCount: '',
        venueAddress: '',
        venueLat: '',
        venueLng: ''
      });

      // Show success message
      setBookingSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setBookingSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error booking service:', err);
      setAssignError(err.message || 'Failed to book service');
      setAssigning(false);
      setShowTerms(false);
    }
  };

  const openAssignModal = (service: any) => {
    setSelectedService(service);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedService(null);
    setSelectedVendor('');
    setAssignError(null);
    setBookingForm({
      eventName: '',
      eventDate: '',
      guestCount: '',
      venueAddress: '',
      venueLat: '',
      venueLng: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
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

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only admins can view all services.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">All Services</h1>
              <p className="mt-1 text-sm text-gray-500">
                View all services created by admins and vendors
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/admin')}
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
                  <h3 className="text-sm font-medium text-red-800">Error loading services</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {bookingSuccess && (
            <div className="rounded-md bg-green-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Vendor assigned successfully and booking created!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services List */}
          {!loading && !error && (
            <div className="bg-white shadow rounded-xl overflow-hidden sm:rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {services.length > 0 ? (
                  services.map((service) => (
                    <div 
                      key={service._id} 
                      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {service.category}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          service.vendor 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {service.vendor ? 'Vendor Service' : 'Admin Service'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {service.description || 'Professional service'}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {service.priceType === 'per_person' && 'Per Person'}
                            {service.priceType === 'per_event' && 'Per Event'}
                            {service.priceType === 'hourly' && 'Per Hour'}
                            {service.priceType === 'package' && 'Package'}
                          </p>
                          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            ${service.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Provider</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {service.vendor?.name || 'Admin'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/services/${service._id}`)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition duration-200 hover:scale-105 shadow-sm"
                        >
                          <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View Details
                        </button>
                        <button
                          onClick={() => openAssignModal(service)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition duration-200 hover:scale-105 shadow-sm"
                        >
                          <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Book Service
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no services in the system yet.</p>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6 dark:bg-gray-700">
                <button
                  onClick={() => router.push('/dashboard/admin')}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Vendor Assignment Modal */}
      {showAssignModal && selectedService && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Book Service
                </h3>
                <button
                  onClick={closeAssignModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 px-7 py-3">
                <div className="mb-4 p-4 bg-blue-50 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800">Service Details</h4>
                  <div className="mt-2 text-sm text-blue-700">
                    <p><strong>Name:</strong> {selectedService.name}</p>
                    <p><strong>Category:</strong> {selectedService.category}</p>
                    <p><strong>Price:</strong> ${selectedService.price} ({selectedService.priceType})</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Booking Details</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Event Name
                      </label>
                      <input
                        type="text"
                        name="eventName"
                        value={bookingForm.eventName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Event Date
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        value={bookingForm.eventDate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Guest Count
                      </label>
                      <input
                        type="number"
                        name="guestCount"
                        value={bookingForm.guestCount}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Venue Address
                      </label>
                      <input
                        type="text"
                        name="venueAddress"
                        value={bookingForm.venueAddress}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter venue address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Latitude
                        </label>
                        <input
                          type="text"
                          name="venueLat"
                          value={bookingForm.venueLat}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Auto-filled from address"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Longitude
                        </label>
                        <input
                          type="text"
                          name="venueLng"
                          value={bookingForm.venueLng}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Auto-filled from address"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {assignError && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{assignError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <button
                    type="button"
                    disabled={assigning}
                    onClick={handleAssignVendor}
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      assigning 
                        ? 'bg-indigo-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {assigning ? (
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
                  <button
                    type="button"
                    onClick={closeAssignModal}
                    className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showTerms && (
        <TermsAndConditions 
          userType="vendor"
          onAccept={() => handleAssignConfirm()}
          onCancel={() => setShowTerms(false)}
        />
      )}
    </div>
  );
}