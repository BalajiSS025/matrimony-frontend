import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X, LayoutDashboard, Users, HeartHandshake, User, LogOut, ChevronRight, Settings, Moon, Sun, MessageCircle } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuRef = useRef(null);

    // Dark mode state
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark' || 
               (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    // Close mobile menu on route change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMobileOpen(false);
    }, [location.pathname]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMobileOpen(false);
            }
        };
        if (mobileOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [mobileOpen]);

    // Lock body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `text-sm font-medium transition-colors px-1 pb-0.5 border-b-2 ${isActive(path)
            ? 'text-primary-700 border-primary-600'
            : 'text-gray-600 border-transparent hover:text-primary-600 hover:border-primary-300'
        }`;

    const authLinks = [
        { to: '/profiles', label: 'Browse', icon: Users },
        { to: '/matches', label: 'Matches', icon: HeartHandshake },
        { to: '/chat', label: 'Messages', icon: MessageCircle },
        { to: '/interests/received', label: 'Interests', icon: Heart },
        { to: '/shortlisted', label: 'Shortlist', icon: Heart },
        { to: '/profile', label: 'Profile', icon: User },
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            <nav className="bg-white text-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* Logo */}
                        <Link
                            to={token ? '/dashboard' : '/'}
                            className="flex items-center space-x-2 flex-shrink-0"
                        >
                            <div className="bg-primary-600 p-2 rounded-full flex items-center justify-center">
                                <Heart className="h-5 w-5 text-white" fill="currentColor" />
                            </div>
                            <span className="font-serif text-xl font-bold text-primary-800 whitespace-nowrap">
                                AI Matrimony
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-5 font-medium">
                            {token ? (
                                <>
                                    {authLinks.map(({ to, label }) => (
                                        <Link key={to} to={to} className={navLinkClass(to)}>
                                            {label}
                                        </Link>
                                    ))}
                                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                    </button>
                                    <NotificationBell />
                                    <button
                                        onClick={handleLogout}
                                        className="ml-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm px-4 py-2 rounded-full transition-all font-semibold border border-gray-200 hover:border-red-200 flex items-center gap-1.5"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className={navLinkClass('/login')}>Login</Link>
                                    <Link
                                        to="/register"
                                        className="bg-primary-600 hover:bg-primary-700 text-white shadow-soft hover:shadow-premium px-5 py-2 rounded-full transition-all text-sm font-semibold"
                                    >
                                        Register Free
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile menu overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

                    {/* Slide-in panel */}
                    <div
                        ref={menuRef}
                        className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col"
                    >
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary-600 p-1.5 rounded-full">
                                    <Heart className="h-4 w-4 text-white" fill="currentColor" />
                                </div>
                                <span className="font-serif text-lg font-bold text-primary-800">AI Matrimony</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Nav links */}
                        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            {token ? (
                                // eslint-disable-next-line no-unused-vars
                                authLinks.map(({ to, label, icon: IconComponent }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(to)
                                            ? 'bg-primary-50 text-primary-700 font-bold'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <IconComponent className={`w-5 h-5 ${isActive(to) ? 'text-primary-600' : 'text-gray-400'}`} />
                                            {label}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </Link>
                                ))
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Login
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Register Free
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Logout footer */}
                        {token && (
                            <div className="px-4 py-4 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-xl transition-colors border border-red-100"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
