'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { servicesAPI, bookingsAPI } from '@/services/api'; // Updated import
import { useRouter } from 'next/navigation';
import TermsAndConditions from '@/components/TermsAndConditions';

export default function BookVendorServicePage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
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
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  
  // Add effect to log when showTerms changes
  useEffect(() => {
    console.log('=== SHOW TERMS STATE CHANGED ===', showTerms);
  }, [showTerms]);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('BookVendorServicePage mounted, user:', user);
    // Add a check to ensure we're properly authenticated
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }
    
    // Ensure the user is an admin
    if (user.role !== 'admin') {
      console.log('User is not admin, redirecting to home');
      router.push('/'); // Redirect to home page instead of potentially non-existent /unauthorized
      return;
    }
    
    console.log('User is authenticated as admin, fetching vendor services');
    fetchVendorServices();
  }, [user]);

  const fetchVendorServices = async () => {
    try {
      setLoading(true);
      console.log('Fetching all services...');
      // Using the correct API import
      const data = await servicesAPI.getAll();
      console.log('Received services data:', data);
      
      // Check if data has services property
      if (!data || !data.services) {
        console.error('Invalid data structure received:', data);
        setError('Invalid data received from server');
        setLoading(false);
        return;
      }
      
      // Log all services to see their structure
      console.log('All services:', data.services);
      
      // Check if there are any services
      if (data.services.length === 0) {
        console.log('No services found');
      }
      
      // Filter for vendor services only - improved filtering logic
      const vendorServices = data.services.filter((service: any) => {
        console.log('Checking service:', service.name, 'Vendor:', service.vendor);
        console.log('Service full object:', JSON.stringify(service, null, 2));
        // More robust check for vendor services
        // A vendor service has a vendor field that is not null/undefined and has an _id
        const hasVendor = service.vendor && 
               (typeof service.vendor === 'object' && service.vendor !== null) && 
               (service.vendor._id || service.vendor.id);
        
        console.log('Service has vendor:', hasVendor);
        return hasVendor;
      });
      
      console.log('Filtered vendor services:', vendorServices);
      setServices(vendorServices);
      
      // Add a message if no vendor services are found
      if (vendorServices.length === 0) {
        console.log('No vendor services found. This could be because no vendors have created services yet.');
      }
    } catch (err: any) {
      console.error('Error fetching vendor services:', err);
      // More detailed error logging
      if (err.message) {
        console.error('Error message:', err.message);
      }
      if (err.stack) {
        console.error('Error stack:', err.stack);
      }
      setError(err.message || 'Failed to fetch vendor services');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: any) => {
    console.log('Service selected:', service);
    setSelectedService(service);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: name === 'guestCount' ? parseInt(value) || 1 : value
    }));
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    
    let basePrice = selectedService.price;
    if (selectedService.priceType === 'per_person') {
      basePrice = selectedService.price * bookingForm.guestCount;
    }
    
    // Service fee (5% of total)
    const serviceFee = basePrice * 0.05;
    
    return basePrice + serviceFee;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('=== HANDLE BOOKING CALLED ===');
      console.log('Form submitted');
      console.log('User:', user);
      console.log('Selected service:', selectedService);
      console.log('Booking form:', bookingForm);
      
      if (!user) {
        console.log('No user, redirecting to login');
        router.push('/login');
        return;
      }
      
      if (!selectedService) {
        console.log('No service selected');
        setError('Please select a service to book');
        return;
      }
      
      // Show terms and conditions before booking
      console.log('Showing terms and conditions...');
      setShowTerms(true);
      console.log('showTerms state set to true');
    } catch (error) {
      console.error('Error in handleBooking:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };
  
  const handleBookingSubmit = async () => {
    try {
      console.log('handleBookingSubmit called');
      if (!user) {
        console.log('No user, redirecting to login');
        router.push('/login');
        return;
      }
      
      setIsBooking(true);
      setError(null);
      
      try {
        // Validate and format the event date
        const rawEventDate = bookingForm.eventDate;
        console.log('Raw event date:', rawEventDate);
        
        // Check if the date is valid
        if (!rawEventDate || rawEventDate === '') {
          setError('Please select a valid event date.');
          setIsBooking(false);
          return;
        }
        
        // Parse the date to ensure it's valid
        const parsedDate = new Date(rawEventDate);
        if (isNaN(parsedDate.getTime())) {
          setError('Please select a valid event date.');
          setIsBooking(false);
          return;
        }
        
        // Format the date properly for the backend
        const formattedDate = parsedDate.toISOString();
        console.log('Formatted event date:', formattedDate);
        
        const bookingData = {
          serviceId: selectedService._id,
          serviceName: selectedService.name, // Added this field for service booking
          eventDate: formattedDate, // Use the properly formatted date
          guestCount: bookingForm.guestCount,
          venueAddress: bookingForm.venueAddress,
          venueLat: bookingForm.venueLat,
          venueLng: bookingForm.venueLng,
          specialRequests: bookingForm.specialRequests
        };
        
        console.log('=== SENDING SERVICE BOOKING REQUEST ===');
        console.log('Booking data:', bookingData);
        console.log('API endpoint: /bookings/service');
        console.log('Request method: POST');
        if (!user?.token) {
          console.error('No auth token found for user. Cannot create booking.');
          setError('You are not authenticated. Please login again.');
          setIsBooking(false);
          return;
        }
        
        // Add a timeout to the request to see if it's a network issue
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          // Using the new service booking API
          const data = await bookingsAPI.createServiceBooking(user.token!, bookingData);
          clearTimeout(timeoutId);
          
          console.log('Booking created successfully:', data);
          setBookingId(data._id);
          setBookingSuccess(true);
        } catch (apiError: any) {
          clearTimeout(timeoutId);
          
          // Check if it's a timeout error
          if (apiError.name === 'AbortError') {
            console.log('=== SERVICE BOOKING REQUEST TIMEOUT ===');
            setError('The request timed out. Please check your network connection and try again.');
            return;
          }
          
          throw apiError; // Re-throw to be caught by outer catch block
        }
      } catch (err: any) {
        console.error('Error creating booking:', err);
        // More detailed error logging
        if (err.message) {
          console.error('Error message:', err.message);
        }
        if (err.stack) {
          console.error('Error stack:', err.stack);
        }
        setError(err.message || 'Failed to create booking');
      } finally {
        setIsBooking(false);
      }
    } catch (error) {
      console.error('Unexpected error in handleBookingSubmit:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4">
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
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
                <h3 className="mt-4 text-2xl font-medium text-gray-900">Booking Successful!</h3>
                <div className="mt-2 max-w-xl mx-auto text-gray-500">
                  <p>
                    Your booking has been confirmed. A confirmation email has been sent to your email address.
                  </p>
                </div>

                <div className="mt-8 bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                  <h4 className="text-lg font-medium text-gray-900">Booking Details</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Service</p>
                      <p className="text-sm font-medium text-gray-900">{selectedService?.name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Vendor</p>
                      <p className="text-sm font-medium text-gray-900">{selectedService?.vendor?.name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Event Name</p>
                      <p className="text-sm font-medium text-gray-900">{bookingForm.eventName}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Event Date</p>
                      <p className="text-sm font-medium text-gray-900">{bookingForm.eventDate}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Guests</p>
                      <p className="text-sm font-medium text-gray-900">{bookingForm.guestCount}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <p className="text-base font-medium text-gray-900">Total Paid</p>
                      <p className="text-base font-medium text-gray-900">${calculateTotal().toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => router.push(`/tracking/${bookingId}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Track Your Service
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/admin')}
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Vendor Service</h1>
          <p className="mt-1 text-sm text-gray-500">
            Select a vendor service and book it for your event
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Service Selection */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-xl font-medium text-gray-900">Available Services</h2>
                  </div>
                  <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {services.length > 0 ? (
                        services.map((service) => (
                          <li 
                            key={service._id} 
                            className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${selectedService?._id === service._id ? 'bg-blue-50' : ''}`}
                            onClick={() => handleServiceSelect(service)}
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                              <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                                <p className="text-sm text-gray-500">{service.vendor?.name || service.vendor || 'No vendor assigned'}</p>
                                <p className="text-sm font-medium text-gray-900">${service.price} {service.priceType === 'per_person' ? 'per person' : 'fixed'}</p>
                                {/* Display service ID for debugging */}
                                <p className="text-xs text-gray-400">ID: {service._id}</p>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-4">
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No vendor services</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are currently no services available from vendors.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Please ask vendors to create services in their dashboard.
                </p>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-xl font-medium text-gray-900">Booking Details</h2>
                  </div>
                  <div className="border-t border-gray-200">
                    {selectedService ? (
                      <div className="px-4 py-5 sm:p-6">
                        <p className="text-sm text-gray-600">To book this service, you&apos;ll be redirected to the service details page where booking is handled centrally.</p>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => router.push(`/services/${selectedService._id}`)}
                            className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Open Service Page to Book
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No service selected</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Select a service from the list to start booking.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showTerms && (
        <TermsAndConditions 
          userType="user" 
          onAccept={() => {
            setShowTerms(false);
            // Proceed with booking
            handleBookingSubmit();
          }}
          onCancel={() => setShowTerms(false)}
        />
      )}
    </div>
  );
}