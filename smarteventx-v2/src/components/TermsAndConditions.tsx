'use client';

import { useState, useEffect } from 'react';

interface TermsAndConditionsProps {
  userType: 'user' | 'vendor' | 'admin';
  onAccept: () => void;
  onCancel: () => void;
}
export default function TermsAndConditions({ userType, onAccept, onCancel }: TermsAndConditionsProps) {
  try {
    console.log('=== TermsAndConditions component rendered ===');
    console.log('User type:', userType);
    console.log('onAccept function:', typeof onAccept);
    console.log('onCancel function:', typeof onCancel);
    
    const [isChecked, setIsChecked] = useState(false);
    console.log('Checkbox state:', isChecked);

    const userTerms = [
      "All personal details provided during booking must be genuine and verifiable.",
      "Fake, prank, time-pass, or misleading bookings will result in account suspension and legal action.",
      "Users must be present and reachable at the event location when the vendor arrives.",
      "Avoiding vendor/admin calls or switching off the device at the time of service is treated as misuse.",
      "Vendor contact numbers must not be misused for personal or repeated unnecessary communication.",
      "Creating false complaints or intentionally delaying payment after service is considered fraud.",
      "Pressuring vendors for free/extra services not included in the package is prohibited.",
      "Any damage caused to rented items or equipment must be fully compensated by the user.",
      "Users must not bypass the platform by making direct deals with vendors after booking.",
      "Cancelling the service within 3 days of the event without a valid documented reason requires paying a 30–50% cancellation fee, depending on vendor preparation and travel."
    ];

    const vendorTerms = [
      "Vendors must provide truthful service details, pricing, and availability on the platform.",
      "Vendors cannot demand advance payments or extra charges outside the app's payment system.",
      "Misuse of customer contact information for personal, repeated, or unrelated communication is prohibited.",
      "Cancelling a service without a genuine and valid reason is considered service misconduct.",
      "Providing incomplete, low-quality, or intentionally reduced service is treated as a violation.",
      "Vendors cannot demand tips, hidden charges, or off-platform payments.",
      "All equipment, materials, and services must match what was originally promised in the booking.",
      "Vendors must maintain respectful communication with customers and event managers.",
      "Offering customers off-platform discounts or deals to bypass the app is strictly forbidden.",
      "Cancelling the service within 3 days of the event without a valid reason may result in penalties, compensation to the customer, and platform suspension."
    ];

    const adminTerms = [
      "Admins must provide accurate event details, dates, and guest information when booking services.",
      "Admins are responsible for ensuring all booking information is genuine and verifiable.",
      "Admins must coordinate with clients to ensure they are present and reachable at the event location.",
      "Admins must not misuse vendor contact information for personal or unrelated communication.",
      "Creating fake or misleading bookings on behalf of clients is strictly prohibited.",
      "Admins must not pressure vendors for free/extra services not included in the package.",
      "Admins must ensure clients compensate vendors for any damage to rented items or equipment.",
      "Admins must not facilitate off-platform deals between clients and vendors.",
      "Admins must communicate booking changes and cancellations promptly to vendors.",
      "Admins are responsible for ensuring clients comply with cancellation policies and fees."
    ];
    const terms = userType === 'user' ? userTerms : userType === 'admin' ? adminTerms : vendorTerms;
    const title = userType === 'user' ? 'User Terms and Conditions' : userType === 'admin' ? 'Admin Terms and Conditions' : 'Vendor Terms and Conditions';
    console.log('Terms loaded:', terms.length, 'items');    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9999]">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white z-[10000]">
          <div className="mt-3">
            <div className="flex items-start justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <button
                onClick={() => {
                  console.log('Cancel button clicked');
                  onCancel();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500 mb-4">
                Please read and accept the following terms and conditions before proceeding:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                <ol className="list-decimal space-y-2 pl-5">
                  {terms.map((term, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {term}
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="mt-4 flex items-center">
                <input
                  id="terms-checkbox"
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    console.log('Checkbox changed:', e.target.checked);
                    setIsChecked(e.target.checked);
                  }}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="terms-checkbox" className="ml-2 block text-sm text-gray-700">
                  I have read and agree to the terms and conditions
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Cancel button in footer clicked');
                    onCancel();
                  }}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Accept & Continue button clicked');
                    console.log('Checkbox checked:', isChecked);
                    console.log('onAccept function type:', typeof onAccept);
                    if (isChecked) {
                      console.log('Calling onAccept callback');
                      onAccept();
                    } else {
                      console.log('Checkbox not checked, not calling onAccept');
                    }
                  }}
                  disabled={!isChecked}
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isChecked 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering TermsAndConditions component:', error);
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9999]">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white z-[10000]">
          <div className="mt-3">
            <div className="flex items-start justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Error
              </h3>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-red-500">
                An error occurred while loading the terms and conditions. Please try again.
              </p>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
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
};