
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
    { name: AdminPage.StaffManagement, key: 'staff_users' },
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
        <div className="flex h-screen w-screen overflow-hidden bg-black text-white relative">
            <nav className="bg-gray-900 shadow-lg fixed top-0 left-0 right-0 z-[100] border-b border-gray-800 h-16 px-4">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
                    <div className="flex-shrink-0">
                        <a href="#" className="text-xl font-extrabold text-lemon uppercase tracking-tighter">BaBu SAHAB <span className="text-white/30 ml-1">ADMIN</span></a>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const badge = getBadgeCount(item.name);
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => setCurrentPage(item.name)}
                                    className={`relative px-3 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        currentPage === item.name
                                            ? 'bg-lemon text-black shadow-lg'
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
                        <button onClick={handleLogout} className="ml-4 p-2 text-gray-500 hover:text-red-500 transition-colors"><LogoutIcon className="w-5 h-5" /></button>
                    </div>
                    
                    <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden bg-gray-800 p-2 rounded-md text-gray-400">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/90 z-[90] lg:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
                    <div className="bg-gray-900 pt-20 pb-10 px-4 space-y-2" onClick={e => e.stopPropagation()}>
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => { setCurrentPage(item.name); setMobileMenuOpen(false); }}
                                className={`w-full text-left flex justify-between items-center px-4 py-4 rounded-xl text-xs font-black uppercase ${currentPage === item.name ? 'bg-lemon text-black' : 'bg-black/40 text-gray-300'}`}
                            >
                                {item.name}
                                {getBadgeCount(item.name) > 0 && <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[9px]">{getBadgeCount(item.name)}</span>}
                            </button>
                        ))}
                        <button onClick={handleLogout} className="w-full text-left px-4 py-4 rounded-xl text-xs font-black uppercase text-red-500 bg-red-500/10">Logout</button>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col pt-16 h-full w-full">
                <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="mb-8">
                             <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">{currentPage}</h1>
                             <div className="h-1.5 w-24 bg-lemon mt-2"></div>
                        </div>
                        {children}
                        <div className="h-20" /> {/* Spacer for bottom of scroll */}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
