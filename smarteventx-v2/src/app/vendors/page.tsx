import Header from '@/components/Header';

export default function Vendors() {
  // Sample vendor data
  const vendors = [
    {
      id: 1,
      name: "Gourmet Catering Co.",
      category: "Food & Beverage",
      rating: 4.8,
      reviews: 124,
      location: "New York, NY",
      image: "/vendor-placeholder.jpg",
      description: "Premium catering services for weddings, corporate events, and private parties."
    },
    {
      id: 2,
      name: "Capture Moments Photography",
      category: "Photography",
      rating: 4.9,
      reviews: 89,
      location: "Los Angeles, CA",
      image: "/vendor-placeholder.jpg",
      description: "Professional photography services specializing in weddings and events."
    },
    {
      id: 3,
      name: "Elegant Events Decor",
      category: "Decoration",
      rating: 4.7,
      reviews: 67,
      location: "Chicago, IL",
      image: "/vendor-placeholder.jpg",
      description: "Transform any space with our creative decoration and styling services."
    },
    {
      id: 4,
      name: "Sound Masters",
      category: "Audio/Visual",
      rating: 4.6,
      reviews: 45,
      location: "Miami, FL",
      image: "/vendor-placeholder.jpg",
      description: "Professional sound and lighting solutions for all types of events."
    },
    {
      id: 5,
      name: "Bloom & Blossom Florists",
      category: "Florals",
      rating: 4.9,
      reviews: 78,
      location: "San Francisco, CA",
      image: "/vendor-placeholder.jpg",
      description: "Beautiful floral arrangements for weddings, parties, and corporate events."
    },
    {
      id: 6,
      name: "Perfect Event Planners",
      category: "Planning",
      rating: 4.8,
      reviews: 92,
      location: "Boston, MA",
      image: "/vendor-placeholder.jpg",
      description: "Full-service event planning from concept to execution."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Vendors</h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover top-rated vendors for your events
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Category Filters */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-wrap gap-2 mb-6">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium">
                All Categories
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
                Food & Beverage
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
                Photography
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
                Decoration
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
                Audio/Visual
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
                Florals
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
                Planning
              </button>
            </div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{vendor.name}</h3>
                        <p className="text-sm text-gray-500">{vendor.category}</p>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm font-medium text-gray-700">{vendor.rating}</span>
                        <span className="ml-1 text-sm text-gray-500">({vendor.reviews})</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{vendor.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">{vendor.location}</span>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}