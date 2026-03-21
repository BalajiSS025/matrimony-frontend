import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-10 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">

                <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center space-x-2 mb-4">
                        <Heart className="h-5 w-5 text-primary-500" fill="currentColor" />
                        <span className="font-serif text-xl font-bold text-white">Kalyanam</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-xs">
                        Finding your perfect soulmate made simple, secure, and sacred. Join thousands of happy couples today.
                    </p>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Quick Links</h3>
                    <ul className="space-y-2.5 text-sm">
                        <li><a href="#" className="hover:text-primary-400 transition">About Us</a></li>
                        <li><a href="#" className="hover:text-primary-400 transition">Success Stories</a></li>
                        <li><a href="#" className="hover:text-primary-400 transition">Membership Plans</a></li>
                        <li><a href="#" className="hover:text-primary-400 transition">Contact Us</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h3>
                    <ul className="space-y-2.5 text-sm">
                        <li><a href="#" className="hover:text-primary-400 transition">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-primary-400 transition">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-primary-400 transition">Refund Policy</a></li>
                        <li><a href="#" className="hover:text-primary-400 transition">Report Misuse</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <span>123 Platinum Tower, Chennai, India 600001</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span>+91 98765 43210</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span>support@kalyanam.com</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-gray-800 text-center text-xs sm:text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Kalyanam Matrimony. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
