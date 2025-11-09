import React, { useState, ReactNode } from 'react';
import { Page, AdminAlert } from '../types';
import { NAV_ITEMS } from '../constants';
import * as Icons from './Icons';

interface MainLayoutProps {
    children: ReactNode;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    handleLogout: () => void;
    alerts: AdminAlert[];
    onDismissAlert: (alertId: number | string) => void;
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


const Sidebar: React.FC<Omit<MainLayoutProps, 'children' | 'alerts' | 'onDismissAlert'>> = ({ currentPage, setCurrentPage, handleLogout }) => {
    return (
        <aside className="bg-black text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out flex flex-col justify-between">
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
                                <span className="capitalize font-semibold">{item.name}</span>
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

const MobileSidebar: React.FC<Omit<MainLayoutProps, 'children' | 'alerts' | 'onDismissAlert'> & { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }> = ({ currentPage, setCurrentPage, handleLogout, isOpen, setIsOpen }) => {
    return (
        <div className={`fixed inset-0 z-30 transition-opacity ${isOpen ? 'bg-black bg-opacity-50' : 'pointer-events-none opacity-0'}`} onClick={() => setIsOpen(false)}>
            <div className={`fixed inset-y-0 left-0 w-64 bg-black text-white p-4 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-extrabold text-white mb-8">BaBu SAHAB</h2>
                 <nav>
                    {NAV_ITEMS.map((item) => {
                        const Icon = iconMap[item.icon];
                        return (
                            <a
                                key={item.name}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(item.name);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center space-x-3 py-3 px-4 rounded my-1 ${
                                    currentPage === item.name
                                        ? 'bg-lemon text-black font-bold'
                                        : 'hover:bg-gray-800'
                                }`}
                            >
                                {Icon && <Icon className="w-5 h-5" />}
                                <span className="capitalize font-semibold">{item.name}</span>
                            </a>
                        );
                    })}
                </nav>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="flex items-center space-x-3 py-3 px-4 rounded absolute bottom-4 w-[calc(100%-2rem)] hover:bg-gray-800">
                    <Icons.LogoutIcon className="w-5 h-5" />
                    <span>Logout</span>
                </a>
            </div>
        </div>
    );
};


const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage, setCurrentPage, handleLogout, alerts, onDismissAlert }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="relative min-h-screen md:flex">
            {alerts.map(alert => <AlertPopup key={alert.id} alert={alert} onDismiss={onDismissAlert} />)}
            
            {/* Mobile Sidebar */}
            <MobileSidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />

            {/* Desktop Sidebar */}
            <div className="hidden md:flex">
                <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
            </div>

            <div className="flex-1 flex flex-col bg-white">
                {/* Header */}
                <header className="bg-black shadow-sm p-4 flex justify-between items-center md:hidden border-b border-gray-800">
                    <button onClick={() => setSidebarOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-white capitalize">{currentPage}</h1>
                    <div/>
                </header>
                <header className="hidden md:flex bg-black shadow-sm p-4 justify-between items-center text-white border-b border-gray-800">
                    <h1 className="text-2xl font-bold capitalize">{currentPage}</h1>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg></button>
                        <div className="w-10 h-10 bg-lemon rounded-full flex items-center justify-center text-black font-bold">AK</div>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-white">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;