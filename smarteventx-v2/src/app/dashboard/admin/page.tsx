'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

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

// Define the type for the ChangeEvent that handles input, textarea, and select elements
type FormChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;


export default function AdminDashboard() {
    // FIXED: Explicitly typing states (e.g., error: string | null) to resolve TS Code 2345
    const [stats, setStats] = useState<any>(null);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [eventBookings, setEventBookings] = useState<any[]>([]);
    const [topVendors, setTopVendors] = useState<any[]>([]);
    const [serviceAnalytics, setServiceAnalytics] = useState<any[]>([]);
    const [vendorBookedServices, setVendorBookedServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // TS 2345 FIX
    const [showEventForm, setShowEventForm] = useState(false);

    const initialServiceItem: ServiceItem = { name: '', price: '', isVendorService: false, serviceId: '', vendorDetails: { name: '', email: '', phone: '', address: '', serviceType: '' } };

    const [eventForm, setEventForm] = useState({
        name: '', description: '', category: '', address: '',
        phoneNumber: '', email: '', photos: [] as string[],
        services: [initialServiceItem] as ServiceItem[]
    });

    const [allServices, setAllServices] = useState<any[]>([]);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [trackingUpdates, setTrackingUpdates] = useState<any[]>([]);

    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                if (!user || !user.token) {
                    setError('No authentication token found');
                    setLoading(false);
                    return;
                }

                // Fetch admin stats
                const statsData = await api.admin.getStats(user.token);
                setStats(statsData.stats);
                setRecentBookings(statsData.recentBookings);

                // Fetch top vendors
                const vendorsData = await api.admin.getTopVendors(user.token);
                setTopVendors(vendorsData);

                // Fetch analytics
                const analyticsData = await api.admin.getAnalytics(user.token);
                setServiceAnalytics(analyticsData.serviceAnalytics);

                // Fetch all services for event creation
                const servicesResponse = await api.services.getAll();
                setAllServices(servicesResponse.services || []);

                // Fetch event bookings
                const bookingsData = await api.admin.getBookings(user.token);
                setEventBookings(bookingsData || []);

                // Fetch vendor booked services
                try {
                    const vendorAssignments = await api.admin.getVendorAssignments(user.token);
                    console.log('Vendor assignments fetched:', vendorAssignments);
                    setVendorBookedServices(vendorAssignments || []);
                } catch (err: any) {
                    console.error('Error fetching vendor booked services:', err);
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

    const handleEventFormChange = (e: FormChangeEvent) => {
        const { id, value } = e.target;
        setEventForm(prev => ({ ...prev, [id]: value }));
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
            const selectedService = allServices.find(service => (service as any)._id === value);

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

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
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
                    coordinates: [0, 0], // Placeholder coordinates
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

            console.log('Sending event data:', eventData);
            console.log('User token:', user.token);

            await api.events.create(user.token, eventData);

            // Reset form and close modal
            setEventForm({
                name: '',
                description: '',
                category: '',
                address: '',
                phoneNumber: '',
                email: '',
                photos: [],
                services: [{ name: '', price: '', isVendorService: false, serviceId: '', vendorDetails: { name: '', email: '', phone: '', address: '', serviceType: '' } }]
            });

            setShowEventForm(false);
            alert('Service package created successfully!');
        } catch (err: any) {
            console.error('Error creating service package:', err);
            alert('Failed to create service package: ' + (err.message || 'Unknown error'));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const newImages = Array.from(files).map((file) =>
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
            const newPhotos = [...prev.photos];
            newPhotos.splice(index, 1);
            return { ...prev, photos: newPhotos };
        });
    };

    const handleAcceptVendorBooking = async (bookingId: string) => {
        try {
            if (!user || !user.token) {
                throw new Error('No authentication token found');
            }

            const updatedBooking = await api.bookings.acceptServiceBooking(user.token, bookingId);

            setVendorBookedServices(prev =>
                prev.map(service =>
                    (service as any)._id === bookingId
                        ? { ...service, status: updatedBooking.status, booking: updatedBooking }
                        : service
                )
            );

            alert('Booking accepted successfully!');
        } catch (err: any) {
            console.error('Error accepting booking:', err);
            alert('Failed to accept booking: ' + (err.message || 'Unknown error'));
        }
    };

    const handleStartServiceTracking = async (bookingId: string) => {
        try {
            if (!user || !user.token) {
                throw new Error('No authentication token found');
            }

            // For now, we'll use mock coordinates
            const mockLocation = {
                lat: 40.7128, // New York City latitude
                lng: -74.0060 // New York City longitude
            };

            const updatedBooking = await api.bookings.startServiceTracking(user.token, bookingId, mockLocation);

            setVendorBookedServices(prev =>
                prev.map(service =>
                    (service as any)._id === bookingId
                        ? { ...service, status: updatedBooking.status, booking: updatedBooking }
                        : service
                )
            );

            alert('Service tracking started!');
        } catch (err: any) {
            console.error('Error starting service tracking:', err);
            alert('Failed to start service tracking: ' + (err.message || 'Unknown error'));
        }
    };

    const handleCompleteService = async (bookingId: string) => {
        try {
            if (!user || !user.token) {
                throw new Error('No authentication token found');
            }

            const result = await api.bookings.completeServiceBooking(user.token, bookingId);

            setVendorBookedServices(prev =>
                prev.map(service =>
                    (service as any)._id === bookingId
                        ? { ...service, status: 'COMPLETED', booking: result.booking }
                        : service
                )
            );

            // Show QR code information in alert
            if (result && result.qrCode) {
                alert(`Service completed! QR code generated for payment. Scan this QR code to complete payment.`);
            } else {
                alert('Service completed! QR code generated for payment.');
            }
        } catch (err: any) {
            console.error('Error completing service:', err);
            alert('Failed to complete service: ' + (err.message || 'Unknown error'));
        }
    };

    const handleViewTracking = (assignment: any) => {
        setSelectedBooking(assignment);

        if (assignment.booking?.vendorTrackingInfo?.updates) {
            setTrackingUpdates(assignment.booking.vendorTrackingInfo.updates);
        } else {
            setTrackingUpdates([]);
        }

        setShowTrackingModal(true);
    };

    return (
        // Start of major structure wrapper
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <header className="bg-white shadow dark:bg-gray-800">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
                        Admin Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your services, vendors, and bookings.
                    </p>
                </div>
            </header>

            {/* FIXED: Main tag is now correctly opened (resolves TS 17008/17002 at line 367, as noted in source) */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

                {/* FIXED: Correctly structured conditional rendering (resolves TS 1005 at line 1322, as noted in source) */}
                {loading ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading...</div>
                ) : error ? (
                    <div className="rounded-md bg-red-50 p-4">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="mt-2 text-sm text-red-700">{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            {/* Stat 1: Total Bookings (Content wrapped in dt/dd tags) */}
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {stats?.totalBookings || 0}
                                </dd>
                            </div>
                            {/* Stat 2: Total Revenue (Content wrapped in dt/dd tags) */}
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    ${stats?.totalRevenue ? (stats.totalRevenue / 1000).toFixed(1) + 'k' : '0'}
                                </dd>
                            </div>
                            {/* Stat 3: Active Vendors (Content wrapped in dt/dd tags) */}
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Vendors</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {stats?.activeVendors || 0}
                                </dd>
                            </div>
                            {/* Stat 4: Pending Payments (Content wrapped in dt/dd tags) */}
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Payments</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {stats?.pendingPayments || 0}
                                </dd>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                                {/* FIXED: Floating attributes and text wrapped in <button> (resolves TS 1381 at line 1318, as noted in source) */}
                                <button
                                    onClick={() => setShowEventForm(true)}
                                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white w-full text-left"
                                >
                                    Create New Service Package
                                </button>
                                {/* FIXED: Floating attributes and text wrapped in <button> */}
                                <button
                                    onClick={() => router.push('/dashboard/admin/services')}
                                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white w-full text-left"
                                >
                                    View All Services
                                </button>
                                {/* FIXED: Floating attributes and text wrapped in <button> */}
                                <button
                                    onClick={() => router.push('/dashboard/admin/events')}
                                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white w-full text-left"
                                >
                                    View All Events
                                </button>
                                {/* FIXED: Floating attributes and text wrapped in <button> */}
                                <button
                                    onClick={() => router.push('/dashboard/admin/services')}
                                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white w-full text-left"
                                >
                                    View Services
                                </button>
                            </div>
                        </div>

                        {/* Event Creation Form Modal/Section */}
                        {showEventForm && (
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50 overflow-y-auto">
                                <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                Create New Service Package
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowEventForm(false)}
                                                className="text-gray-400 hover:text-gray-500"
                                            >
                                                <span className="sr-only">Close panel</span>
                                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Create a new service package with services for users to book.
                                        </p>

                                        <form className="mt-6 space-y-6" onSubmit={handleCreateEvent}>
                                            {/* Package Name */}
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Package Name</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    value={eventForm.name}
                                                    onChange={handleEventFormChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                />
                                            </div>

                                            {/* Description (FIXED: Attributes enclosed in <textarea>) */}
                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                                <textarea
                                                    id="description"
                                                    value={eventForm.description}
                                                    onChange={handleEventFormChange}
                                                    rows={3}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                />
                                            </div>

                                            {/* Category (FIXED: Attributes enclosed in <select>) */}
                                            <div>
                                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
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

                                            {/* Address Input */}
                                            <div>
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                                <input
                                                    type="text"
                                                    id="address"
                                                    value={eventForm.address}
                                                    onChange={handleEventFormChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                />
                                            </div>

                                            {/* Phone Number Input */}
                                            <div>
                                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                                <input
                                                    type="text"
                                                    id="phoneNumber"
                                                    value={eventForm.phoneNumber}
                                                    onChange={handleEventFormChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                />
                                            </div>

                                            {/* Email Input */}
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={eventForm.email}
                                                    onChange={handleEventFormChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                />
                                            </div>

                                            {/* Event Photos Upload (FIXED: Raw SVG path attributes enclosed) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Photos</label>
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
                                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
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
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                                                    </div>
                                                </div>

                                                {/* Photo Previews */}
                                                {eventForm.photos.map((photo, index) => (
                                                    <div key={index} className="relative inline-block mr-2 mb-2">
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
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Services Block */}
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white pt-4">Services</h4>
                                            {eventForm.services.map((service, index) => (
                                                <div key={index} className="space-y-4 border p-4 rounded-md relative">
                                                    {/* Checkbox (FIXED: Attributes enclosed in <input>) */}
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`isVendorService-${index}`}
                                                            checked={service.isVendorService}
                                                            onChange={(e) => handleServiceChange(index, 'isVendorService', e.target.checked)}
                                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                        />
                                                        <label htmlFor={`isVendorService-${index}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                                            Is this a vendor service?
                                                        </label>
                                                    </div>

                                                    {service.isVendorService ? (
                                                        // Vendor Service Selector
                                                        <div className="space-y-4">
                                                            <label htmlFor={`serviceId-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Vendor Service</label>
                                                            <select
                                                                id={`serviceId-${index}`}
                                                                value={service.serviceId}
                                                                onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                required
                                                            >
                                                                <option value="">Select a service</option>
                                                                {/* FIXED: Mapping returns <option> elements (Source content fixed) */}
                                                                {allServices.map((svc: any) => (
                                                                    <option key={svc._id || svc.id || svc.name} value={svc._id}>
                                                                        {svc.name} - {svc.vendor?.name || 'Unknown Vendor'}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {service.serviceId && (
                                                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Vendor Service Details</h5>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-300">Service Type: {service.vendorDetails.serviceType}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-300">Service Name: {service.name}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-300">Vendor Name: {service.vendorDetails.name}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-300">Price: ${service.price}</p>
                                                                    <h6 className="text-xs font-semibold mt-2 text-gray-700 dark:text-gray-200">Contact Information</h6>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-300">📧 {service.vendorDetails.email}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-300">📞 {service.vendorDetails.phone}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-300">📍 {service.vendorDetails.address}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // Custom Service Inputs
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label htmlFor={`service-name-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service Name</label>
                                                                <input
                                                                    type="text"
                                                                    id={`service-name-${index}`}
                                                                    value={service.name}
                                                                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:focus:border-indigo-500 sm:text-sm"
                                                                    placeholder="Service name"
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <label htmlFor={`service-price-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                                                                <input
                                                                    type="number"
                                                                    id={`service-price-${index}`}
                                                                    value={service.price}
                                                                    onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:focus:border-indigo-500 sm:text-sm"
                                                                    placeholder="Price"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Remove Button (FIXED: Attributes attached to <button> tag) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeServiceField(index)}
                                                        className="absolute top-0 right-0 m-2 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Add Service Button (FIXED: Attributes attached to <button> tag) */}
                                            <button
                                                type="button"
                                                onClick={addServiceField}
                                                className="mt-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Add Service
                                            </button>

                                            {/* Form Submission Buttons */}
                                            <div className="pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEventForm(false)}
                                                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Create Package
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Event Bookings from Users */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Event Bookings from Users</h2>
                            <div className="space-y-4">
                                {eventBookings.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
                                ) : (
                                    eventBookings.map((booking: any) => (
                                        <div key={booking._id || booking.id || Math.random()} className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{booking.eventName || booking.event?.name || 'Event'}</h3>
                                            {/* FIXED: Status logic wrapped in <span> tag (Source content fixed) */}
                                            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium mt-2 ${
                                                booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                booking.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                                {booking.status}
                                            </span>
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">User: {booking.user?.name || 'N/A'} ({booking.user?.email || 'N/A'})</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Event Date: {new Date(booking.eventDate).toLocaleDateString()}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Guests: {booking.guestCount || 0}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Venue: {booking.venueLocation?.address || 'N/A'}</p>
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Price: ${booking.totalPrice || 0}</p>
                                            {booking.specialRequests && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">Special Requests: {booking.specialRequests}</p>
                                            )}

                                            <div className="mt-4 flex space-x-2">
                                                {/* FIXED: Floating attributes attached to <button> tags (Source content fixed) */}
                                                {booking.status === 'pending' && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                if (user && user.token) {
                                                                    await api.bookings.acceptBooking(user.token, booking._id);
                                                                }
                                                                // Refresh bookings
                                                                if (user && user.token) {
                                                                    const bookingsData = await api.admin.getBookings(user.token);
                                                                    setEventBookings(bookingsData || []);
                                                                }
                                                                alert('Booking accepted successfully!');
                                                            } catch (err: any) {
                                                                alert('Failed to accept booking: ' + (err.message || 'Unknown error'));
                                                            }
                                                        }}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition duration-200 hover:scale-105 shadow-sm"
                                                        disabled={!user}
                                                    >
                                                        Accept Booking
                                                    </button>
                                                )}

                                                {/* FIXED: Floating attributes attached to <button> tags (Source content fixed) */}
                                                {booking.status === 'confirmed' && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                // Get current location (you can use geolocation API)
                                                                navigator.geolocation.getCurrentPosition(
                                                                    async (position) => {
                                                                        if (user && user.token) {
                                                                            await api.bookings.startService(user.token, booking._id, {
                                                                                lat: position.coords.latitude,
                                                                                lng: position.coords.longitude
                                                                            });
                                                                        }
                                                                        // Refresh bookings
                                                                        if (user && user.token) {
                                                                            const bookingsData = await api.admin.getBookings(user.token);
                                                                            setEventBookings(bookingsData || []);
                                                                        }
                                                                    },
                                                                    () => {
                                                                        // Fallback to default location
                                                                        if (user && user.token) {
                                                                            api.bookings.startService(user.token, booking._id, {
                                                                                lat: 0,
                                                                                lng: 0
                                                                            }).then(async () => {
                                                                                const bookingsData = await api.admin.getBookings(user.token);
                                                                                setEventBookings(bookingsData || []);
                                                                                alert('Service started! (Location not available)');
                                                                            });
                                                                        }
                                                                    }
                                                                );
                                                            } catch (err: any) {
                                                                alert('Failed to start service: ' + (err.message || 'Unknown error'));
                                                            }
                                                        }}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition duration-200 hover:scale-105 shadow-sm"
                                                        disabled={!user}
                                                    >
                                                        Start Service
                                                    </button>
                                                )}

                                                {/* FIXED: Floating attributes attached to <button> tags (Source content fixed) */}
                                                {booking.status === 'in_progress' && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                if (user && user.token) {
                                                                    const result = await api.bookings.completeService(user.token, booking._id);

                                                                    if (user && user.token) {
                                                                        const bookingsData = await api.admin.getBookings(user.token);
                                                                        setEventBookings(bookingsData || []);
                                                                    }

                                                                    // Show QR code in alert or display it visually
                                                                    if (result && result.qrCode) {
                                                                        alert(`Service completed! QR code generated for payment. Scan this QR code to complete payment.`);
                                                                    } else {
                                                                        alert('Service completed! QR code generated for payment.');
                                                                    }
                                                                }
                                                            } catch (err: any) {
                                                                alert('Failed to complete service: ' + (err.message || 'Unknown error'));
                                                            }
                                                        }}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition duration-200 hover:scale-105 shadow-sm"
                                                        disabled={!user}
                                                    >
                                                        Complete Service
                                                    </button>
                                                )}

                                                {/* Display for completed bookings with QR code */}
                                                {booking.status === 'completed' && (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-green-600">
                                                            ✓ Service Completed - Awaiting Payment
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">QR Code Generated</p>
                                                        {booking.qrCode && (
                                                            <div className="mt-2">
                                                                <img 
                                                                    src={booking.qrCode} 
                                                                    alt="Payment QR Code" 
                                                                    className="w-32 h-32 border border-gray-200 rounded-md"
                                                                />
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Scan this QR code to complete payment
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Booked Vendor Services */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Booked Vendor Services</h2>
                            <div className="space-y-4">
                                {vendorBookedServices.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400">No vendor services booked yet</p>
                                ) : (
                                    vendorBookedServices.map((assignment: any) => (
                                        <div key={assignment._id || assignment.id || Math.random()} className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{assignment.service?.name || 'Service'}</h3>
                                            {/* FIXED: Status logic wrapped in <span> tag (Source content fixed) */}
                                            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium mt-2 ${
                                                assignment.status === 'COMPLETED' ? (assignment.booking?.paymentStatus === 'paid' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200') :
                                                assignment.status === 'EN_ROUTE' || assignment.status === 'ARRIVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                assignment.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                                {assignment.status === 'COMPLETED' && assignment.booking?.paymentStatus === 'paid' ? 'Payment Completed' : assignment.status}
                                            </span>
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Vendor: {assignment.vendor?.name || 'N/A'} ({assignment.vendor?.email || 'N/A'})</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Booking Date: {assignment.booking?.eventDate ? new Date(assignment.booking.eventDate).toLocaleDateString() : 'N/A'}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Guests: {assignment.booking?.guestCount || 0}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Venue: {assignment.deliveryLocation?.address || 'N/A'}</p>
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Price: ${assignment.booking?.totalPrice || 0}</p>
                                            {assignment.booking?.specialRequests && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">Special Requests: {assignment.booking.specialRequests}</p>
                                            )}
                                            
                                            {/* Display QR code for completed vendor services (only if payment not yet completed) */}
                                            {assignment.status === 'COMPLETED' && assignment.booking?.qrCode && assignment.booking?.paymentStatus !== 'paid' && (
                                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Payment QR Code</h4>
                                                    <img 
                                                        src={assignment.booking.qrCode} 
                                                        alt="Payment QR Code" 
                                                        className="w-32 h-32 border border-gray-200 rounded-md mx-auto"
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                                        Scan this QR code to complete payment
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-4 flex space-x-2 flex-wrap gap-2">
                                                {/* FIXED: Floating attributes attached to <button> tag (Source content fixed) */}
                                                <button
                                                    onClick={() => router.push(`/services/${assignment.service?._id}`)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition duration-200 hover:scale-105 shadow-sm"
                                                >
                                                    View Details
                                                </button>

                                                {/* FIXED: Floating text/logic wrapped in <span> tags (Source content fixed) */}
                                                {assignment.status === 'PENDING' && (
                                                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-md">
                                                        Waiting for Vendor Acceptance
                                                    </span>
                                                )}

                                                {/* FIXED: Floating attributes attached to <button> tag (Source content fixed) */}
                                                {assignment.status === 'CONFIRMED' && (
                                                    <button
                                                        onClick={() => handleStartServiceTracking(assignment.booking?._id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition duration-200 hover:scale-105 shadow-sm"
                                                    >
                                                        Start Service Tracking
                                                    </button>
                                                )}

                                                {/* FIXED: Floating attributes attached to <button> tag (Source content fixed) */}
                                                {(assignment.status === 'EN_ROUTE' || assignment.status === 'ARRIVED') && (
                                                    <button
                                                        onClick={() => handleCompleteService(assignment.booking?._id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition duration-200 hover:scale-105 shadow-sm"
                                                    >
                                                        Complete Service & Generate QR
                                                    </button>
                                                )}

                                                {/* FIXED: Floating attributes attached to <button> tag (Source content fixed) */}
                                                {(assignment.status !== 'PENDING') && (
                                                    <button
                                                        onClick={() => handleViewTracking(assignment)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition duration-200 hover:scale-105 shadow-sm"
                                                    >
                                                        Tracking
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Activity and Analytics */}
                        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recent Bookings Table */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Bookings</h2>
                                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {recentBookings.length > 0 ? (
                                                recentBookings.map((booking: any) => (
                                                    <tr key={booking._id || booking.id || Math.random()}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {booking.eventName || 'Service Booking'}
                                                            <span className="block text-xs text-gray-500">{booking.service?.name || 'N/A'}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {booking.user?.name || 'N/A'}
                                                            <span className="block text-xs text-gray-500">{booking.user?.email || 'N/A'}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(booking.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {/* FIXED: Status logic wrapped in <span> tag (Source content fixed) */}
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                                booking.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            ${booking.totalPrice ? (booking.totalPrice / 100).toFixed(2) : '0.00'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No recent bookings
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Top Vendors & Analytics */}
                            <div>
                                {/* Top Vendors */}
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Top Performing Vendors</h2>
                                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-4 space-y-4">
                                    {topVendors.length > 0 ? (
                                        topVendors.map((vendor: any) => (
                                            <div key={vendor._id || vendor.id || vendor.name || Math.random()} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{vendor.name || 'Vendor'}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Bookings: {vendor.bookingCount || 0}</p>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-1">Revenue Generated: ${vendor.totalRevenue ? (vendor.totalRevenue / 1000).toFixed(1) + 'k' : '0'}</p>
                                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${Math.min(100, (vendor.totalRevenue || 0) / 1000)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">No vendor data available</p>
                                    )}
                                </div>

                                {/* Service Analytics */}
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Service Analytics</h2>
                                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trend</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {serviceAnalytics.map((service: any, index: number) => (
                                                <tr key={service._id || service.id || index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{service.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{service.category}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${service.price ? service.price.toFixed(2) : '0.00'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">+5%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Tracking Modal */}
                {showTrackingModal && selectedBooking && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50 overflow-y-auto">
                        <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tracking Information</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowTrackingModal(false)}
                                        className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                                    >
                                        <span className="sr-only">Close panel</span>
                                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="mt-4 space-y-4">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedBooking.service?.name || 'Service'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Vendor: {selectedBooking.vendor?.name || 'N/A'}</p>

                                    {trackingUpdates.length > 0 ? (
                                        <ul className="space-y-3">
                                            {trackingUpdates.map((update: any, index: number) => (
                                                <li key={update.id || update.timestamp || index} className="text-sm text-gray-700 dark:text-gray-300 border-l-2 pl-3">
                                                    <strong className="font-semibold">Update {index + 1}</strong>
                                                    <span className={`block text-xs ${update.status === 'COMPLETED' ? 'text-green-600' : 'text-indigo-600'}`}>{update.status}</span>
                                                    <span className="block text-xs text-gray-500">{new Date(update.timestamp).toLocaleString()}</span>
                                                    <span className="block text-xs text-gray-600 dark:text-gray-400">{update.description}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">- No tracking updates available</p>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowTrackingModal(false)}
                                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}