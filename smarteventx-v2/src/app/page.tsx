import Header from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <Header />
      
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20"></div>
        <div className="absolute inset-0 bg-[url('/image.png')] bg-cover bg-center bg-no-repeat opacity-20"></div>
        
        {/* Floating Gradient Elements for Modern Effect */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-orange-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-theme-text sm:text-5xl md:text-6xl">
                    <div className="flex items-center mb-2">
                      <img src="/imglogo.jpeg" alt="EWE Logo" className="h-12 w-12 rounded-full object-contain responsive" />
                      <span className="ml-2 block bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                        EWE
                      </span>
                      <span className="ml-2 block">-</span>
                    </div>
                    <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent mt-2">
                      AI-Powered Event Services
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Book, manage, and track event services with AI-powered recommendations and secure QR-based payments. 
                    Trusted by thousands of event planners and service providers.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow transform transition duration-300 hover:scale-105">
                      <Link
                        href="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md btn btn-accent btn-responsive md:py-4 md:text-lg md:px-10"
                      >
                        Get started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3 transform transition duration-300 hover:scale-105">
                      <Link
                        href="/services"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md btn btn-secondary btn-responsive md:py-4 md:text-lg md:px-10"
                      >
                        View Services
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3 transform transition duration-300 hover:scale-105">
                      <Link
                        href="/events"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md btn btn-secondary btn-responsive md:py-4 md:text-lg md:px-10"
                      >
                        Browse Events
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-theme-secondary rounded-box my-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-theme-accent font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-theme-text sm:text-4xl">
                Everything you need for successful events
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
                Our platform provides all the tools to plan, book, and manage event services with confidence.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-theme-accent to-theme-highlight rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <div className="relative bg-theme-primary rounded-card p-6 h-full">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-theme-accent text-theme-primary">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-0 mt-4">
                      <h3 className="text-lg font-medium text-theme-text">Real-time Tracking</h3>
                      <p className="mt-2 text-base text-gray-300">
                        Track your service providers in real-time with our GPS location feature. Know exactly when they'll arrive.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-theme-accent to-theme-highlight rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <div className="relative bg-theme-primary rounded-card p-6 h-full">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-theme-accent text-theme-primary">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="ml-0 mt-4">
                      <h3 className="text-lg font-medium text-theme-text">Secure Payments</h3>
                      <p className="mt-2 text-base text-gray-300">
                        Our QR-code based escrow system ensures secure payments. Only release funds after service completion.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-theme-accent to-theme-highlight rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <div className="relative bg-theme-primary rounded-card p-6 h-full">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-theme-accent text-theme-primary">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="ml-0 mt-4">
                      <h3 className="text-lg font-medium text-theme-text">AI Recommendations</h3>
                      <p className="mt-2 text-base text-gray-300">
                        Get personalized service suggestions based on your event type, budget, and preferences.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-theme-accent to-theme-highlight rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <div className="relative bg-theme-primary rounded-card p-6 h-full">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-theme-accent text-theme-primary">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-0 mt-4">
                      <h3 className="text-lg font-medium text-theme-text">Multi-role Platform</h3>
                      <p className="mt-2 text-base text-gray-300">
                        Seamless experience for Users, Admins, and Vendors with role-specific dashboards and features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Events */}
        <div className="py-16 bg-theme-secondary rounded-box my-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-12">
              <h2 className="text-base text-theme-accent font-semibold tracking-wide uppercase">Featured Events</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-theme-text sm:text-4xl">
                Popular Events This Month
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
                Discover our most popular events and start planning your next celebration.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Event Card 1 */}
              <div className="bg-theme-primary rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
                <div className="h-48 bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-dashed border-white rounded-xl w-16 h-16 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-theme-text">Summer Wedding</h3>
                      <p className="text-sm text-theme-accent font-medium">Wedding</p>
                    </div>
                    <div className="flex items-center bg-theme-secondary rounded-full px-2 py-1">
                      <svg className="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="ml-1 text-sm font-medium text-theme-text">4.9</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-300">A beautiful summer wedding package with all the essentials for your special day.</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-theme-text">$2,499</span>
                    <Link href="/events/1" className="btn btn-accent text-xs">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Event Card 2 */}
              <div className="bg-theme-primary rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
                  <div className="h-48 bg-gradient-to-r from-blue-400 to-teal-500 flex items-center justify-center">
                      <div className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-dashed border-white rounded-xl w-16 h-16 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      </div>
                  </div>
                  <div className="p-6">
                      <div className="flex justify-between items-start">
                      <div>
                          <h3 className="text-lg font-bold text-theme-text">Corporate Conference</h3>
                          <p className="text-sm text-theme-accent font-medium">Corporate</p>
                      </div>
                      <div className="flex items-center bg-theme-secondary rounded-full px-2 py-1">
                          <svg className="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span className="ml-1 text-sm font-medium text-theme-text">4.8</span>
                      </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-300">Complete conference package with venue, catering, and technical support.</p>
                      <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-theme-text">$5,999</span>
                      <Link href="/events/2" className="btn btn-accent text-xs">
                          View Details
                      </Link>
                      </div>
                  </div>
              </div>

              {/* Event Card 3 */}
              <div className="bg-theme-primary rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
                  <div className="h-48 bg-gradient-to-r from-pink-400 to-rose-500 flex items-center justify-center">
                      <div className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-dashed border-white rounded-xl w-16 h-16 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      </div>
                  </div>
                  <div className="p-6">
                      <div className="flex justify-between items-start">
                      <div>
                          <h3 className="text-lg font-bold text-theme-text">Birthday Bash</h3>
                          <p className="text-sm text-theme-accent font-medium">Birthday</p>
                      </div>
                      <div className="flex items-center bg-theme-secondary rounded-full px-2 py-1">
                          <svg className="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span className="ml-1 text-sm font-medium text-theme-text">4.7</span>
                      </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-300">Fun-filled birthday celebration package with entertainment and decorations.</p>
                      <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-theme-text">$1,299</span>
                      <Link href="/events/3" className="btn btn-accent text-xs">
                          View Details
                      </Link>
                      </div>
                  </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/events" className="btn btn-accent transform transition duration-300 hover:scale-105">
                View All Events
                <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-theme-secondary py-16 rounded-box my-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-theme-accent font-semibold tracking-wide uppercase">Testimonials</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-theme-text sm:text-4xl">
                What our customers say
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-theme-primary rounded-xl shadow-lg p-8 transform transition duration-500 hover:scale-105">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-theme-secondary border-2 border-dashed border-theme-highlight rounded-xl w-16 h-16" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-theme-text">Sarah Johnson</h4>
                    <p className="text-theme-accent">Event Planner</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-300 italic">
                    "EWE made planning my wedding so much easier. The AI recommendations helped me find the perfect vendors, and the real-time tracking gave me peace of mind."
                  </p>
                  <div className="mt-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-theme-primary rounded-xl shadow-lg p-8 transform transition duration-500 hover:scale-105">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-theme-secondary border-2 border-dashed border-theme-highlight rounded-xl w-16 h-16" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-theme-text">Michael Chen</h4>
                    <p className="text-theme-accent">Corporate Manager</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-300 italic">
                    "As a vendor, EWE has helped me reach more clients and manage bookings efficiently. The secure payment system gives my clients confidence in our services."
                  </p>
                  <div className="mt-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-theme-primary rounded-xl shadow-lg p-8 transform transition duration-500 hover:scale-105">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-theme-secondary border-2 border-dashed border-theme-highlight rounded-xl w-16 h-16" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-theme-text">Emma Rodriguez</h4>
                    <p className="text-theme-accent">Wedding Coordinator</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-300 italic">
                    "The admin dashboard gives me complete visibility into all bookings and vendor performance. The analytics help me make data-driven decisions for my business."
                  </p>
                  <div className="mt-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-theme-accent rounded-box">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-theme-primary sm:text-4xl">
                Ready to plan your next event?
              </h2>
              <p className="mt-4 max-w-3xl text-lg text-theme-primary opacity-80">
                Join thousands of event planners and service providers who trust EWE for seamless event management.
              </p>
            </div>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md bg-theme-primary text-theme-text hover:bg-opacity-90 transform transition duration-300 hover:scale-105"
                >
                  Get started
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md bg-theme-secondary text-theme-text hover:bg-opacity-90 transform transition duration-300 hover:scale-105"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}