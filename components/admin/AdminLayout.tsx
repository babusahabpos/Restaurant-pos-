import React, { useState, ReactNode } from 'react';
import { AdminPage } from '../../types';
import { LogoutIcon } from '../Icons';

interface AdminLayoutProps {
    children: ReactNode;
    currentPage: AdminPage;
    setCurrentPage: (page: AdminPage) => void;
    handleLogout: () => void;
}

const NAV_ITEMS = [
    { name: AdminPage.Dashboard },
    { name: AdminPage.UserManagement },
    { name: AdminPage.SupportTickets },
    { name: AdminPage.SubscriptionRenewal },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, setCurrentPage, handleLogout }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white">
            <nav className="bg-gray-900 shadow-lg sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo/Brand */}
                        <div className="flex-shrink-0">
                            <a href="#" className="text-xl font-extrabold text-lemon">BaBu SAHAB - ADMIN</a>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {NAV_ITEMS.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => setCurrentPage(item.name)}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                            currentPage === item.name
                                                ? 'bg-lemon text-black font-bold'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                             <button 
                                onClick={handleLogout}
                                className="ml-8 flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                <LogoutIcon className="w-5 h-5 mr-1" />
                                Logout
                            </button>
                        </div>
                        
                        {/* Mobile Menu Button */}
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                                type="button"
                                className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                                aria-controls="mobile-menu"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Open main menu</span>
                                {!isMobileMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu, show/hide based on menu state. */}
                {isMobileMenuOpen && (
                    <div className="md:hidden" id="mobile-menu">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        setCurrentPage(item.name);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${
                                        currentPage === item.name
                                            ? 'bg-lemon text-black font-bold'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-700">
                             <div className="px-2 space-y-1">
                                <button
                                     onClick={() => {
                                         handleLogout();
                                         setMobileMenuOpen(false);
                                     }}
                                    className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                     <LogoutIcon className="w-5 h-5 mr-2" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                 <header>
                     <h1 className="text-3xl font-bold capitalize text-white">{currentPage}</h1>
                </header>
                <main className="mt-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;