import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UserDashboard() {
  // Sample data
  const upcomingEvents = [
    {
      id: 1,
      name: "Corporate Annual Meeting",
      date: "2023-06-15",
      status: "Confirmed",
      services: 3
    },
    {
      id: 2,
      name: "Wedding Reception",
      date: "2023-07-22",
      status: "Planning",
      services: 5
    }
  ];

  const recentBookings = [
    {
      id: 1,
      service: "Premium Catering",
      vendor: "Gourmet Catering Co.",
      date: "2023-05-10",
      status: "Completed",
      amount: "$1,200"
    },
    {
      id: 2,
      service: "Wedding Photography",
      vendor: "Capture Moments Photography",
      date: "2023-05-18",
      status: "In Progress",
      amount: "$800"
    }
  ];

  const recommendedServices = [
    {
      id: 1,
      name: "Event Decorators",
      category: "Decoration",
      rating: 4.7,
      price: "$300-1500/event"
    },
    {
      id: 2,
      name: "Sound & Lighting",
      category: "Audio/Visual",
      rating: 4.6,
      price: "$200-1000/event"
    },
    {
      id: 3,
      name: "Florist Services",
      category: "Florals",
      rating: 4.9,
      price: "$100-800/event"
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Page Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back! Manage your events and bookings.
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Settings
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-xl transform transition duration-300 hover:scale-105">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
                        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">2</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-xl transform transition duration-300 hover:scale-105">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Completed Bookings</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">12</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-xl transform transition duration-300 hover:scale-105">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                        <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">$1,200</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-xl transform transition duration-300 hover:scale-105">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Favorite Vendors</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">8</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Upcoming Events */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 transform transition duration-300 hover:scale-105">
                        + New Event
                      </button>
                    </div>
                    <div className="bg-white shadow rounded-xl overflow-hidden">
                      <ul className="divide-y divide-gray-200">
                        {upcomingEvents.map((event) => (
                          <li key={event.id} className="transform transition duration-300 hover:bg-gray-50">
                            <a href="#" className="block hover:bg-gray-50">
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-primary-600 truncate">{event.name}</p>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      event.status === "Confirmed" 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                      {event.status}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                      </svg>
                                      {event.date}
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>{event.services} services booked</p>
                                  </div>
                                </div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                      <div className="bg-gray-50 px-4 py-4 sm:px-6">
                        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                          View all events
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Recent Bookings */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h2>
                    <div className="bg-white shadow rounded-xl overflow-hidden">
                      <ul className="divide-y divide-gray-200">
                        {recentBookings.map((booking) => (
                          <li key={booking.id} className="transform transition duration-300 hover:bg-gray-50">
                            <a href="#" className="block hover:bg-gray-50">
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">{booking.service}</p>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      booking.status === "Completed" 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                      {booking.status}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      Vendor: {booking.vendor}
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>{booking.amount}</p>
                                  </div>
                                </div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                      <div className="bg-gray-50 px-4 py-4 sm:px-6">
                        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                          View all bookings
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Quick Actions */}
                  <div className="bg-white shadow rounded-xl overflow-hidden">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="border-t border-gray-200">
                      <nav className="space-y-1">
                        <a href="#" className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                          <span>New Booking</span>
                        </a>
                        <a href="#" className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                          <span>My Favorites</span>
                        </a>
                        <a href="#" className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Support</span>
                        </a>
                      </nav>
                    </div>
                  </div>

                  {/* Recommended Services */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended for You</h2>
                    <div className="space-y-4">
                      {recommendedServices.map((service) => (
                        <div key={service.id} className="bg-white overflow-hidden shadow rounded-xl hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                          <div className="p-5">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                                <p className="text-sm text-gray-500">{service.category}</p>
                              </div>
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="ml-1 text-sm font-medium text-gray-700">{service.rating}</span>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-lg font-medium text-gray-900">{service.price}</span>
                              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 transform transition duration-300 hover:scale-105">
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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