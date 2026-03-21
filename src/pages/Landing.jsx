import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck, Users, Search, Heart, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative bg-primary-900 text-white overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 opacity-[0.03] flex justify-center items-center pointer-events-none">
          <Heart className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] text-white" fill="currentColor" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-5 sm:mb-6 tracking-tight drop-shadow-lg leading-tight">
            Find Your Perfect<br className="sm:hidden" /> Soulmate
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-primary-200 mb-8 sm:mb-10 max-w-2xl mx-auto font-light px-2">
            Join the most trusted matchmaking platform for Indians worldwide. Thousands of beautiful journeys start right here.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4 sm:px-0">
            <Link to="/register" className="bg-secondary-500 hover:bg-secondary-600 text-gray-900 font-bold py-3.5 sm:py-4 px-8 sm:px-10 rounded-full shadow-premium transform hover:-translate-y-1 transition-all text-base sm:text-lg tracking-wide">
              Register Free
            </Link>
            <Link to="/login" className="bg-transparent border border-primary-400 hover:bg-primary-800 text-white font-bold py-3.5 sm:py-4 px-8 sm:px-10 rounded-full transition-all text-base sm:text-lg tracking-wide">
              Login to Account
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="w-24 h-1 bg-primary-500 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="text-center group">
              <div className="bg-primary-50 group-hover:bg-primary-100 transition-colors w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
                <Users className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">1. Create Profile</h3>
              <p className="text-gray-600 leading-relaxed">Register for free and complete your profile with all essential details and preferences to stand out.</p>
            </div>
            <div className="text-center group">
              <div className="bg-primary-50 group-hover:bg-primary-100 transition-colors w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
                <Search className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">2. Find Matches</h3>
              <p className="text-gray-600 leading-relaxed">Browse through thousands of highly verified profiles intelligently tailored to your partner preferences.</p>
            </div>
            <div className="text-center group">
              <div className="bg-primary-50 group-hover:bg-primary-100 transition-colors w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
                <Heart className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">3. Connect</h3>
              <p className="text-gray-600 leading-relaxed">Start conveying your interest and converse with matches securely to take the next step towards marriage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-24 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
          <div className="hidden lg:block lg:w-1/2 mb-16 lg:mb-0 relative py-4 pr-12">
            <div className="absolute inset-0 bg-secondary-300 rounded-[40px] transform translate-x-8 translate-y-8"></div>
            <img
              src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Indian Wedding"
              className="relative z-10 rounded-[40px] shadow-premium object-cover h-[500px] w-full"
            />
          </div>
          <div className="w-full lg:w-1/2 lg:pl-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6 sm:mb-8">Why Choose Kalyanam?</h2>
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-white p-3 rounded-full shadow-soft mr-5">
                  <ShieldCheck className="w-8 h-8 text-primary-600 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">100% Verified Profiles</h4>
                  <p className="text-gray-600">Every profile goes through a strict manual verification process to ensure trust, safety, and utmost authenticity.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white p-3 rounded-full shadow-soft mr-5">
                  <Users className="w-8 h-8 text-primary-600 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Millions of Success Stories</h4>
                  <p className="text-gray-600">We take pride in having brought together countless couples who are now happily married and experiencing a beautiful life.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white p-3 rounded-full shadow-soft mr-5">
                  <Heart className="w-8 h-8 text-primary-600 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Premium Experience</h4>
                  <p className="text-gray-600">Enjoy a seamless, culturally rich, and modern ad-free experience with state-of-the-art matching algorithms.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Happy Couples</h2>
            <div className="w-24 h-1 bg-primary-500 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              { name: "Rahul & Anjali", text: "We met through Kalyanam and it was love at first sight. The platform's algorithm found my perfect match instantly!" },
              { name: "Vikram & Neha", text: "The verified profiles gave us confidence. Our families connected so well, all thanks to this platform's detailed preferences." },
              { name: "Arjun & Meera", text: "I found my soulmate within 3 months of upgrading to premium. It has been a magical journey since then." }
            ].map((item, index) => (
              <div key={index} className="bg-cream rounded-3xl p-8 shadow-soft hover:shadow-premium transition-shadow text-center transform hover:-translate-y-2 duration-300">
                <div className="flex justify-center mb-6 space-x-1 text-secondary-500">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" className="w-5 h-5" />)}
                </div>
                <p className="text-gray-600 italic mb-8 relative leading-relaxed">
                  <span className="text-6xl text-primary-100 absolute -top-4 -left-2 z-0">"</span>
                  <span className="relative z-10">{item.text}</span>
                </p>
                <h5 className="font-bold text-gray-900 text-lg">- {item.name}</h5>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
