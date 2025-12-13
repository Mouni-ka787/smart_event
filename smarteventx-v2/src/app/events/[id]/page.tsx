'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import MapComponent from '@/components/MapComponent';
import Link from 'next/link';
import TermsAndConditions from '@/components/TermsAndConditions';

export default function EventDetailPage() {
  console.log('=== EventDetailPage component rendered ===');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    eventDate: '',
    guestCount: '',
    venueAddress: '',
    specialRequests: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  // Log state changes for debugging
  useEffect(() => {
    console.log('showTerms state changed:', showTerms);
  }, [showTerms]);
  
  useEffect(() => {
    console.log('showBookingModal state changed:', showBookingModal);
  }, [showBookingModal]);
  
  useEffect(() => {
    console.log('bookingData state changed:', bookingData);
  }, [bookingData]);
  
  const handleBookEvent = async () => {
    try {
      console.log('=== HANDLE BOOK EVENT CALLED ===');
      console.log('Current user state:', user);
      console.log('Current booking data:', bookingData);
      
      // Validate that required booking data is present before proceeding
      if (!bookingData.eventDate) {
        console.log('Event date is missing');
        setBookingError('Please select an event date before proceeding.');
        return;
      }
      
      if (!bookingData.guestCount) {
        console.log('Guest count is missing');
        setBookingError('Please enter the number of guests before proceeding.');
        return;
      }
      
      if (!bookingData.venueAddress) {
        console.log('Venue address is missing');
        setBookingError('Please enter the venue address before proceeding.');
        return;
      }
      
      if (!user || !user.token) {
        console.log('User not authenticated, redirecting to login');
        router.push('/login');
        return;
      }
      
      console.log('All validation passed, showing terms and conditions on top of booking modal');
      // Show terms and conditions ON TOP of booking modal (don't close booking modal)
      setShowTerms(true);
      console.log('Terms and conditions modal should now be visible');
      console.log('showTerms state:', showTerms); // This will show the previous state
    } catch (error) {
      console.error('Error in handleBookEvent:', error);
      setBookingError('An unexpected error occurred. Please try again.');
    }
  };
  
  const handleBookingSubmit = async () => {
    try {
      console.log('=== STARTING BOOKING SUBMISSION ===');
      console.log('User state:', user);
      console.log('Booking data at submission time:', bookingData);
      
      if (!user || !user.token) {
        console.log('User not authenticated in handleBookingSubmit, redirecting to login');
        router.push('/login');
        return;
      }
      
      setBookingLoading(true);
      setBookingError(null);
      console.log('Booking loading set to true');
      
      // Validate and format the event date
      const rawEventDate = bookingData.eventDate;
      console.log('Raw event date:', rawEventDate);
      
      // Check if the date is valid
      if (!rawEventDate || rawEventDate === '') {
        const errorMsg = 'Please select a valid event date.';
        console.log('Validation error:', errorMsg);
        console.log('Raw event date value:', JSON.stringify(rawEventDate));
        setBookingError(errorMsg);
        setBookingLoading(false);
        return;
      }
      
      // Parse the date to ensure it's valid
      const parsedDate = new Date(rawEventDate);
      if (isNaN(parsedDate.getTime())) {
        const errorMsg = 'Please select a valid event date.';
        console.log('Date parsing error:', errorMsg);
        setBookingError(errorMsg);
        setBookingLoading(false);
        return;
      }
      
      // Format the date properly for the backend
      const formattedDate = parsedDate.toISOString();
      console.log('Formatted event date:', formattedDate);
      
      // Ensure we have a valid event ID
      if (!id) {
        const errorMsg = 'Event ID is missing. Please try again.';
        console.log('Validation error:', errorMsg);
        setBookingError(errorMsg);
        setBookingLoading(false);
        return;
      }
      
      // Ensure event data is loaded
      if (!event || !event.name) {
        const errorMsg = 'Event data is not loaded properly. Please refresh the page and try again.';
        console.log('Validation error:', errorMsg);
        setBookingError(errorMsg);
        setBookingLoading(false);
        return;
      }
      
      // Log the data being sent for debugging
      const bookingPayload = {
        eventId: typeof id === 'string' ? id : id[0], // Ensure ID is a string
        eventName: event.name,
        eventDate: formattedDate, // Use the properly formatted date
        guestCount: parseInt(bookingData.guestCount) || 1,
        venueAddress: bookingData.venueAddress,
        venueLat: 0, // Will be calculated from address
        venueLng: 0, // Will be calculated from address
        specialRequests: bookingData.specialRequests
      };
      
      console.log('=== BOOKING SUBMIT ATTEMPT ===');
      console.log('User token exists:', !!user.token);
      console.log('Booking payload:', bookingPayload);
      console.log('API endpoint: /bookings/event');
      console.log('Request method: POST');
      
      // Create the booking
      console.log('Calling API to create booking...');
      const booking = await api.bookings.createEventBooking(user.token, bookingPayload);
      
      console.log('=== BOOKING SUCCESS ===');
      console.log('Booking response:', booking);
      
      setBookingSuccess(true);
      console.log('Booking success set to true');
      
      // Show success message and redirect
      setTimeout(() => {
        console.log('Redirecting to user dashboard');
        // Close all modals and navigate to the user dashboard
        setShowBookingModal(false);
        setShowTerms(false);
        router.push('/dashboard/user'); // Use push instead of replace to allow back navigation
      }, 2000); // Show success message for 2 seconds
    } catch (err: any) {
      console.log('=== BOOKING ERROR ===');
      console.error('Booking error details:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      // Provide more specific error messages
      if (err.message && err.message.includes('Server error')) {
        setBookingError('The server is currently unavailable. Please try again in a few minutes or contact support. Error: ' + err.message);
      } else if (err.message) {
        setBookingError(err.message);
      } else {
        setBookingError('Failed to create booking. Please check your connection and try again.');
      }
    } finally {
      setBookingLoading(false);
      console.log('Booking loading set to false in finally block');
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Log the ID for debugging
        console.log('Event ID from useParams:', id);
        
        // Validate that we have an ID before making the API call
        if (!id) {
          setError('Invalid event ID');
          setLoading(false);
          return;
        }
        
        // Ensure ID is a string
        const eventId = typeof id === 'string' ? id : id[0];
        
        // Log the event ID for debugging
        console.log('Fetching event with ID:', eventId);
        
        // Validate that the ID looks like a valid MongoDB ObjectId
        if (eventId.length !== 24) {
          setError('Invalid event ID format');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError(null);
        const eventData = await api.events.getById(eventId);
        setEvent(eventData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError('Failed to load event: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    } else {
      setError('No event ID provided');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Removed Header */}
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Removed Header */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Removed Header */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Event Not Found</h2>
            <p className="mt-2 text-gray-600">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success message banner */}
      {bookingSuccess && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm font-medium text-green-800">
                  Booking created successfully! Redirecting to your dashboard...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message banner */}
      {bookingError && !showBookingModal && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm font-medium text-red-800">
                  {bookingError}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Removed Header and Breadcrumb - Only package details visible */}      
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Created by {event.createdBy?.name || 'Admin'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-700">4.8</span>
                <span className="ml-1 text-sm text-gray-500">(128 reviews)</span>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
              </span>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Event Details */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Event Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about this event.</p>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Category</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{event.category}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {event.description}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Contact</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div>{event.email}</div>
                          <div>{event.phoneNumber}</div>
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          ${event.totalPrice}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Created By</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {event.createdBy?.name || 'Admin'}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            event.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {event.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Services/Packages */}
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Services/Packages</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Included services for this event.</p>
                  </div>
                  <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {event.services && event.services.length > 0 ? (
                        event.services.map((service: any, index: number) => (
                          <li key={index} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-md flex items-center justify-center">
                                  <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                                  <p className="text-sm text-gray-500">
                                    {service.isVendorService ? 'Vendor Service' : 'Admin Service'}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">${service.price}</p>
                                <p className="text-sm text-gray-500">Qty: {service.quantity || 1}</p>
                              </div>
                            </div>
                            {service.isVendorService && service.vendorName && (
                              <div className="mt-2 ml-14">
                                <p className="text-xs text-gray-500">Vendor: {service.vendorName}</p>
                              </div>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                          No services included in this event.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(true)}
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition duration-300 hover:scale-105"
                    >
                      <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Book This Event
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition duration-300 hover:scale-105"
                      onClick={() => window.location.href = '/login'}
                    >
                      <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Login to Book
                    </button>
                  )}
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition duration-300 hover:scale-105"
                  >
                    <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Contact Admin
                  </button>
                </div>
              </div>

              {/* Map and Location */}
              <div>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Location</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Event location information.</p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    {event.location?.address ? (
                      <>
                        <MapComponent 
                          address={event.location.address}
                          coordinates={
                            event.location.coordinates && event.location.coordinates.length === 2
                              ? { lat: event.location.coordinates[1], lng: event.location.coordinates[0] }
                              : undefined
                          }
                          height="300px"
                          venueLocation={
                            event.location.coordinates && event.location.coordinates.length === 2
                              ? { lat: event.location.coordinates[1], lng: event.location.coordinates[0] }
                              : undefined
                          }
                          // Add vendor location if available (would come from booking data)
                          // vendorLocation={vendorLocation}
                        />
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Address</h4>
                          <p className="mt-1 text-sm text-gray-500">{event.location.address}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No location information available for this event.</p>
                    )}
                  </div>
                </div>

                {/* Live Tracking Section - Track Admin */}
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Live Tracking</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Track admin's location in real-time.</p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    {user ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Admin Status</h4>
                            <p className="text-sm text-gray-500">Tracking is active for your booking</p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">Admin Location</p>
                              <p className="text-sm text-gray-500">Updated just now</p>
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
                              <span className="text-sm text-gray-900">15 minutes</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <button
                            type="button"
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
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
                            onClick={() => window.location.href = '/login'}
                          >
                            Login
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Information */}
                <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Information</h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-bold">
                            {event.createdBy?.name?.charAt(0) || 'A'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{event.createdBy?.name || 'Admin'}</h4>
                        <p className="text-sm text-gray-500">
                          Event Creator
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {event.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {event.phoneNumber}
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Admin Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Terms and Conditions Modal */}
      {showTerms && (
        <TermsAndConditions 
          userType="user" 
          onAccept={async () => {
            try {
              console.log('=== TERMS AND CONDITIONS ACCEPTED ===');
              console.log('Closing terms modal and creating booking');
              setShowTerms(false);
              console.log('Terms modal closed');
              
              // Now submit the booking with the data that's still in state
              console.log('Calling handleBookingSubmit with data:', bookingData);
              await handleBookingSubmit(); // This should create the booking
              console.log('handleBookingSubmit completed');
            } catch (error) {
              console.error('Error in terms acceptance:', error);
              setBookingError('Failed to create booking after terms acceptance. Please try again.');
            }
          }}          
          onCancel={() => {
            console.log('Terms and conditions cancelled');
            setShowTerms(false);
          }}
        />
      )}
      
      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowBookingModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Book {event.name}
                    </h3>
                    <div className="mt-4">
                      {bookingError && showBookingModal && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-800">{bookingError}</p>
                        </div>
                      )}
                        
                      {bookingSuccess && showBookingModal && (
                        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
                          <p className="text-sm text-green-800">Booking created successfully! Redirecting...</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Event Date</label>
                          <input
                            type="datetime-local"
                            value={bookingData.eventDate}
                            onChange={(e) => {
                              console.log('Event date changed:', e.target.value);
                              setBookingData({...bookingData, eventDate: e.target.value});
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Guest Count</label>
                          <input
                            type="number"
                            min="1"
                            value={bookingData.guestCount}
                            onChange={(e) => {
                              console.log('Guest count changed:', e.target.value);
                              setBookingData({...bookingData, guestCount: e.target.value});
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Venue Address</label>
                          <input
                            type="text"
                            value={bookingData.venueAddress}
                            onChange={(e) => {
                              console.log('Venue address changed:', e.target.value);
                              setBookingData({...bookingData, venueAddress: e.target.value});
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter your event venue address"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Special Requests (Optional)</label>
                          <textarea
                            value={bookingData.specialRequests}
                            onChange={(e) => {
                              console.log('Special requests changed:', e.target.value);
                              setBookingData({...bookingData, specialRequests: e.target.value});
                            }}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Any special requirements or requests..."
                          />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900">Total Price:</span>
                            <span className="text-lg font-bold text-indigo-600">${event.totalPrice}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Confirm Booking button clicked');
                    handleBookEvent();
                  }}
                  disabled={bookingLoading || bookingSuccess}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? 'Creating Booking...' : 'Confirm Booking'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  disabled={bookingLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}