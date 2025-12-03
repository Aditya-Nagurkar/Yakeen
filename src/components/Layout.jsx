// This is a no-op change to force recompile
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, FileText, PlusCircle, LogIn } from 'lucide-react';
import { onAuthChange, getUserProfile, logOut } from '../services/auth';
import AnimatedBackground from './AnimatedBackground';
import logo from '../assets/logo.png';
import ChatWidget from './ChatWidget';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            setCurrentUser(user);
            if (user) {
                const profile = await getUserProfile(user.uid);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await logOut();
            setShowUserMenu(false);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const isActive = (path) => {
        return location.pathname === path ? 'text-primary bg-blue-50' : 'text-gray-600 hover:text-primary hover:bg-gray-50';
    };

    return (
        <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
            <AnimatedBackground />

            <header className="sticky top-0 z-50 glass rounded-3xl mx-4 mt-4 border border-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <img src={logo} alt="YakeeN Logo" className="h-12 w-auto" />
                            <span className="text-2xl font-bold text-gradient tracking-tight">YakeeN</span>
                        </div>

                        <nav className="hidden md:flex items-center space-x-2">
                            <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/')}`}>
                                Home
                            </Link>
                            <Link to="/opportunities" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/opportunities')}`}>
                                Opportunities
                            </Link>
                            <Link to="/post" className="ml-4 h-11 px-6 rounded-lg text-sm font-medium bg-gradient-to-r from-secondary to-orange-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Post Opportunity
                            </Link>

                            {currentUser ? (
                                <div className="relative ml-4">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="h-11 flex items-center gap-2 px-4 rounded-lg bg-white/80 border border-gray-200 hover:bg-white hover:shadow-md transition-all"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-base font-medium text-gray-700">{userProfile?.name || 'User'}</span>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-64 glass-card rounded-xl shadow-xl border border-white/20 py-2 z-50 animate-fadeIn">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-900">{userProfile?.name}</p>
                                                <p className="text-xs text-gray-500">{userProfile?.email}</p>
                                                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${userProfile?.role === 'poster'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {userProfile?.role === 'poster' ? 'Opportunity Poster' : 'Opportunity Seeker'}
                                                </span>
                                            </div>
                                            <Link
                                                to="/my-postings"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <FileText className="w-4 h-4" />
                                                <span className="text-sm font-medium">My Postings</span>
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-600"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-sm font-medium">Sign Out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/signin"
                                    className="ml-4 px-4 py-2 rounded-lg text-sm font-medium bg-white/80 border border-gray-200 hover:bg-white hover:shadow-md transition-all flex items-center gap-2"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Sign In
                                </Link>
                            )}
                        </nav>

                        <div className="md:hidden flex items-center">
                            <button className="text-gray-600 hover:text-gray-900 p-2">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow relative z-0">
                <div className="animate-fadeIn">
                    <Outlet />
                </div>
            </main>

            <footer className="bg-white/80 backdrop-blur-md border border-gray-200 mt-auto mx-4 mb-4 rounded-3xl">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <p className="text-sm text-gray-500">
                                &copy; 2025 YakeeN. Trust That's Near.
                            </p>
                        </div>
                        <div className="flex space-x-6">
                            <a href="/privacy" className="text-gray-400 hover:text-primary transition-colors">Privacy</a>
                            <a href="/terms" className="text-gray-400 hover:text-primary transition-colors">Terms</a>
                            <a href="mailto:contact@yakeen.com" className="text-gray-400 hover:text-primary transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
            <ChatWidget />
        </div>
    );
};

export default Layout;