
import React, { useState, ReactNode } from 'react';
import { AdminPage } from '../../types';
import { LogoutIcon } from '../Icons';

interface AdminLayoutProps {
    children: ReactNode;
    currentPage: AdminPage;
    setCurrentPage: (page: AdminPage) => void;
    handleLogout: () => void;
    badgeCounts: Record<string, number>;
}

const NAV_ITEMS = [
    { name: AdminPage.Dashboard, key: 'dashboard' },
    { name: AdminPage.UserManagement, key: 'users' },
    { name: AdminPage.StaffManagement, key: 'staff_users' }, // New option
    { name: AdminPage.SupportTickets, key: 'tickets' },
    { name: AdminPage.StaffHub, key: 'staff_hub' },
    { name: AdminPage.StaffRequirements, key: 'staff_reqs' },
    { name: AdminPage.SubscriptionRenewal, key: 'subscriptions' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, setCurrentPage, handleLogout, badgeCounts }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getBadgeCount = (name: AdminPage) => {
        if (name === AdminPage.SupportTickets) return badgeCounts.tickets || 0;
        if (name === AdminPage.StaffRequirements) return badgeCounts.staffReqs || 0;
        if (name === AdminPage.StaffHub) return badgeCounts.staffApps || 0;
        return 0;
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <nav className="bg-gray-900 shadow-lg sticky top-0 z-20 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0">
                            <a href="#" className="text-xl font-extrabold text-lemon">BaBu SAHAB <span className="text-white/30 ml-1">ADMIN</span></a>
                        </div>
                        
                        <div className="hidden lg:flex items-center">
                            <div className="ml-10 flex items-baseline space-x-1 overflow-x-auto no-scrollbar max-w-[70vw]">
                                {NAV_ITEMS.map((item) => {
                                    const badge = getBadgeCount(item.name);
                                    return (
                                        <button
                                            key={item.name}
                                            onClick={() => setCurrentPage(item.name)}
                                            className={`relative px-3 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                                currentPage === item.name
                                                    ? 'bg-lemon text-black shadow-lg shadow-lemon/10'
                                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                        >
                                            {item.name}
                                            {badge > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-gray-900 animate-pulse">
                                                    {badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                             <button 
                                onClick={handleLogout}
                                className="ml-8 flex items-center px-3 py-2 rounded-md text-[10px] font-black uppercase text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <LogoutIcon className="w-4 h-4 mr-1" />
                                Logout
                            </button>
                        </div>
                        
                        <div className="flex lg:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                                type="button"
                                className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                                {!isMobileMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-gray-900 border-b border-gray-800">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        setCurrentPage(item.name);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full text-left block px-3 py-3 rounded-md text-xs font-bold uppercase ${
                                        currentPage === item.name
                                            ? 'bg-lemon text-black'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    } flex justify-between items-center`}
                                >
                                    {item.name}
                                    {getBadgeCount(item.name) > 0 && <span className="bg-red-600 text-white px-2 rounded-full text-[8px]">{getBadgeCount(item.name)}</span>}
                                </button>
                            ))}
                            <button
                                 onClick={handleLogout}
                                className="w-full text-left flex items-center px-3 py-3 rounded-md text-xs font-bold uppercase text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                                <LogoutIcon className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>
            
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                 <header>
                     <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">{currentPage}</h1>
                     <div className="h-1 w-20 bg-lemon"></div>
                </header>
                <main className="mt-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
