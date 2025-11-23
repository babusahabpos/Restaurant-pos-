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
}> = ({ currentPage, setCurrentPage, handleLogout }) => {
    return (
        <aside className="bg-black text-white w-64 space-y-6 py-7 px-2 h-full flex flex-col justify-between">
            <div>
                <a href="#" className="flex items-center space-x-2 px-4">
                    <span className="text-2xl font-extrabold text-white">BaBu SAHAB</span>
                </a>

                <nav className="mt-10">
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
                                className={`flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 ${
                                    currentPage === item.name
                                        ? 'bg-lemon text-black font-bold'
                                        : 'hover:bg-gray-800'
                                }`}
                            >
                                {Icon && <Icon className="w-6 h-6" />}
                                <span className="capitalize font-semibold">{item.name === 'qrMenu' ? 'QR Menu' : item.name}</span>
                            </a>
                        );
                    })}
                </nav>
            </div>
            <div>
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                    }}
                    className="flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800"
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
        <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 py-2 px-4 flex justify-around items-center md:hidden z-20">
            {navItems.map((item) => {
                const isActive = currentPage === item.name;
                const Icon = item.icon;

                if (item.name === 'dashboard') {
                    return (
                        <button
                            key={item.name}
                            onClick={() => setCurrentPage(item.name)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex items-center justify-center w-16 h-16 -mt-8 rounded-full transition-transform duration-300 shadow-lg shadow-lemon/30 ${isActive ? 'bg-lemon text-black scale-110' : 'bg-gray-800 text-white'}`}
                        >
                            <div className="flex flex-col items-center">
                                <Icon className="w-7 h-7" />
                                <span className="text-xs font-bold capitalize mt-1">
                                    {item.name}
                                </span>
                            </div>
                        </button>
                    );
                }

                return (
                    <button
                        key={item.name}
                        onClick={() => setCurrentPage(item.name)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors w-20 ${isActive ? 'text-lemon' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs capitalize mt-1">{item.name}</span>
                    </button>
                );
            })}
        </nav>
    );
};


const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage, setCurrentPage, handleLogout, alerts, onDismissAlert, loggedInUser }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const handleSetCurrentPage = (page: Page) => {
        setCurrentPage(page);
        setMobileMenuOpen(false);
    };
    
    return (
        <div className="relative min-h-screen md:flex">
            {alerts.map(alert => <AlertPopup key={alert.id} alert={alert} onDismiss={onDismissAlert} />)}

            {/* Overlay for mobile sidebar */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}
            
            {/* Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar currentPage={currentPage} setCurrentPage={handleSetCurrentPage} handleLogout={handleLogout} />
            </div>

            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="bg-black shadow-sm p-4 flex justify-between items-center md:hidden border-b border-gray-800 relative">
                    <button onClick={() => setMobileMenuOpen(true)} className="text-white p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <h1 className="text-xl font-bold text-white capitalize">{currentPage === 'qrMenu' ? 'QR Menu' : currentPage}</h1>
                    <div className="w-8"></div> {/* Spacer to keep title centered */}
                </header>

                {/* Desktop Header */}
                <header className="hidden md:flex bg-black shadow-sm p-4 justify-between items-center text-white border-b border-gray-800">
                    <h1 className="text-2xl font-bold capitalize">{currentPage === 'qrMenu' ? 'QR Menu' : currentPage}</h1>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg></button>
                         <div className="relative">
                            <button onClick={() => setDropdownOpen(!isDropdownOpen)}>
                                <Icons.DotsVerticalIcon className="w-6 h-6 text-gray-400 hover:text-white" />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                                    {/* Dropdown items can be added here if needed in the future */}
                                </div>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-lemon rounded-full flex items-center justify-center text-black font-bold">
                           {loggedInUser.name.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>
                <main className={`flex-1 pb-24 md:pb-8 ${currentPage === 'dashboard' ? 'p-4 md:p-6 lg:p-8 bg-lemon text-black' : 'bg-black'}`}>
                    {children}
                </main>
            </div>
            
            <BottomNavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
    );
};

export default MainLayout;