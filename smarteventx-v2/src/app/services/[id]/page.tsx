"use client";

import Header from '@/components/Header';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { servicesAPI } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function ServiceDetail({ params }: { params: { id: string } }) {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Service not found</h3>
            <p className="mt-1 text-sm text-gray-500">The service you're looking for doesn't exist or has been removed.</p>
            <div className="mt-6">
              <Link href="/services" className="text-primary-600 hover:text-primary-500">
                Browse all services
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div className="flex items-center">
                  <Link href="/" className="text-gray-400 hover:text-gray-500">
                    Home
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href="/services" className="ml-2 text-gray-400 hover:text-gray-500">
                    Services
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-gray-500" aria-current="page">
                    {service.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Service Header */}
            <div className="bg-white shadow rounded-xl overflow-hidden mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                <div className="h-96 bg-gradient-to-r from-primary-400 to-secondary-300 rounded-xl flex items-center justify-center">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-dashed border-white rounded-xl w-32 h-32 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                      <p className="mt-1 text-lg text-primary-600 font-medium">{service.category}</p>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-lg font-medium text-gray-700">{service.rating || 'N/A'}</span>
                      <span className="ml-1 text-lg text-gray-500">({service.reviewCount || 0})</span>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-gray-700">{service.description}</p>
                  
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold text-gray-900">Vendor Information</h2>
                    <div className="mt-4 flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="bg-gradient-to-r from-primary-400 to-secondary-300 rounded-full w-16 h-16 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{service.vendor?.name || 'Vendor Name'}</h3>
                        <div className="flex items-center mt-1">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm font-medium text-gray-700">{service.vendor?.rating || 'N/A'}</span>
                          <span className="ml-1 text-sm text-gray-500">({service.vendor?.reviewCount || 0} reviews)</span>
                        </div>
                        {service.location?.address && (
                          <p className="mt-1 text-sm text-gray-500 flex items-center">
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {service.location.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-900">Key Features</h2>
                    <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-100">
                            <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-3 text-gray-700">Customizable packages</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-100">
                            <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-3 text-gray-700">Professional service team</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-100">
                            <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-3 text-gray-700">24/7 customer support</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-100">
                            <svg className="h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="ml-3 text-gray-700">Satisfaction guarantee</p>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600">Starting at</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {service.priceType === 'per_person' ? `$${service.price}/person` : `$${service.price}/event`}
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push(`/booking/${service._id}`)}
                      className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg transform transition duration-300 hover:scale-105"
                    >
                      Book This Service
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="bg-white shadow rounded-xl overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Write a Review
                  </button>
                </div>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l-2 2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Be the first to review this service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}