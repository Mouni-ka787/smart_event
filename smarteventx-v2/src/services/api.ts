// API service for SmartEventX frontend
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
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
};

// Bookings API
export const bookingsAPI = {
  create: (token: string, bookingData: { serviceId: string; eventName: string; eventDate: string; guestCount: number; specialRequests?: string }) => 
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
};

export default {
  auth: authAPI,
  services: servicesAPI,
  bookings: bookingsAPI,
  ai: aiAPI,
  admin: adminAPI,
  vendor: vendorAPI,
};