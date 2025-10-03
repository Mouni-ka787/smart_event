"use client";

import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { servicesAPI, bookingsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BookingPage({ params }: { params: { id: string } }) {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [eventType, setEventType] = useState('Wedding');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('standard');
  const [additionalServices, setAdditionalServices] = useState({
    bartending: false,
    setup: false
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchService();
  }, [params.id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getById(params.id);
      setService(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch service');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!service) return 0;
    
    let basePrice = service.price;
    if (service.priceType === 'per_person') {
      basePrice = service.price * guestCount;
    }
    
    let additionalCost = 0;
    if (additionalServices.bartending) additionalCost += 500;
    if (additionalServices.setup) additionalCost += 300;
    
    // Service fee (5% of total)
    const serviceFee = (basePrice + additionalCost) * 0.05;
    
    return basePrice + additionalCost + serviceFee;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    setIsBooking(true);
    
    try {
      const bookingData = {
        serviceId: params.id,
        eventName,
        eventDate,
        guestCount,
        specialRequests
      };
      
      const data = await bookingsAPI.create(user.token, bookingData);
      setBookingId(data._id);
      setBookingSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading service</h3>
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
        <Header />
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
                      <p className="text-sm font-medium text-gray-900">{service?.name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Vendor</p>
                      <p className="text-sm font-medium text-gray-900">{service?.vendor?.name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Event Name</p>
                      <p className="text-sm font-medium text-gray-900">{eventName}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Event Date</p>
                      <p className="text-sm font-medium text-gray-900">{eventDate}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Guests</p>
                      <p className="text-sm font-medium text-gray-900">{guestCount}</p>
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
                    onClick={() => router.push('/dashboard/user')}
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
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Page Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Book Service</h1>
          </div>
        </div>

        {/* Main Content */}
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Form */}
                <div className="lg:col-span-2">
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 className="text-xl font-medium text-gray-900">Booking Details</h2>
                    </div>
                    <div className="border-t border-gray-200">
                      <form className="px-4 py-5 sm:p-6" onSubmit={handleBooking}>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor="event-name" className="block text-sm font-medium text-gray-700">
                              Event Name
                            </label>
                            <input
                              type="text"
                              name="event-name"
                              id="event-name"
                              required
                              value={eventName}
                              onChange={(e) => setEventName(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="event-date" className="block text-sm font-medium text-gray-700">
                              Event Date
                            </label>
                            <input
                              type="date"
                              name="event-date"
                              id="event-date"
                              required
                              value={eventDate}
                              onChange={(e) => setEventDate(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="guest-count" className="block text-sm font-medium text-gray-700">
                              Number of Guests
                            </label>
                            <input
                              type="number"
                              name="guest-count"
                              id="guest-count"
                              min="1"
                              required
                              value={guestCount}
                              onChange={(e) => setGuestCount(Number(e.target.value))}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="event-type" className="block text-sm font-medium text-gray-700">
                              Event Type
                            </label>
                            <select
                              id="event-type"
                              name="event-type"
                              required
                              value={eventType}
                              onChange={(e) => setEventType(e.target.value)}
                              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                              <option>Wedding</option>
                              <option>Birthday Party</option>
                              <option>Corporate Event</option>
                              <option>Conference</option>
                              <option>Other</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label htmlFor="special-requests" className="block text-sm font-medium text-gray-700">
                              Special Requests
                            </label>
                            <textarea
                              id="special-requests"
                              name="special-requests"
                              rows={4}
                              value={specialRequests}
                              onChange={(e) => setSpecialRequests(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              placeholder="Any dietary restrictions, specific menu requests, or other special requirements..."
                            />
                          </div>
                        </div>

                        {service?.category === "Food & Beverage" && (
                          <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900">Menu Selection</h3>
                            <div className="mt-4 space-y-4">
                              <div className="flex items-center">
                                <input
                                  id="menu-standard"
                                  name="menu-selection"
                                  type="radio"
                                  value="standard"
                                  checked={selectedMenu === 'standard'}
                                  onChange={(e) => setSelectedMenu(e.target.value)}
                                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                                />
                                <label htmlFor="menu-standard" className="ml-3 block text-sm font-medium text-gray-700">
                                  Standard Menu (${service.price}/person)
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id="menu-premium"
                                  name="menu-selection"
                                  type="radio"
                                  value="premium"
                                  checked={selectedMenu === 'premium'}
                                  onChange={(e) => setSelectedMenu(e.target.value)}
                                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                                />
                                <label htmlFor="menu-premium" className="ml-3 block text-sm font-medium text-gray-700">
                                  Premium Menu (${(service.price + 10).toFixed(2)}/person)
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id="menu-gourmet"
                                  name="menu-selection"
                                  type="radio"
                                  value="gourmet"
                                  checked={selectedMenu === 'gourmet'}
                                  onChange={(e) => setSelectedMenu(e.target.value)}
                                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                                />
                                <label htmlFor="menu-gourmet" className="ml-3 block text-sm font-medium text-gray-700">
                                  Gourmet Menu (${(service.price + 25).toFixed(2)}/person)
                                </label>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-8">
                          <h3 className="text-lg font-medium text-gray-900">Additional Services</h3>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="bartending"
                                  name="bartending"
                                  type="checkbox"
                                  checked={additionalServices.bartending}
                                  onChange={(e) => setAdditionalServices({
                                    ...additionalServices,
                                    bartending: e.target.checked
                                  })}
                                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="bartending" className="font-medium text-gray-700">
                                  Bartending Services (+$500)
                                </label>
                                <p className="text-gray-500">Professional bartenders with premium bar setup</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="setup"
                                  name="setup"
                                  type="checkbox"
                                  checked={additionalServices.setup}
                                  onChange={(e) => setAdditionalServices({
                                    ...additionalServices,
                                    setup: e.target.checked
                                  })}
                                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="setup" className="font-medium text-gray-700">
                                  Premium Setup (+$300)
                                </label>
                                <p className="text-gray-500">Elegant table settings and decorative arrangements</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8">
                          <button
                            type="submit"
                            disabled={isBooking}
                            className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                          >
                            {isBooking ? 'Processing Booking...' : 'Confirm Booking'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 className="text-xl font-medium text-gray-900">Order Summary</h2>
                    </div>
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">{service?.name}</h3>
                            <p className="text-sm text-gray-500">{service?.vendor?.name}</p>
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-600">Base Price</p>
                            <p className="text-sm font-medium text-gray-900">
                              {service?.priceType === 'per_person' 
                                ? `$${service?.price} × ${guestCount} guests` 
                                : `$${service?.price}`}
                            </p>
                          </div>
                          {selectedMenu !== 'standard' && (
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-600">Menu Upgrade</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedMenu === 'premium' ? '+$10/person' : '+$25/person'}
                              </p>
                            </div>
                          )}
                          {additionalServices.bartending && (
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-600">Bartending Services</p>
                              <p className="text-sm font-medium text-gray-900">+$500</p>
                            </div>
                          )}
                          {additionalServices.setup && (
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-600">Premium Setup</p>
                              <p className="text-sm font-medium text-gray-900">+$300</p>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-600">Service Fee (5%)</p>
                            <p className="text-sm font-medium text-gray-900">
                              ${(calculateTotal() * 0.05).toFixed(2)}
                            </p>
                          </div>
                          <div className="border-t border-gray-200 pt-4 flex justify-between">
                            <p className="text-base font-medium text-gray-900">Total</p>
                            <p className="text-base font-medium text-gray-900">${calculateTotal().toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={handleBooking}
                            disabled={isBooking}
                            className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                          >
                            {isBooking ? 'Processing Booking...' : 'Proceed to Payment'}
                          </button>
                        </div>

                        <div className="mt-4 text-center">
                          <p className="text-xs text-gray-500">
                            By booking this service, you agree to our terms of service and cancellation policy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Payment Info */}
                  <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 className="text-xl font-medium text-gray-900">Secure Payment</h2>
                    </div>
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center">
                            <span className="text-gray-500">QR Code</span>
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-500">
                            After booking confirmation, you'll receive a unique QR code for secure payment.
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            Payment is held in escrow until service completion.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}