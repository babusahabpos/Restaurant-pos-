
import React, { ReactNode, useState } from 'react';
import { Page, AdminAlert, RegisteredUser } from '../types';
import { NAV_ITEMS } from '../constants';
import * as Icons from './Icons';

interface MainLayoutProps {
    children: ReactNode;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    handleLogout: () => void;
    alerts: AdminAlert[];
    onDismissAlert: (alertId: number | string) => void;
    loggedInUser: RegisteredUser;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    dashboard: Icons.DashboardIcon,
    billing: Icons.BillingIcon,
    online: Icons.OnlineIcon,
    menu: Icons.MenuIcon,
    inventory: Icons.InventoryIcon,
    staff: Icons.StaffIcon,
    reports: Icons.ReportsIcon,
    subscription: Icons.SubscriptionIcon,
    help: Icons.HelpIcon,
    settings: Icons.SettingsIcon,
    qrCode: Icons.QrCodeIcon,
    social: Icons.SocialIcon,
    refer: Icons.ReferIcon,
};

const AlertPopup: React.FC<{ alert: AdminAlert; onDismiss: (id: number | string) => void }> = ({ alert, onDismiss }) => (
    <div className="fixed top-5 right-5 bg-lemon text-gray-900 p-4 rounded-lg shadow-lg z-50 max-w-sm animate-bounce">
        <h4 className="font-bold">Message from Admin</h4>
        <p className="mt-1">{alert.message}</p>
        <button onClick={() => onDismiss(alert.id)} className="absolute top-2 right-2 text-gray-900 hover:text-black">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    </div>
);


const Sidebar: React.FC<{
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    handleLogout: () => void;
    restaurantName: string;
}> = ({ currentPage, setCurrentPage, handleLogout, restaurantName }) => {
    return (
        <aside className="bg-black text-white w-64 space-y-6 py-7 px-2 h-full flex flex-col justify-between border-r border-gray-800">
            <div>
                <a href="#" className="flex items-center space-x-2 px-4">
                    <span className="text-2xl font-extrabold text-white break-words">{restaurantName || 'BaBu SAHAB'}</span>
                </a>

                <nav className="mt-10 overflow-y-auto max-h-[70vh] no-scrollbar">
                    {NAV_ITEMS.map((item) => {
                        const Icon = iconMap[item.icon];
                        return (
                            <a
                                key={item.name}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(item.name);
                                }}
                                className={`flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 mb-1 ${
                                    currentPage === item.name
                                        ? 'bg-lemon text-black font-bold'
                                        : 'hover:bg-gray-800'
                                }`}
                            >
                                {Icon && <Icon className="w-6 h-6" />}
                                <span className="capitalize font-semibold">{item.name === 'qrMenu' ? 'QR Menu' : item.name === 'refer' ? 'Refer & Earn' : item.name}</span>
                            </a>
                        );
                    })}
                </nav>
            </div>
            <div className="pt-4 border-t border-gray-800">
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                    }}
                    className="flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800 text-red-400"
                >
                    <Icons.LogoutIcon className="w-6 h-6" />
                    <span>Logout</span>
                </a>
            </div>
        </aside>
    );
};

const BottomNavBar: React.FC<{
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}> = ({ currentPage, setCurrentPage }) => {
    const navItems: { name: Page; icon: React.ComponentType<{ className?: string }> }[] = [
        { name: 'billing', icon: Icons.BillingIcon },
        { name: 'dashboard', icon: Icons.DashboardIcon },
        { name: 'online', icon: Icons.OnlineIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 h-16 px-4 flex justify-around items-center md:hidden z-20">
            {navItems.map((item) => {
                const isActive = currentPage === item.name;
                const Icon = item.icon;

                if (item.name === 'dashboard') {
                    return (
                        <button
                            key={item.name}
                            onClick={() => setCurrentPage(item.name)}
                            className={`flex items-center justify-center w-14 h-14 -mt-10 rounded-full transition-transform duration-300 shadow-xl shadow-lemon/20 ${isActive ? 'bg-lemon text-black scale-110' : 'bg-gray-800 text-white'}`}
                        >
                            <Icon className="w-7 h-7" />
                        </button>
                    );
                }

                return (
                    <button
                        key={item.name}
                        onClick={() => setCurrentPage(item.name)}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-lemon' : 'text-gray-500'}`}
                    >
                        <Icon className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">{item.name}</span>
                    </button>
                );
            })}
        </nav>
    );
};


const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage, setCurrentPage, handleLogout, alerts, onDismissAlert, loggedInUser }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSetCurrentPage = (page: Page) => {
        setCurrentPage(page);
        setMobileMenuOpen(false);
    };
    
    // Custom header height calculation
    const isSpecialPage = currentPage === 'billing' || currentPage === 'online';

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-black text-white relative">
            {alerts.map(alert => <AlertPopup key={alert.id} alert={alert} onDismiss={onDismissAlert} />)}

            {/* Sidebar Desktop */}
            <div className="hidden md:block h-full">
                <Sidebar 
                    currentPage={currentPage} 
                    setCurrentPage={handleSetCurrentPage} 
                    handleLogout={handleLogout}
                    restaurantName={loggedInUser.restaurantName}
                />
            </div>

            {/* Sidebar Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-64 h-full" onClick={e => e.stopPropagation()}>
                        <Sidebar 
                            currentPage={currentPage} 
                            setCurrentPage={handleSetCurrentPage} 
                            handleLogout={handleLogout}
                            restaurantName={loggedInUser.restaurantName}
                        />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Unified Header */}
                <header className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-black z-10">
                    <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <h1 className="text-sm font-black uppercase tracking-widest text-lemon">
                        {currentPage === 'qrMenu' ? 'QR Menu' : currentPage}
                    </h1>
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold">
                           {loggedInUser.name.substring(0, 1).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar ${isSpecialPage ? 'p-0 h-full' : 'p-4 md:p-6 pb-20 md:pb-6'}`}>
                    {children}
                </main>
                
                <BottomNavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
        </div>
    );
};

export default MainLayout;