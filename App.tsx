
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import OnlineOrders from './components/OnlineOrders';
import Menu from './components/Menu';
import Inventory from './components/Inventory';
import Staff from './components/Staff';
import Reports from './components/Reports';
import Settings from './components/Settings';
import QrMenu from './components/QrMenu';
import Subscription from './components/Subscription';
import HelpAndSupport from './components/HelpAndSupport';
import SocialMedia from './components/SocialMedia';
import Referral from './components/Referral'; 
import CustomerOrderPage from './components/CustomerOrderPage'; 
import StaffRequirements from './components/StaffRequirements';
import StaffApplicationPage from './components/StaffApplicationPage'; 
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportTickets from './components/admin/SupportTickets';
import AdminStaffHub from './components/admin/AdminStaffHub';
import AdminStaffManagement from './components/admin/AdminStaffManagement';
import AdminStaffRequirements from './components/admin/AdminStaffRequirements';
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, StaffJobPost, StaffRequirementRequest, StaffApplication, MenuItem, RestaurantJobPost, StaffUser } from './types';

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer' | 'staffApply';
    
    // PERSISTENCE: Initialize from localStorage
    const [authState, setAuthState] = useState<AuthState>(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#customer-order')) return 'customer';
        if (hash === '#staff-apply') return 'staffApply';
        
        const savedAuth = localStorage.getItem('babuSahabPos_authState');
        return (savedAuth as AuthState) || 'login';
    });

    const [loggedInUser, setLoggedInUser] = useState<RegisteredUser | null>(() => {
        const savedUser = localStorage.getItem('babuSahabPos_loggedInUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

    // --- State Management ---
    const [orders, setOrders] = useState<OrderStatusItem[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_orders') || '[]').map((o: any) => ({...o, timestamp: new Date(o.timestamp)})) );
    const [dashboardData, setDashboardData] = useState<DashboardData>({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
    
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
        const storedUsers = localStorage.getItem('babuSahabPos_users');
        if (storedUsers) {
            return JSON.parse(storedUsers).map((u: any) => ({
                ...u,
                menu: Array.isArray(u.menu) ? u.menu : MOCK_MENU_ITEMS
            }));
        }
        return JSON.parse(JSON.stringify(MOCK_USERS));
    });

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_tickets') || JSON.stringify(MOCK_TICKETS)).map((t: any) => ({...t, lastUpdate: new Date(t.lastUpdate), messages: t.messages.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))})));
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_alerts') || '[]'));
    
    const [jobPosts, setJobPosts] = useState<StaffJobPost[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_jobPosts') || '[]').map((p: any) => ({...p, timestamp: new Date(p.timestamp)})));
    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_staffRequests') || '[]').map((r: any) => ({...r, timestamp: new Date(r.timestamp)})));
    const [staffApplications, setStaffApplications] = useState<StaffApplication[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_staffApplications') || '[]').map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })));
    const [restaurantJobPosts, setRestaurantJobPosts] = useState<RestaurantJobPost[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_restaurantJobPosts') || '[]').map((p: any) => ({...p, timestamp: new Date(p.timestamp)})));
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_staffUsers') || '[]').map((u: any) => ({...u, registeredAt: new Date(u.registeredAt)})));

    // PERSISTENCE EFFECT: Save Auth State whenever it changes
    useEffect(() => {
        localStorage.setItem('babuSahabPos_authState', authState);
        if (loggedInUser) {
            localStorage.setItem('babuSahabPos_loggedInUser', JSON.stringify(loggedInUser));
        } else {
            localStorage.removeItem('babuSahabPos_loggedInUser');
        }
    }, [authState, loggedInUser]);

    useEffect(() => {
        const handleHashChange = () => { 
            const hash = window.location.hash;
            if (hash.startsWith('#customer-order')) setAuthState('customer'); 
            else if (hash === '#staff-apply') setAuthState('staffApply');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // Robust sync for users and staff across tabs
            if (e.key === 'babuSahabPos_staffUsers') {
                const latest = JSON.parse(e.newValue || '[]');
                setStaffUsers(latest.map((u: any) => ({...u, registeredAt: new Date(u.registeredAt)})));
            }
            if (e.key === 'babuSahabPos_users') {
                setRegisteredUsers(JSON.parse(e.newValue || '[]'));
            }
            if (e.key === 'babuSahabPos_staffApplications') {
                setStaffApplications(JSON.parse(e.newValue || '[]').map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })));
            }
            if (e.key?.startsWith('babuSahabPos_incomingOrder_') && e.newValue) {
                try {
                    const incomingOrder: OrderStatusItem = JSON.parse(e.newValue);
                    incomingOrder.timestamp = new Date(incomingOrder.timestamp);
                    setOrders(prev => [...prev, incomingOrder]);
                    const audio = document.getElementById('notification-sound') as HTMLAudioElement;
                    if (audio) audio.play().catch(() => {});
                    localStorage.removeItem(e.key);
                } catch (err) {}
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Sync state to local storage whenever they change
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_restaurantJobPosts', JSON.stringify(restaurantJobPosts)); }, [restaurantJobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffUsers', JSON.stringify(staffUsers)); }, [staffUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffApplications', JSON.stringify(staffApplications)); }, [staffApplications]);

    const handleLogin = (email: string, pass: string): any => {
        // Super Admin
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') { 
            setAuthState('adminLoggedIn'); 
            return 'admin'; 
        }
        
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Approved) { 
                setAuthState('loggedIn'); 
                setLoggedInUser(user); 
                return 'ok'; 
            }
            // If user is pending, return 'pending' so Login.tsx can show the error message
            return user.status.toLowerCase(); 
        }
        return 'not_found';
    };

    const handleRegister = (newUser: any, referralCode?: string) => {
        const getFutureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const generatedReferralCode = `refer${newUser.restaurantName.replace(/\s+/g, '').toLowerCase()}`;
        
        const user: RegisteredUser = { 
            ...newUser, 
            id: Date.now(), 
            status: UserStatus.Pending, 
            lastLogin: 'Never', 
            subscriptionEndDate: getFutureDate(30), 
            address: 'Update in settings', 
            taxRate: 5, 
            deliveryCharge: 30, 
            isDeliveryEnabled: true, 
            isPrinterEnabled: true, 
            menu: MOCK_MENU_ITEMS, 
            referralCode: generatedReferralCode, 
            referredBy: referralCode || '', 
            socialMedia: { autoPostEnabled: false } 
        };

        const updatedUsers = [...registeredUsers, user];
        setRegisteredUsers(updatedUsers);
        // Force immediate persistence for cross-tab sync
        localStorage.setItem('babuSahabPos_users', JSON.stringify(updatedUsers));
    };

    const handleStaffUserRegister = (name: string, phone: string) => {
        const newUser: StaffUser = { id: Date.now(), name, phone, status: 'Pending', isBlocked: false, registeredAt: new Date() };
        const updated = [...staffUsers, newUser];
        setStaffUsers(updated);
        // Force immediate persistence so Admin sees it
        localStorage.setItem('babuSahabPos_staffUsers', JSON.stringify(updated));
        return newUser;
    };

    const handleAdminApproveStaff = (userId: number, approve: boolean) => {
        const updated = staffUsers.map(u => u.id === userId ? { ...u, status: approve ? 'Approved' : 'Rejected' } : u);
        setStaffUsers(updated);
        localStorage.setItem('babuSahabPos_staffUsers', JSON.stringify(updated));
    };

    const handleAdminCreateJob = (job: Omit<RestaurantJobPost, 'id' | 'timestamp'>) => {
        const newJob: RestaurantJobPost = { ...job, id: Date.now(), timestamp: new Date() };
        const updated = [...restaurantJobPosts, newJob];
        setRestaurantJobPosts(updated);
        localStorage.setItem('babuSahabPos_restaurantJobPosts', JSON.stringify(updated));
    };

    const handleLogout = () => {
        setAuthState('login');
        setLoggedInUser(null);
        localStorage.removeItem('babuSahabPos_authState');
        localStorage.removeItem('babuSahabPos_loggedInUser');
    };

    if (authState === 'staffApply') return <StaffApplicationPage onApply={(a) => setStaffApplications(prev => [...prev, {...a, id: Date.now(), timestamp: new Date()}])} restaurantJobs={restaurantJobPosts} registeredStaff={staffUsers} onRegisterStaff={handleStaffUserRegister} />;
    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;
    
    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} staffUsers={staffUsers} tickets={supportTickets} staffRequests={staffRequests} staffApplications={staffApplications} onApproveReject={(id, dec) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected} : u))} onApproveStaff={handleAdminApproveStaff} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={(id, b) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: b ? UserStatus.Blocked : UserStatus.Approved} : u))} onSendMessage={() => {}} onPasswordChange={() => {}} onUpdateSubscription={() => {}} onUpdateMenu={() => {}} onDeleteUser={() => {}} />,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={() => {}} onResolve={() => {}} />,
            [AdminPage.StaffHub]: <AdminStaffHub applications={staffApplications} onDeleteApp={(id) => setStaffApplications(prev => prev.filter(a => a.id !== id))} onPostApp={() => {}} onMarkRead={(id) => setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a))} onCreateJob={handleAdminCreateJob} activeJobs={restaurantJobPosts} onDeleteJob={(id) => setRestaurantJobPosts(prev => prev.filter(p => p.id !== id))} />,
            [AdminPage.StaffManagement]: <AdminStaffManagement users={staffUsers} onBlock={(id, b) => setStaffUsers(prev => prev.map(u => u.id === id ? {...u, isBlocked: b} : u))} onDelete={(id) => setStaffUsers(prev => prev.filter(u => u.id !== id))} onApproveStatus={handleAdminApproveStaff} onMessage={() => {}} />,
            [AdminPage.StaffRequirements]: <AdminStaffRequirements requests={staffRequests} applications={staffApplications} jobPosts={jobPosts} onAddPost={() => {}} onDeletePost={() => {}} onMarkRead={() => {}} onMarkAppRead={() => {}} />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={() => {}} />,
        };
        const totalAlerts = supportTickets.filter(t => t.status === 'Open').length + staffRequests.filter(r => !r.isRead).length + staffApplications.filter(a => !a.isRead).length + staffUsers.filter(u => u.status === 'Pending').length;
        return <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, staffReqs: totalAlerts, staffApps: staffApplications.filter(a => !a.isRead).length }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>{adminPages[currentAdminPage]}</AdminLayout>;
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const pages = {
            dashboard: <Dashboard data={dashboardData} orders={orders.filter(o => o.restaurantId === loggedInUser.id)} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: 'Completed'} : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ''} menuItems={loggedInUser.menu} onUpdateOrder={() => {}} isPrinterEnabled={true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />,
            billing: <Billing menuItems={loggedInUser.menu} onPrintKOT={(o) => setOrders(prev => [...prev, {...o, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date()}])} taxRate={5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={true} />,
            online: <OnlineOrders menuItems={loggedInUser.menu} onPrintKOT={(o) => setOrders(prev => [...prev, {...o, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date()}])} />,
            menu: <Menu menu={loggedInUser.menu} setMenu={(m) => setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? {...u, menu: m} : u))} />,
            qrMenu: <QrMenu menu={loggedInUser.menu} setMenu={() => {}} loggedInUser={loggedInUser} />,
            staff: <Staff />,
            staffRequirements: <StaffRequirements jobPosts={jobPosts} onSubmitRequirement={(r, s) => setStaffRequests(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: r, salary: s, timestamp: new Date(), isRead: false }])} />,
            inventory: <Inventory />,
            reports: <Reports />,
            social: <SocialMedia user={loggedInUser} />,
            refer: <Referral user={loggedInUser} />,
            settings: <Settings user={loggedInUser} onSave={(upd) => setLoggedInUser(prev => prev ? {...prev, ...upd} : null)} onLogout={handleLogout} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={() => {}} />,
        };
        return <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={[]} onDismissAlert={() => {}} loggedInUser={loggedInUser}>{pages[currentPage]}</MainLayout>;
    }
    
    return <div>Refresh...</div>;
}

export default App;
