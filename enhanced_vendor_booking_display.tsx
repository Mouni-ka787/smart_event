// This is an example of how the enhanced vendor booking display would look
// You can use this as a reference to manually update your vendor dashboard

const EnhancedVendorBookingDisplay = () => {
  // Sample booking data structure
  const sampleBooking = {
    _id: "booking123",
    eventName: "Wedding Reception",
    status: "pending",
    user: {
      name: "John Smith",
      email: "john.smith@email.com",
      phoneNumber: "+1 (555) 123-4567"
    },
    totalPrice: 1500,
    eventDate: "2023-12-15T00:00:00.000Z",
    venueLocation: {
      address: "123 Main Street, New York, NY 10001"
    },
    guestCount: 150,
    specialRequests: "Please arrive 1 hour early for setup"
  };

  return (
    <li key={sampleBooking._id} className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-indigo-600">{sampleBooking.eventName || 'Service Booking'}</h3>
        <div className="ml-2 flex-shrink-0 flex">
          <p className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
            sampleBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
            sampleBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            sampleBooking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            sampleBooking.status === 'completed' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {sampleBooking.status?.toUpperCase() || 'UNKNOWN'}
          </p>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-500">Client</p>
              <p className="text-sm text-gray-900">{sampleBooking.user?.name || 'N/A'}</p>
              <p className="text-xs text-gray-500">{sampleBooking.user?.email || 'No email provided'}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-500">Contact</p>
              <p className="text-sm text-gray-900">{sampleBooking.user?.phoneNumber || 'No phone provided'}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-500">Event Date</p>
              <p className="text-sm text-gray-900">{sampleBooking.eventDate ? new Date(sampleBooking.eventDate).toLocaleDateString() : 'Date not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-500">Venue</p>
              <p className="text-sm text-gray-900">{sampleBooking.venueLocation?.address || 'Address not provided'}</p>
              <p className="text-xs text-gray-500">Guests: {sampleBooking.guestCount || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-bold text-gray-900">${sampleBooking.totalPrice || 0}</p>
        </div>
        
        {sampleBooking.specialRequests && (
          <div className="mt-2 md:mt-0">
            <p className="text-sm font-medium text-gray-500">Special Requests:</p>
            <p className="text-sm text-gray-900">{sampleBooking.specialRequests}</p>
          </div>
        )}
      </div>
      
      {sampleBooking.status === 'pending' && (
        <div className="mt-4 flex space-x-3">
          <button
            // onClick={() => handleAcceptBooking(sampleBooking._id)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accept Booking
          </button>
          <button
            // onClick={() => handleRejectBooking(sampleBooking._id)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
        </div>
      )}
      
      {sampleBooking.status === 'confirmed' && (
        <div className="mt-4">
          <p className="text-sm text-green-600 font-medium">✓ Booking accepted. Ready to start service tracking.</p>
        </div>
      )}
    </li>
  );
};

export default EnhancedVendorBookingDisplay;