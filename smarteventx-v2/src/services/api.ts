// API service for EWE frontend
// Normalize base URL: remove trailing slash and a trailing '/api' if present
let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://smart-event-backend.onrender.com';
API_BASE_URL = API_BASE_URL.replace(/\/$/, '');
// Ensure base ends with '/api' so we have a single source of truth for the API prefix
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL + '/api';
}

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  console.log('=== API REQUEST FUNCTION CALLED ===');
  console.log('Endpoint:', endpoint);
  console.log('Options:', options);
  
  // Normalize endpoint so callers can use either '/api/...' or '/...'
  const cleanedEndpoint = endpoint.replace(/^\/api/, '');
  const url = `${API_BASE_URL}${cleanedEndpoint.startsWith('/') ? '' : '/'}${cleanedEndpoint}`;
  
  // Log the constructed URL for debugging
  console.log('API request - Constructed URL:', url);
  console.log('API request - Endpoint:', endpoint);
  
  // Set default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Merge headers properly
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  // Remove Content-Type header for GET requests or when body is FormData
  if (options.method === 'GET' || options.method === 'HEAD' || options.body instanceof FormData) {
    delete (config.headers as any)['Content-Type'];
  }
  
  // Log the request for debugging
  console.log('=== API REQUEST ===');
  console.log('URL:', url);
  console.log('Method:', options.method || 'GET');
  console.log('Headers:', config.headers);
  if (options.body) {
    try {
      console.log('Body:', JSON.parse(options.body.toString()));
    } catch (e) {
      console.log('Body (non-JSON):', options.body.toString());
    }
  }
  
  try {
    const response = await fetch(url, config);
    
    // Log the response for debugging
    console.log('=== API RESPONSE ===');
    console.log('URL:', url);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = 'Something went wrong';
      
      try {
        const errorData = await response.json();
        console.log('API Error Response:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        console.log('Could not parse error response as JSON');
        errorMessage = response.statusText || errorMessage;
      }
      
      console.error('API Error:', errorMessage);
      
      // Provide more specific error handling
      if (response.status === 401) {
        throw new Error('Invalid credentials');
      } else if (response.status === 404) {
        throw new Error('API endpoint not found');
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('API Success Response:', result);
    return result;
  } catch (error: any) {
    console.error('API request failed:', error);
    
    // Provide more user-friendly error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please make sure the backend server is running on port 5000.');
    }
    
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData: { name: string; email: string; password: string; role: string; phoneNumber?: string }) => 
    apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  login: (credentials: { email: string; password: string }) => 
    apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  getProfile: (token: string) => 
    apiRequest('/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  updateProfile: (token: string, userData: Partial<{ name: string; email: string; phoneNumber: string; address: string }>) => 
    apiRequest('/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    }),
};

// Services API
export const servicesAPI = {
  getAll: (params?: { page?: number; category?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/services${queryString}`);
  },
  
  getById: (id: string) => apiRequest(`/services/${id}`),
  
  getByVendor: (vendorId: string) => apiRequest(`/services/vendor/${vendorId}`),
  
  create: (token: string, serviceData: any) => 
    apiRequest('/services', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    }),
    
  update: (token: string, id: string, serviceData: any) => 
    apiRequest(`/services/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    }),
    
  delete: (token: string, id: string) => 
    apiRequest(`/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
};

// Bookings API
export const bookingsAPI = {
  // Create booking for event package
  createEventBooking: (token: string, bookingData: { 
    eventId: string; 
    eventName: string; 
    eventDate: string; 
    guestCount: number; 
    venueAddress: string;
    venueLat: number;
    venueLng: number;
    specialRequests?: string 
  }) => {
    console.log('=== CREATE EVENT BOOKING API CALL ===');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Booking data:', bookingData);
    return apiRequest('/bookings/event', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
  },

  // Create booking for vendor service
  createServiceBooking: (token: string, bookingData: { 
    serviceId: string; 
    serviceName: string; 
    eventDate: string; 
    guestCount: number; 
    venueAddress: string;
    venueLat: number;
    venueLng: number;
    specialRequests?: string 
  }) => 
    apiRequest('/bookings/service', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    }),
  
  create: (token: string, bookingData: { serviceId: string; eventName: string; eventDate: string; guestCount: number; venueAddress: string; venueLat: number; venueLng: number; specialRequests?: string }) => 
    apiRequest('/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    }),
  
  getUserBookings: (token: string) => 
    apiRequest('/bookings/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getVendorBookings: (token: string) => 
    apiRequest('/bookings/vendor', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getById: (token: string, id: string) => 
    apiRequest(`/bookings/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  updateStatus: (token: string, id: string, status: string) => 
    apiRequest(`/bookings/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }),
  
  updateTracking: (token: string, id: string, trackingData: any) => 
    apiRequest(`/bookings/${id}/tracking`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(trackingData),
    }),
  
  releasePayment: (token: string, id: string, qrCode: string) => 
    apiRequest(`/bookings/${id}/release-payment`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ qrCode }),
    }),
  
  // Generate QR code for payment
  generatePaymentQR: (token: string, id: string) => 
    apiRequest(`/bookings/${id}/generate-qr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  // Process payment with QR scan
  processPayment: (token: string, id: string, qrData: string) => 
    apiRequest(`/bookings/${id}/process-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ qrData }),
    }),
  
  // Process payment with QR scan (Admin)
  processServicePayment: (token: string, id: string) => 
    apiRequest(`/bookings/${id}/process-service-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  // Accept booking (admin)
  acceptBooking: (token: string, id: string) => 
    apiRequest(`/bookings/event/${id}/accept`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  // Start service (admin)
  startService: (token: string, id: string, location: { lat: number; lng: number }) => 
    apiRequest(`/bookings/event/${id}/start-service`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ location }),
    }),
  
  // Complete service (admin) - generates QR for payment
  completeService: (token: string, id: string) => 
    apiRequest(`/bookings/event/${id}/complete-service`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  // Get booking tracking info (User)
  getTracking: (token: string, id: string) => 
    apiRequest(`/bookings/${id}/admin-tracking`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  // PayPal payment functions
  createPayPalOrder: (token: string, bookingId: string) => 
    apiRequest('/payments/paypal/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ bookingId }),
    }),

  capturePayPalPayment: (token: string, orderId: string) => 
    apiRequest('/payments/paypal/capture', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId }),
    }),
  
  // Accept service booking (Vendor)
  acceptServiceBooking: (token: string, id: string) => 
    apiRequest(`/bookings/service/${id}/accept`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
    
  // Start service tracking (Vendor)
  startServiceTracking: (token: string, id: string, location: { lat: number; lng: number }) => 
    apiRequest(`/bookings/service/${id}/start-tracking`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ location }),
    }),
    
  // Complete service (Vendor)
  completeServiceBooking: (token: string, id: string) => 
    apiRequest(`/bookings/service/${id}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

};

// AI Recommendations API
export const aiAPI = {
  getPersonalized: (token: string, params?: { categories?: string[]; budgetMin?: number; budgetMax?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.categories) params.categories.forEach(cat => queryParams.append('categories', cat));
    if (params?.budgetMin) queryParams.append('budgetMin', params.budgetMin.toString());
    if (params?.budgetMax) queryParams.append('budgetMax', params.budgetMax.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/ai/recommendations/personalized${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  
  getBasedOnHistory: (token: string, categories: string[]) => {
    const queryParams = new URLSearchParams();
    categories.forEach(cat => queryParams.append('categories', cat));
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/ai/recommendations/history${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  
  getTrending: (token: string) => 
    apiRequest('/ai/recommendations/trending', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getPriceSuggestions: (token: string, category: string) => 
    apiRequest(`/ai/pricing/suggestions?category=${category}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
};

