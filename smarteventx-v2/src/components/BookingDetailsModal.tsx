'use client';

import { useState } from 'react';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export default function BookingDetailsModal({ 
  isOpen, 
  onClose,
  booking
}: BookingDetailsModalProps) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-start justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Booking Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-2 px-7 py-3">
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">{booking.eventName || 'Service Booking'}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Client Information</h5>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm text-gray-900">{booking.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{booking.user?.email || 'No email provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{booking.user?.phoneNumber || 'No phone provided'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Booking Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Booking Information</h5>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Event Date</p>
                      <p className="text-sm text-gray-900">
                        {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Date not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Price</p>
                      <p className="text-sm text-gray-900 font-medium">${booking.totalPrice || 0}</p>
                    </div>
                  </div>
                </div>
                
                {/* Venue Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Venue Information</h5>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{booking.venueLocation?.address || 'Address not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Guest Count</p>
                      <p className="text-sm text-gray-900">{booking.guestCount || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Service Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Service Information</h5>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Service Name</p>
                      <p className="text-sm text-gray-900">{booking.service?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vendor</p>
                      <p className="text-sm text-gray-900">{booking.service?.vendor?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vendor Email</p>
                      <p className="text-sm text-gray-900">{booking.service?.vendor?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Special Requests</h5>
                    <p className="text-sm text-gray-900">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}