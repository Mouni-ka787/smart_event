'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SimpleTracking from '@/components/SimpleTracking';
import TrackingModal from '@/components/TrackingModal';
import BookingDetailsModal from '@/components/BookingDetailsModal';

import api from '@/services/api';
import { useRouter } from 'next/navigation';
export default function VendorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentEarnings, setRecentEarnings] = useState<any[]>([]);
  const [servicePerformance, setServicePerformance] = useState<any[]>([]);
  const [vendorEvents, setVendorEvents] = useState<any[]>([]); // Events featuring vendor's services
  const [adminEvents, setAdminEvents] = useState<any[]>([]); // Admin-created events
  const [adminServices, setAdminServices] = useState<any[]>([]); // Admin-created services
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceUrl, setServiceUrl] = useState('');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingBooking, setTrackingBooking] = useState<any>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({    name: '',
    description: '',
    category: '',
    price: '',
    priceType: '',
    address: '',
    images: [] as string[]
  });
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    category: '',
    phoneNumber: '',
    email: '',
    address: '',
    photos: [] as string[],
    services: [] as any[]
  });
  const { user } = useAuth();
  const router = useRouter();
  
  // Load Google Maps API
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        return;
      }
      
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        return;
      }
      
      // Get API key from environment variables
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        console.warn('Google Maps API key not found in environment variables');
        return;
      }
      
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        if (!user || !user.token) {
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        // Check if user has vendor role
        if (user.role !== 'vendor') {
          setError('Access denied. Please make sure you are logged in as a vendor.');
          setLoading(false);
          return;
        }

        // Initialize vendor account if needed
        try {
          await api.vendor.initializeAccount(user.token);
        } catch (initError: any) {
          console.warn('Vendor initialization failed:', initError);
          // Continue even if initialization fails
        }

        // Fetch vendor stats
        try {
          const statsData = await api.vendor.getStats(user.token);
          setStats(statsData.stats);
        } catch (err: any) {
          console.error('Error fetching vendor stats:', err);
          if (err.message.includes('Authentication required')) {
            setError('Authentication failed. Please log in again.');
          } else if (err.message.includes('Access denied')) {
            setError('Access denied. Please make sure you are logged in as a vendor.');
          } else {
            setError('Failed to load vendor stats: ' + (err.message || 'Unknown error'));
          }
        }

        // Fetch vendor bookings
        try {
          const bookingsData = await api.vendor.getBookings(user.token, { limit: 5 });
          setUpcomingBookings(bookingsData);
        } catch (err: any) {
          console.error('Error fetching vendor bookings:', err);
          if (!err.message.includes('Authentication required') && !err.message.includes('Access denied')) {
            setError(prevError => prevError || 'Failed to load vendor bookings: ' + (err.message || 'Unknown error'));
          }
        }

        // Fetch recent earnings (paid bookings)
        try {
          const earningsData = await api.vendor.getBookings(user.token, { status: 'completed', limit: 5 });
          setRecentEarnings(earningsData);
        } catch (err: any) {
          console.error('Error fetching recent earnings:', err);
          if (!err.message.includes('Authentication required') && !err.message.includes('Access denied')) {
            setError(prevError => prevError || 'Failed to load recent earnings: ' + (err.message || 'Unknown error'));
          }
        }

        // Fetch service performance and all services
        try {
          const servicesData = await api.vendor.getServices(user.token);
          setServicePerformance(servicesData);
          
          // Fetch admin-created events
          try {
            const allServicesData = await api.services.getAll();
            // Filter to show only services not belonging to this vendor (admin-created services)
            const adminServicesData = allServicesData.services?.filter((service: any) => 
              service.vendor?._id !== user._id
            ) || [];
            setAdminServices(adminServicesData);
          } catch (err: any) {
            console.error('Error fetching all services:', err);
          }
          
          // Fetch admin-created events
          try {
            // Commented out: Vendors shouldn't access admin-only endpoints
            // const adminEventsData = await api.events.getAdminEvents(user.token);
            // setAdminEvents(adminEventsData.events || []);
          } catch (err: any) {
            console.error('Error fetching admin events:', err);
          }          
          // Fetch events after services are loaded
          try {
            const eventsResponse = await api.events.getAll();
            const eventsData = eventsResponse.events || [];
            // Filter events that include services from this vendor
            const vendorServicesIds = servicesData.map((service: any) => service._id);
            const filteredEvents = eventsData.filter((event: any) => 
              event.services?.some((service: any) => vendorServicesIds.includes(service.service))
            );
            setVendorEvents(filteredEvents);
          } catch (err: any) {
            console.error('Error fetching events:', err);
            // Don't set error for events as it's not critical
          }
        } catch (err: any) {
          console.error('Error fetching service performance:', err);
          if (!err.message.includes('Authentication required') && !err.message.includes('Access denied')) {
            setError(prevError => prevError || 'Failed to load service performance: ' + (err.message || 'Unknown error'));
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Check for edit parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editServiceId = urlParams.get('edit');
    
    if (editServiceId && servicePerformance.length > 0) {
      const serviceToEdit = servicePerformance.find(service => service._id === editServiceId);
      if (serviceToEdit) {
        handleEditService(serviceToEdit);
      }
    }
  }, [servicePerformance]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleServiceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setServiceForm(prev => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real implementation, you would upload files to a service like Cloudinary
    // For now, we'll just simulate by adding placeholder URLs
    const files = e.target.files;
    if (files && files.length > 0) {
      // Convert to array and create placeholder URLs
      const newImages = Array.from(files).map((file, index) => 
        URL.createObjectURL(file)
      );
      
      setServiceForm(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };
  
  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setEventForm(prev => ({ ...prev, [id]: value }));
  };
  
  const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real implementation, you would upload files to a service like Cloudinary
    // For now, we'll just simulate by adding placeholder URLs
    const files = e.target.files;
    if (files && files.length > 0) {
      // Convert to array and create placeholder URLs
      const newImages = Array.from(files).map((file, index) => 
        URL.createObjectURL(file)
      );
      
      setEventForm(prev => ({
        ...prev,
        photos: [...prev.photos, ...newImages]
      }));
    }
  };
  
  const removeEventImage = (index: number) => {
    setEventForm(prev => {
      const newImages = [...prev.photos];
      newImages.splice(index, 1);
      return { ...prev, photos: newImages };
    });
  };

  const removeImage = (index: number) => {
    setServiceForm(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  // Function to handle editing a service
  const handleEditService = (service: any) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price.toString(),
      priceType: service.priceType,
      address: service.location?.address || '',
      images: service.images || []
    });
    setShowServiceForm(true);
  };
  
  // Function to handle editing an event
  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      description: event.description,
      category: event.category,
      phoneNumber: event.phoneNumber,
      email: event.email,
      address: event.location?.address || '',
      photos: event.photos || [],
      services: event.services || []
    });
    setShowEventForm(true);
  };
  
  // Function to cancel editing event
  const handleCancelEditEvent = () => {
    setEditingEvent(null);
    setEventForm({
      name: '',
      description: '',
      category: '',
      phoneNumber: '',
      email: '',
      address: '',
      photos: [] as string[],
      services: [] as any[]
    });
    setShowEventForm(false);
    setShowSuccessMessage(false);
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      category: '',
      price: '',
      priceType: '',
      address: '',
      images: [] as string[]
    });
    setShowServiceForm(false);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user || !user.token) {
        throw new Error('No authentication token found');
      }

      // Prepare service data
      const serviceData = {
        name: serviceForm.name,
        description: serviceForm.description,
        category: serviceForm.category,
        price: parseFloat(serviceForm.price) || 0,
        priceType: serviceForm.priceType,
        images: serviceForm.images,
        location: {
          type: 'Point',
          coordinates: [0, 0], // In a real app, you would get coordinates from address
          address: serviceForm.address
        }
      };

      // Create or update service
      if (editingService) {
        // Update existing service
        await api.services.update(user.token, editingService._id, serviceData);
      } else {
        // Create new service
        await api.services.create(user.token, serviceData);
      }
    
      // Reset form and close modal
      setServiceForm({
        name: '',
        description: '',
        category: '',
        price: '',
        priceType: '',
        address: '',
        images: [] as string[]
      });
      setEditingService(null);
      setShowServiceForm(false);
    
      // Show success message using the existing success message state
      setSuccessMessage(editingService ? 'Service updated successfully!' : 'Service created successfully!');
      setShowSuccessMessage(true);
    
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    
      // If we were editing a service, navigate to the services page
      if (editingService) {
        // Use router to navigate to the services page
        router.push('/dashboard/vendor/services');
      } else {
        // Refresh services
        if (user.token) {
          const servicesData = await api.vendor.getServices(user.token);
          setServicePerformance(servicesData);
        }
      }
    } catch (err: any) {
      console.error('Error saving service:', err);
      alert('Failed to save service: ' + (err.message || 'Unknown error'));
    }
  };
  
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user || !user.token) {
        throw new Error('No authentication token found');
      }

      if (!editingEvent) {
        throw new Error('No event to update');
      }

      // Prepare event data
      const eventData = {
        name: eventForm.name,
        description: eventForm.description,
        category: eventForm.category,
        phoneNumber: eventForm.phoneNumber,
        email: eventForm.email,
        location: {
          type: 'Point',
          coordinates: [0, 0], // In a real app, you would get coordinates from address
          address: eventForm.address
        },
        photos: eventForm.photos,
        services: eventForm.services
      };

      // Update event
      await api.events.update(user.token, editingEvent._id, eventData);
      
      // Show success message
      setSuccessMessage('Event updated successfully!');
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      // Close the form
      handleCancelEditEvent();
      
      // Refresh admin events
      if (user.token) {
        api.events.getAdminEvents(user.token).then(data => {
          setAdminEvents(data.events || []);
        });
      }
    } catch (err: any) {
      console.error('Error updating event:', err);
      alert('Failed to update event: ' + (err.message || 'Unknown error'));
    }
};

  const handleDeleteService = async (serviceId: string) => {
    try {
      if (!user || !user.token) {
        throw new Error('No authentication token found');
      }

      await api.services.delete(user.token, serviceId);
      setSuccessMessage('Service deleted successfully!');
      setShowSuccessMessage(true);

      // Refresh services
      if (user.token) {
        const servicesData = await api.vendor.getServices(user.token);
        setServicePerformance(servicesData);
      }
    } catch (err: any) {
      console.error('Error deleting service:', err);
      alert('Failed to delete service: ' + (err.message || 'Unknown error'));
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      if (!user || !user.token) {
        throw new Error('No authentication token found');
      }

      // Confirm with user before rejecting
      const confirmReject = window.confirm('Are you sure you want to reject this booking? This action cannot be undone.');
      if (!confirmReject) {
        return;
      }

      // Update booking status to cancelled (rejected equivalent)
      await api.bookings.updateStatus(user.token, bookingId, 'cancelled');      
      // Show success message
      setSuccessMessage('Booking rejected successfully!');
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      // Refresh bookings
      if (user.token) {
        api.vendor.getBookings(user.token, { limit: 5 }).then(data => {
          setUpcomingBookings(data);
        });
      }
    } catch (err: any) {
      console.error('Error rejecting booking:', err);
      alert('Failed to reject booking: ' + (err.message || 'Unknown error'));
    }
  };
  const handleAcceptBooking = async (bookingId: string) => {
    try {
      if (!user || !user.token) {
        throw new Error('No authentication token found');
      }

      // Accept the service booking
      const updatedBooking = await api.vendor.acceptServiceBooking(user.token, bookingId);
      
      // Show success message
      setSuccessMessage('Booking accepted successfully!');
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      // Refresh bookings
      if (user.token) {
        api.vendor.getBookings(user.token, { limit: 5 }).then(data => {
          setUpcomingBookings(data);
        });
      }
    } catch (err: any) {
      console.error('Error accepting booking:', err);
      alert('Failed to accept booking: ' + (err.message || 'Unknown error'));
    }
  };

  // Handle viewing booking details
  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  // Handle closing booking details modal
  const handleCloseBookingDetails = () => {
    setShowBookingDetails(false);
    setSelectedBooking(null);
  };

  // Handle case where user is not a vendor
  if (user && user.role !== 'vendor') {
    return (      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don&apos;t have permission to access the vendor dashboard. Please login with a vendor account.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Account Setup Required</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      If you recently registered as a vendor, you may need to log out and log back in for the changes to take effect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                window.location.href = '/dashboard/' + user.role;
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to {user.role} dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">{successMessage}</span>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="bg-white shadow dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your services, bookings, and performance.
              </p>
            </div>
            <div className="flex space-x-3">
              {/* Extra settings button removed - using the 3-line menu instead */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900 dark:border-red-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            // Try to refresh the data
                            window.location.reload();
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Retry
                        </button>
                      </div>
                      <div className="mt-4 text-sm">
                        <p className="font-medium">Troubleshooting steps:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Log out and log back in to refresh your session</li>
                          <li>Make sure you registered as a vendor during sign up</li>
                          <li>Contact support if the issue persists</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">Upcoming Bookings</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.upcomingBookings || 0}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">Total Earnings</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.totalEarnings ? formatCurrency(stats.totalEarnings) : '$0.00'}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">Pending Payments</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.pendingPayments || 0}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888c-.783.57-.38 1.81.588 1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">Services</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.serviceCount || 0}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white shadow rounded-xl overflow-hidden dark:bg-gray-800">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <nav className="space-y-1">
                      <button 
                        onClick={() => {
                          setEditingService(null);
                          setServiceForm({
                            name: '',
                            description: '',
                            category: '',
                            price: '',
                            priceType: '',
                            address: '',
                            images: [] as string[]
                          });
                          setShowServiceForm(true);
                        }}
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white w-full text-left"
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <span>Create New Service</span>
                      </button>
                      <button 
                        onClick={() => router.push('/dashboard/vendor/services')}
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white w-full text-left"
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                        <span>View All Services</span>
                      </button>
                      <a href="#" className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                        <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Support</span>
                      </a>
                    </nav>
                  </div>
                </div>

                {/* Service Creation Form */}
                {showServiceForm && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                      <div className="mt-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            {editingService ? 'Edit Service' : 'Create New Service'}
                          </h3>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-2 px-7 py-3">
                          <p className="text-sm text-gray-500">
                            {editingService 
                              ? 'Update your service details.' 
                              : 'Create a new service that will be visible to users and admins.'}
                          </p>
                          <form className="mt-4 space-y-4" onSubmit={handleCreateService}>
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Service Name
                              </label>
                              <input
                                type="text"
                                id="name"
                                value={serviceForm.name}
                                onChange={handleServiceFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                              </label>
                              <textarea
                                id="description"
                                value={serviceForm.description}
                                onChange={handleServiceFormChange}
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              ></textarea>
                            </div>
                            
                            <div>
                              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                              </label>
                              <select
                                id="category"
                                value={serviceForm.category}
                                onChange={handleServiceFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              >
                                <option value="">Select a category</option>
                                <option value="Food & Beverage">Food & Beverage</option>
                                <option value="Photography">Photography</option>
                                <option value="Decoration">Decoration</option>
                                <option value="Audio/Visual">Audio/Visual</option>
                                <option value="Florals">Florals</option>
                                <option value="Planning">Planning</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                Price ($)
                              </label>
                              <input
                                type="number"
                                id="price"
                                value={serviceForm.price}
                                onChange={handleServiceFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="priceType" className="block text-sm font-medium text-gray-700">
                                Price Type
                              </label>
                              <select
                                id="priceType"
                                value={serviceForm.priceType}
                                onChange={handleServiceFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              >
                                <option value="">Select price type</option>
                                <option value="per_person">Per Person</option>
                                <option value="per_event">Per Event</option>
                                <option value="hourly">Hourly</option>
                                <option value="package">Package</option>
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Service Address (if applicable)
                              </label>
                              <input
                                type="text"
                                id="address"
                                value={serviceForm.address}
                                onChange={handleServiceFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Service Images
                              </label>
                              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                  <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <div className="flex text-sm text-gray-600">
                                    <label
                                      htmlFor="images"
                                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                    >
                                      <span>Upload files</span>
                                      <input
                                        id="images"
                                        name="images"
                                        type="file"
                                        className="sr-only"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                      />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                  </div>
                                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                              </div>
                              
                              {serviceForm.images.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                  {serviceForm.images.map((image, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={image}
                                        alt={`Preview ${index}`}
                                        className="h-20 w-full object-cover rounded-md"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                                      >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                {editingService ? 'Update Service' : 'Create Service'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Edit Form */}
                {showEventForm && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                      <div className="mt-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            {editingEvent ? 'Edit Event' : 'Create New Event'}
                          </h3>
                          <button
                            onClick={handleCancelEditEvent}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-2 px-7 py-3">
                          <p className="text-sm text-gray-500">
                            {editingEvent 
                              ? 'Update your event details.' 
                              : 'Create a new event that will be visible to users.'}
                          </p>
                          <form className="mt-4 space-y-4" onSubmit={handleUpdateEvent}>
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Event Name
                              </label>
                              <input
                                type="text"
                                id="name"
                                value={eventForm.name}
                                onChange={handleEventFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                              </label>
                              <textarea
                                id="description"
                                value={eventForm.description}
                                onChange={handleEventFormChange}
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              ></textarea>
                            </div>
                            
                            <div>
                              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                              </label>
                              <select
                                id="category"
                                value={eventForm.category}
                                onChange={handleEventFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              >
                                <option value="">Select a category</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Corporate">Corporate</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Conference">Conference</option>
                                <option value="Concert">Concert</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                Phone Number
                              </label>
                              <input
                                type="text"
                                id="phoneNumber"
                                value={eventForm.phoneNumber}
                                onChange={handleEventFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <input
                                type="email"
                                id="email"
                                value={eventForm.email}
                                onChange={handleEventFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Event Address
                              </label>
                              <input
                                type="text"
                                id="address"
                                value={eventForm.address}
                                onChange={handleEventFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Event Photos
                              </label>
                              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                  <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <div className="flex text-sm text-gray-600">
                                    <label
                                      htmlFor="photos"
                                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                    >
                                      <span>Upload files</span>
                                      <input
                                        id="photos"
                                        name="photos"
                                        type="file"
                                        className="sr-only"
                                        multiple
                                        accept="image/*"
                                        onChange={handleEventImageUpload}
                                      />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                  </div>
                                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                              </div>
                              
                              {eventForm.photos.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                  {eventForm.photos.map((photo, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={photo}
                                        alt={`Preview ${index}`}
                                        className="h-20 w-full object-cover rounded-md"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeEventImage(index)}
                                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                                      >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                              <button
                                type="button"
                                onClick={handleCancelEditEvent}
                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                {editingEvent ? 'Update Event' : 'Create Event'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upcoming Bookings */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Upcoming Bookings</h2>
                  </div>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {upcomingBookings.length > 0 ? (
                        upcomingBookings
                          .filter((booking: any) => booking.status !== 'cancelled')
                          .map((booking: any) => (
                            <li key={booking._id} className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-indigo-600">{booking.eventName || 'Service Booking'}</h3>
                                  <p className="text-sm text-gray-500">{booking.user?.name || 'N/A'} • {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Date not specified'}</p>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    booking.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {booking.status?.toUpperCase() || 'UNKNOWN'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex flex-wrap items-center justify-between">
                                <button
                                  onClick={() => handleViewBookingDetails(booking)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  View Details
                                </button>
                                
                                {booking.status === 'pending' && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleAcceptBooking(booking._id)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                      <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleRejectBooking(booking._id)}
                                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      Reject
                                    </button>
                                  </div>
                                )}
                                
                                {booking.status === 'confirmed' && (
                                  <div className="flex flex-col space-y-2">
                                    <p className="text-sm text-green-600 font-medium">✓ Booking accepted</p>
                                    <button
                                      onClick={() => {
                                        // Set tracking data and open tracking modal
                                        setTrackingBooking(booking);
                                        setShowTrackingModal(true);
                                      }}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                      </svg>
                                      Track
                                    </button>
                                  </div>
                                )}
                              </div>
                            </li>
                        ))
                      ) : (
                        <li>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="text-center py-4">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming bookings</h3>
                              <p className="mt-1 text-sm text-gray-500">You don't have any upcoming bookings yet.</p>
                            </div>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                {/* Booking Details Modal */}
                <BookingDetailsModal
                  isOpen={showBookingDetails}
                  onClose={() => setShowBookingDetails(false)}
                  booking={selectedBooking}
                />
                
                {/* Tracking Modal */}
                <TrackingModal
                  isOpen={showTrackingModal}
                  onClose={() => setShowTrackingModal(false)}
                  assignmentId={trackingBooking?._id || "asg_123456"}
                  bookingId={trackingBooking?._id || "book_789012"}
                  vendorId={user?._id || "vendor_000"}
                  venueLocation={trackingBooking?.venueLocation || { lat: 40.7128, lng: -74.0060 }}
                />
                
                {/* Notifications Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
                  </div>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
                    <div className="text-center py-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Notifications</h3>
                      <p className="mt-1 text-sm text-gray-500">Manage your notification preferences.</p>
                      <div className="mt-6">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit Notifications
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Earnings */}
                {/* Recent Earnings */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Earnings</h2>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {recentEarnings.length > 0 ? (
                        recentEarnings.map((booking: any) => (
                          <li key={booking._id}>
                            <a href="#" className="block hover:bg-gray-50">
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-indigo-600 truncate">{booking.service?.name || 'Service'}</p>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Paid
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      Client: {booking.user?.name || 'N/A'}
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>${booking.totalPrice} • {new Date(booking.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                            </a>
                          </li>
                        ))
                      ) : (
                        <li>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="text-center py-4">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent earnings</h3>
                              <p className="mt-1 text-sm text-gray-500">You haven't received any payments yet.</p>
                            </div>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Service Performance */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Service Performance</h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {servicePerformance.length > 0 ? (
                      servicePerformance.map((service: any) => (
                        <div key={service._id} className="bg-white overflow-hidden shadow rounded-lg">
                          <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                              </div>
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="ml-1 text-sm font-medium text-gray-700">{service.performance?.rating?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Total Bookings</p>
                                <p className="text-lg font-semibold text-gray-900">{service.performance?.bookingCount || 0}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Revenue</p>
                                <p className="text-lg font-semibold text-gray-900">{service.price ? formatCurrency(service.price) : '$0.00'}</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <button 
                                onClick={() => handleEditService(service)}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Edit Service
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2">
                        <div className="bg-white shadow rounded-lg p-8 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No services created</h3>
                          <p className="mt-1 text-sm text-gray-500">Get started by creating a new service.</p>
                          <div className="mt-6">
                            <button
                              onClick={() => {
                                setEditingService(null);
                                setServiceForm({
                                  name: '',
                                  description: '',
                                  category: '',
                                  price: '',
                                  priceType: '',
                                  address: '',
                                  images: [] as string[]
                                });
                                setShowServiceForm(true);
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Create Service
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}