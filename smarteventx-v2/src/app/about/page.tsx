'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');

  const features = [
    {
      title: "AI-Powered Recommendations",
      description: "Get personalized service suggestions based on your event type, budget, and preferences using our advanced AI algorithms.",
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: "Real-time Tracking",
      description: "Track your service providers in real-time with our GPS location feature. Know exactly when they'll arrive.",
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Secure Payments",
      description: "Our QR-code based escrow system ensures secure payments. Only release funds after service completion.",
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: "Multi-role Platform",
      description: "Seamless experience for Users, Admins, and Vendors with role-specific dashboards and features.",
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      bio: "Event planning expert with 15+ years of experience in the industry."
    },
    {
      name: "Sarah Williams",
      role: "CTO",
      bio: "Tech visionary with a passion for AI and event technology solutions."
    },
    {
      name: "Michael Chen",
      role: "Head of Product",
      bio: "Product design specialist focused on creating seamless user experiences."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-theme-secondary py-20 rounded-box my-16 mx-4 sm:mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-theme-text sm:text-5xl md:text-6xl">
                <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">About EWE</span>
                <span className="block text-theme-accent mt-2">
                  Revolutionizing Event Planning
                </span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Connecting event planners with the best service providers through innovative technology
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Vision Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-theme-primary rounded-card shadow-lg overflow-hidden">
            <div className="border-b border-theme-secondary">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('mission')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'mission'
                      ? 'border-theme-accent text-theme-accent'
                      : 'border-transparent text-gray-400 hover:text-theme-accent hover:border-theme-accent'
                  }`}
                >
                  Our Mission
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'vision'
                      ? 'border-theme-accent text-theme-accent'
                      : 'border-transparent text-gray-400 hover:text-theme-accent hover:border-theme-accent'
                  }`}
                >
                  Our Vision
                </button>
                <button
                  onClick={() => setActiveTab('values')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'values'
                      ? 'border-theme-accent text-theme-accent'
                      : 'border-transparent text-gray-400 hover:text-theme-accent hover:border-theme-accent'
                  }`}
                >
                  Our Values
                </button>
              </nav>
            </div>
            
            <div className="p-8">
              {activeTab === 'mission' && (
                <div>
                  <h2 className="text-2xl font-bold text-theme-text">Our Mission</h2>
                  <p className="mt-4 text-lg text-gray-300">
                    At EWE, our mission is to simplify event planning by connecting event planners with 
                    the best service providers through innovative technology. We believe that every event 
                    deserves the perfect team of professionals, and our platform makes finding and managing 
                    those professionals easier than ever before.
                  </p>
                  <p className="mt-4 text-lg text-gray-300">
                    We&apos;re committed to providing a seamless, secure, and efficient experience for all 
                    stakeholders in the event planning process - from individual planners to large 
                    corporations, from local vendors to international service providers.
                  </p>
                </div>
              )}
              
              {activeTab === 'vision' && (
                <div>
                  <h2 className="text-2xl font-bold text-theme-text">Our Vision</h2>
                  <p className="mt-4 text-lg text-gray-300">
                    Our vision is to become the world&apos;s leading event planning platform, where technology 
                    and human expertise combine to create unforgettable experiences. We envision a future 
                    where event planning is not just easier, but more creative, more collaborative, and 
                    more successful for everyone involved.
                  </p>
                  <p className="mt-4 text-lg text-gray-300">
                    We aim to revolutionize the event industry by leveraging artificial intelligence, 
                    real-time communication, and secure payment systems to create a global ecosystem of 
                    trusted event professionals and satisfied clients.
                  </p>
                </div>
              )}
              
              {activeTab === 'values' && (
                <div>
                  <h2 className="text-2xl font-bold text-theme-text">Our Core Values</h2>
                  <ul className="mt-4 space-y-2 text-lg text-gray-300">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-theme-accent">✓</div>
                      <p className="ml-2"><strong>Innovation:</strong> We constantly push boundaries to deliver cutting-edge solutions.</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-theme-accent">✓</div>
                      <p className="ml-2"><strong>Integrity:</strong> We conduct business with honesty and transparency.</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-theme-accent">✓</div>
                      <p className="ml-2"><strong>Excellence:</strong> We strive for the highest quality in everything we do.</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-theme-accent">✓</div>
                      <p className="ml-2"><strong>Collaboration:</strong> We believe in the power of partnerships and teamwork.</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-theme-accent">✓</div>
                      <p className="ml-2"><strong>Customer Focus:</strong> Our users&apos; success is our success.</p>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-theme-secondary py-16 rounded-box my-16 mx-4 sm:mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-theme-accent font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-theme-text sm:text-4xl">
                Why Choose EWE
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
                Our platform provides all the tools to plan, book, and manage event services with confidence.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-theme-accent to-theme-highlight rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative bg-theme-primary rounded-card p-6 h-full">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-theme-accent text-theme-primary">
                        {feature.icon}
                      </div>
                      <div className="ml-0 mt-4">
                        <h3 className="text-lg font-medium text-theme-text">{feature.title}</h3>
                        <p className="mt-2 text-base text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-theme-secondary py-16 rounded-box my-16 mx-4 sm:mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-theme-accent font-semibold tracking-wide uppercase">Our Team</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-theme-text sm:text-4xl">
                Meet Our Leadership
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
                The passionate people behind EWE's success
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member, index) => (
                  <div key={index} className="bg-theme-primary rounded-card shadow-lg overflow-hidden">
                    <div className="bg-theme-secondary border-2 border-dashed border-theme-highlight rounded-t-card w-full h-48" />
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-theme-text">{member.name}</h3>
                      <p className="text-theme-accent">{member.role}</p>
                      <p className="mt-2 text-gray-300">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-theme-accent rounded-box my-16 mx-4 sm:mx-8">
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
      </main>
    </div>
  );
}
