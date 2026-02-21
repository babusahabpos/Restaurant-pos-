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
    { name: AdminPage.UserOrders, key: 'market' },
    { name: AdminPage.StaffHub, key: 'staff' }, // Corrected: Added to Nav
    { name: AdminPage.SupportTickets, key: 'tickets' },
    { name: AdminPage.SubscriptionRenewal, key: 'subscriptions' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, setCurrentPage, handleLogout, badgeCounts }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getBadgeCount = (name: AdminPage) => {
        if (name === AdminPage.Dashboard) return badgeCounts.pendingUsers || 0;
        if (name === AdminPage.SupportTickets) return badgeCounts.tickets || 0;
        if (name === AdminPage.UserOrders) return badgeCounts.marketOrders || 0;
        return 0;
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white relative">
            <nav className="bg-gray-900 shadow-lg border-b border-gray-800 h-16 px-4 flex-shrink-0 z-[100]">
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
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-gray-900">
                                            {badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                        <button onClick={() => { if(window.confirm('Logout from Admin?')) handleLogout(); }} className="ml-4 p-2 text-gray-500 hover:text-red-500 transition-colors"><LogoutIcon className="w-5 h-5" /></button>
                    </div>
                    
                    <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden bg-gray-800 p-2 rounded-md text-gray-400">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/95 z-[110] lg:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
                    <div className="bg-gray-900 pt-20 pb-10 px-4 space-y-2 h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                        <button onClick={() => { if(window.confirm('Logout from Admin?')) handleLogout(); }} className="w-full text-left px-4 py-4 rounded-xl text-xs font-black uppercase text-red-500 bg-red-500/10">Logout</button>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-y-auto no-scrollbar bg-black p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6 pb-20">
                    <div className="mb-6">
                         <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">{currentPage}</h1>
                         <div className="h-1.5 w-20 bg-lemon mt-2"></div>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;