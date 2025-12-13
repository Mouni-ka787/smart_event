'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useRouter, useParams } from 'next/navigation';

interface VendorDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
}

interface ServiceItem {
  name: string;
  price: string;
  isVendorService: boolean;
  serviceId: string;
  vendorDetails: VendorDetails;
}

export default function EditEventPage() {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    phoneNumber: '',
    email: '',
    photos: [] as string[],
    services: [{ name: '', price: '', isVendorService: false, serviceId: '', vendorDetails: { name: '', email: '', phone: '', address: '', serviceType: '' } }] as ServiceItem[]
  });
  const [allServices, setAllServices] = useState<any[]>([]);
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user || !user.token) {
          throw new Error('No authentication token found');
        }

        // Fetch the event data
        const eventData = await api.events.getById(id as string);
        setEvent(eventData);
        
        // Populate form with event data
        setEventForm({
          name: eventData.name || '',
          description: eventData.description || '',
          category: eventData.category || '',
          address: eventData.location?.address || '',
          phoneNumber: eventData.phoneNumber || '',
          email: eventData.email || '',
          photos: eventData.photos || [],
          services: eventData.services?.map((service: any) => ({
            name: service.name || '',
            price: service.price?.toString() || '',
            isVendorService: service.isVendorService || false,
            serviceId: service.service?._id || service.service || '',
            vendorDetails: {
              name: service.vendorName || '',
              email: service.vendorEmail || '',
              phone: service.vendorPhone || '',
              address: service.vendorAddress || '',
              serviceType: ''
            }
          })) || [{ name: '', price: '', isVendorService: false, serviceId: '', vendorDetails: { name: '', email: '', phone: '', address: '', serviceType: '' } }]
        });

        // Fetch all services for event creation
        const servicesResponse = await api.services.getAll();
        setAllServices(servicesResponse.services || []);
      } catch (err: any) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchEventData();
    }
  }, [user, id]);

  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setEventForm(prev => ({ ...prev, [id]: value }));
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
      
      setEventForm(prev => ({
        ...prev,
        photos: [...prev.photos, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setEventForm(prev => {
      const newImages = [...prev.photos];
      newImages.splice(index, 1);
      return { ...prev, photos: newImages };
    });
  };

  const handleServiceChange = (index: number, field: string, value: string | boolean) => {
    const updatedServices = [...eventForm.services];
    
    if (field === 'isVendorService') {
      updatedServices[index] = { 
        ...updatedServices[index], 
        isVendorService: value as boolean,
        name: value ? '' : updatedServices[index].name,
        price: value ? '' : updatedServices[index].price
      };
    } else if (field === 'serviceId') {
      // Find the selected service and populate its details
      const selectedService = allServices.find(service => service._id === value);
      if (selectedService) {
        updatedServices[index] = {
          ...updatedServices[index],
          serviceId: value as string,
          name: selectedService.name,
          price: selectedService.price.toString(),
          vendorDetails: {
            name: selectedService.vendor?.name || '',
            email: selectedService.vendor?.email || '',
            phone: selectedService.vendor?.phoneNumber || '',
            address: selectedService.vendor?.address || '',
            serviceType: selectedService.category || ''
          }
        };
      }
    } else {
      updatedServices[index] = { ...updatedServices[index], [field]: value as string };
    }
    
    setEventForm(prev => ({ ...prev, services: updatedServices }));
  };

  const addServiceField = () => {
    setEventForm(prev => ({
      ...prev,
      services: [...prev.services, { name: '', price: '', isVendorService: false, serviceId: '', vendorDetails: { name: '', email: '', phone: '', address: '', serviceType: '' } }]
    }));
  };

  const removeServiceField = (index: number) => {
    if (eventForm.services.length > 1) {
      const updatedServices = [...eventForm.services];
      updatedServices.splice(index, 1);
      setEventForm(prev => ({ ...prev, services: updatedServices }));
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (!user || !user.token) {
        throw new Error('No authentication token found');
      }

      // Prepare event data
      const eventData = {
        name: eventForm.name,
        description: eventForm.description,
        category: eventForm.category,
        phoneNumber: eventForm.phoneNumber,
        email: eventForm.email,
        photos: eventForm.photos,
        location: {
          type: 'Point',
          coordinates: [0, 0], // In a real app, you would get coordinates from address
          address: eventForm.address
        },
        services: eventForm.services.map(service => ({
          service: service.isVendorService ? service.serviceId : null,
          name: service.name,
          price: parseFloat(service.price) || 0,
          quantity: 1,
          isVendorService: service.isVendorService,
          ...(service.isVendorService && service.serviceId ? {
            vendorName: service.vendorDetails.name,
            vendorEmail: service.vendorDetails.email,
            vendorPhone: service.vendorDetails.phone,
            vendorAddress: service.vendorDetails.address
          } : {})
        })),
        totalPrice: eventForm.services.reduce((total, service) => total + (parseFloat(service.price) || 0), 0)
      };

      // Update event
      await api.events.update(user.token, id as string, eventData);
      
      // Show success message and redirect back to events list
      alert('Event updated successfully!');
      router.push('/dashboard/admin/events');
    } catch (err: any) {
      console.error('Error updating event:', err);
      alert('Failed to update event: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
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
          <p className="text-gray-600">Only admins can edit events.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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
                <h3 className="text-sm font-medium text-red-800">Error loading event</h3>
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
      {/* Page Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
              <p className="mt-1 text-sm text-gray-500">
                Update event details and services
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/admin/events')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Event Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Edit the details for this event.</p>
            </div>
            <div className="border-t border-gray-200">
              <form className="px-4 py-5 sm:px-6 space-y-6" onSubmit={handleUpdateEvent}>
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
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={eventForm.address}
                    onChange={handleEventFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
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
                            onChange={handleImageUpload}
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Services
                  </label>
                  <div className="mt-2 border border-gray-300 rounded-md p-4">
                    <div className="space-y-6">
                      {eventForm.services.map((service, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                          <div className="flex items-center mb-4">
                            <input
                              type="checkbox"
                              id={`isVendorService-${index}`}
                              checked={service.isVendorService}
                              onChange={(e) => handleServiceChange(index, 'isVendorService', e.target.checked)}
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor={`isVendorService-${index}`} className="ml-2 block text-sm font-medium text-gray-900">
                              Is this a vendor service?
                            </label>
                          </div>
                          
                          {service.isVendorService ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Select Vendor Service
                                </label>
                                <select
                                  value={service.serviceId}
                                  onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  required
                                >
                                  <option value="">Select a service</option>
                                  {allServices.map((svc) => (
                                    <option key={svc._id} value={svc._id}>
                                      {svc.name} - {svc.vendor?.name || 'Unknown Vendor'}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              {service.serviceId && (
                                <div className="bg-white border border-gray-200 rounded-md p-4">
                                  <h4 className="text-sm font-medium text-gray-900 mb-3">Vendor Service Details</h4>
                                  <div className="grid grid-cols-1 gap-3">
                                    <div>
                                      <span className="text-xs font-medium text-gray-500 uppercase">Service Type</span>
                                      <p className="text-sm text-gray-900 mt-1">{service.vendorDetails.serviceType}</p>
                                    </div>
                                    <div>
                                      <span className="text-xs font-medium text-gray-500 uppercase">Service Name</span>
                                      <p className="text-sm text-gray-900 mt-1">{service.name}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase">Vendor Name</span>
                                        <p className="text-sm text-gray-900 mt-1">{service.vendorDetails.name}</p>
                                      </div>
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase">Price</span>
                                        <p className="text-sm text-gray-900 mt-1">${service.price}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-xs font-medium text-gray-500 uppercase">Contact Information</span>
                                      <div className="mt-1 space-y-1">
                                        <p className="text-sm text-gray-900">📧 {service.vendorDetails.email}</p>
                                        <p className="text-sm text-gray-900">📞 {service.vendorDetails.phone}</p>
                                        <p className="text-sm text-gray-900">📍 {service.vendorDetails.address}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Service Name
                                </label>
                                <input
                                  type="text"
                                  value={service.name}
                                  onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  placeholder="Service name"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Price
                                </label>
                                <input
                                  type="number"
                                  value={service.price}
                                  onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  placeholder="Price"
                                  required
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeServiceField(index)}
                              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addServiceField}
                      className="mt-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Service
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/admin/events')}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Update Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}