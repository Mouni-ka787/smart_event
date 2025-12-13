'use client';

import { useState } from 'react';
import SimpleTracking from '@/components/SimpleTracking';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  bookingId: string;
  vendorId: string;
  venueLocation: { lat: number; lng: number };
}

export default function TrackingModal({ 
  isOpen, 
  onClose,
  assignmentId,
  bookingId,
  vendorId,
  venueLocation
}: TrackingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-start justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Live Tracking
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
            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-800">Assignment Details</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p>Assignment ID: {assignmentId}</p>
                <p>Booking ID: {bookingId}</p>
                <p>Vendor ID: {vendorId}</p>
              </div>
            </div>
            
            <SimpleTracking />
            
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