// Admin API
export const adminAPI = {
  getStats: (token: string) => 
    apiRequest('/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getAnalytics: (token: string) => 
    apiRequest('/admin/analytics', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getTopVendors: (token: string) => 
    apiRequest('/admin/vendors/top', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getBundleSuggestions: (token: string) => 
    apiRequest('/admin/bundles/suggestions', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getWeakServiceAlerts: (token: string) => 
    apiRequest('/admin/services/alerts', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getTrendingServices: (token: string) => 
    apiRequest('/admin/services/trending', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  // New endpoint to get all services for admin
  getAllServices: (token: string) => 
    apiRequest('/admin/services', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
    
  // New endpoint to assign vendor to service
  assignVendorToService: (token: string, serviceId: string, assignmentData: any) => 
    apiRequest(`/admin/services/${serviceId}/assign-vendor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignmentData),
    }),
  
  // New endpoint to get all events for admin
  getAllEvents: (token: string) => 
    apiRequest('/admin/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  // Get admin's bookings
  getBookings: (token: string, params?: { status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/admin/bookings${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  
  // Get all vendor assignments for admin dashboard
  getVendorAssignments: (token: string) => 
    apiRequest('/admin/vendor-assignments', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  // Get all vendors for admin
  getAllVendors: (token: string) => 
    apiRequest('/vendors', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
    
  // Get trackable bookings (bookings that need vendor assignments)
  getTrackableBookings: (token: string) => 
    apiRequest('/admin/tracking/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  // Assign vendor to booking
  assignVendorToBooking: (token: string, bookingId: string, assignmentData: any) => 
    apiRequest(`/admin/tracking/bookings/${bookingId}/assign-vendor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignmentData),
    }),

  // Get vendor booked services
  getVendorBookedServices: (token: string) => 
    apiRequest('/admin/vendor-assignments', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
};

// Vendor API
export const vendorAPI = {
  getStats: (token: string) => 
    apiRequest('/vendors/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getBookings: (token: string, params?: { status?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/vendors/bookings${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  
  getServices: (token: string) => 
    apiRequest('/vendors/services', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  createService: (token: string, serviceData: any) => 
    apiRequest('/services', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    }),
  
  getPerformance: (token: string) => 
    apiRequest('/vendors/performance', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getPriceSuggestions: (token: string, category: string) => 
    apiRequest(`/vendors/pricing/suggestions?category=${category}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  getMatchmaking: (token: string) => 
    apiRequest('/vendors/matchmaking', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  
  // Initialize vendor account
  initializeAccount: (token: string) => 
    apiRequest('/vendors/init', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
    
  // Get vendor events where vendor's services are included
  getEvents: (token: string) => 
    apiRequest('/vendors/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
    
  // Accept service booking (Vendor) - Fixed endpoint
  acceptServiceBooking: (token: string, id: string) => 
    apiRequest(`/bookings/service/${id}/accept`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
    
  // Start service tracking (Vendor)
  startService: (token: string, id: string, location: { lat: number; lng: number }) => 
    apiRequest(`/bookings/service/${id}/start-tracking`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ location }),
    }),
    
  // Complete service (Vendor)
  completeService: (token: string, id: string) => 
    apiRequest(`/bookings/service/${id}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
};

// Events API
export const eventsAPI = {
  create: (token: string, eventData: any) => 
    apiRequest('/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    }),
  
  getAll: (params?: { page?: number; category?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/events${queryString}`);
  },
  
  getAdminEvents: (token: string, params?: { page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/events/admin${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  
  getById: (id: string) => {
    console.log('API service - Fetching event with ID:', id);
    return apiRequest(`/events/${id}`);
  },
  
  update: (token: string, id: string, eventData: any) => 
    apiRequest(`/events/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    }),
    
  delete: (token: string, id: string) => 
    apiRequest(`/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
};

// Google Maps API
export const mapsAPI = {
  // In a real implementation, you would use the Google Maps Geocoding API
  // For now, we'll simulate getting coordinates from an address
  getCoordinates: async (address: string) => {
    // This is a mock implementation
    // In a real app, you would integrate with Google Maps Geocoding API
    console.log('Getting coordinates for address:', address);
    // Return mock coordinates (New York City as default)
    return {
      lat: 40.7128,
      lng: -74.0060
    };
  }
};

// Location tracking API
export const locationAPI = {
  // Update vendor location
  updateLocation: (token: string, vendorId: string, locationData: any) => 
    apiRequest(`/vendors/${vendorId}/location`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(locationData),
    }),
  
  // Update assignment status
  updateAssignmentStatus: (token: string, bookingId: string, status: string) => 
    apiRequest(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }),
  
  // Get booking tracking info
  getTrackingInfo: (token: string, bookingId: string) => 
    apiRequest(`/bookings/${bookingId}/tracking`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
};

export default {
  auth: authAPI,
  services: servicesAPI,
  bookings: bookingsAPI,
  ai: aiAPI,
  admin: adminAPI,
  vendor: vendorAPI,
  events: eventsAPI,
  maps: mapsAPI,
  location: locationAPI,
};