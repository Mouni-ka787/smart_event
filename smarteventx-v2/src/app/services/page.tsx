"use client";
'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { servicesAPI } from '@/services/api';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    "All Categories",
    "Food & Beverage",
    "Photography",
    "Decoration",
    "Audio/Visual",
    "Florals",
    "Planning"
  ];

  useEffect(() => {
    fetchServices();
  }, [page, category, search, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params: any = { page };
      
      if (category && category !== "All Categories") {
        params.category = category;
      }
      
      if (search) {
        params.search = search;
      }
      
      const data = await servicesAPI.getAll(params);
      
      
      setServices(data.services || []);
      setTotalPages(data.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Services</h1>
              <p className="mt-1 text-sm text-gray-500">
                Browse our available event services
              </p>
            </div>
            <div className="mt-4 flex md:mt-0">
              <button className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Category Filters */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((cat, index) => (
                <button 
                  key={index} 
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    (category === cat || (category === '' && index === 0)) 
                      ? "bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-md" 
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <form onSubmit={handleSearch} className="relative rounded-md shadow-sm w-full md:w-64 mb-4 md:mb-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search services..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    type="submit"
                    className="h-full px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </form>
              <div className="flex items-center">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="recommended">Sort by: Recommended</option>
                  <option value="price-low">Sort by: Price (Low to High)</option>
                  <option value="price-high">Sort by: Price (High to Low)</option>
                  <option value="rating">Sort by: Rating</option>
                  <option value="popular">Sort by: Most Popular</option>
                </select>
              </div>
            </div>

            {/* Loading and Error States */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading services</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Services Grid */}
            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <div key={service._id} className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                      <div className="h-48 bg-gradient-to-r from-primary-400 to-secondary-300 flex items-center justify-center">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-dashed border-white rounded-xl w-16 h-16 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="px-5 py-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                            <p className="text-sm text-primary-600 font-medium">{service.category}</p>
                          </div>
                          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                            <svg className="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-sm font-medium text-gray-700">{service.rating || 'N/A'}</span>
                            <span className="ml-1 text-sm text-gray-500">({service.reviewCount || 0})</span>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{service.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            {service.priceType === 'per_person' ? `$${service.price}/person` : `$${service.price}/event`}
                          </span>
                          <div className="flex space-x-2">
                            <Link 
                              href={`/services/${service._id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Details
                            </Link>
                            <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform transition duration-300 hover:scale-105">
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          page === 1 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            page === i + 1
                              ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          page === totalPages 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}