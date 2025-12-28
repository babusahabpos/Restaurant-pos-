
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
import AdminStaffRequirements from './components/admin/AdminStaffRequirements';
import AdminStaffHub from './components/admin/AdminStaffHub';
import AdminStaffManagement from './components/admin/AdminStaffManagement';
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, StaffJobPost, StaffRequirementRequest, StaffApplication, MenuItem, RestaurantJobPost, StaffUser } from './types';

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer' | 'staffApply';
    
    const [authState, setAuthState] = useState<AuthState>(() => {
        if (window.location.hash.startsWith('#customer-order')) return 'customer';
        if (window.location.hash === '#staff-apply') return 'staffApply';
        return 'login';
    });

    const [loggedInUser, setLoggedInUser] = useState<RegisteredUser | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

    const [orders, setOrders] = useState<OrderStatusItem[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_orders') || '[]').map((o: any) => ({...o, timestamp: new Date(o.timestamp)})) );
    const [dashboardData, setDashboardData] = useState<DashboardData>({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
    
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
        const storedUsers = localStorage.getItem('babuSahabPos_users');
        if (storedUsers) {
            return JSON.parse(storedUsers).map((u: any) => ({
                ...u,
                taxRate: u.taxRate !== undefined ? Number(u.taxRate) : 5,
                deliveryCharge: u.deliveryCharge !== undefined ? Number(u.deliveryCharge) : 30,
                isDeliveryEnabled: u.isDeliveryEnabled !== undefined ? u.isDeliveryEnabled : true,
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

    useEffect(() => {
        const handleHashChange = () => { 
            if (window.location.hash.startsWith('#customer-order')) setAuthState('customer'); 
            else if (window.location.hash === '#staff-apply') setAuthState('staffApply');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'babuSahabPos_staffUsers') {
                setStaffUsers(JSON.parse(e.newValue || '[]').map((u: any) => ({...u, registeredAt: new Date(u.registeredAt)})));
            }
            if (e.key === 'babuSahabPos_restaurantJobPosts') {
                setRestaurantJobPosts(JSON.parse(e.newValue || '[]').map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) })));
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

    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('babuSahabPos_jobPosts', JSON.stringify(jobPosts)); }, [jobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffRequests', JSON.stringify(staffRequests)); }, [staffRequests]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffApplications', JSON.stringify(staffApplications)); }, [staffApplications]);
    useEffect(() => { localStorage.setItem('babuSahabPos_restaurantJobPosts', JSON.stringify(restaurantJobPosts)); }, [restaurantJobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffUsers', JSON.stringify(staffUsers)); }, [staffUsers]);

    const handleLogin = (email: string, pass: string): any => {
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Approved) { setAuthState('loggedIn'); setLoggedInUser(user); return 'ok'; }
            return user.status.toLowerCase();
        }
        return 'not_found';
    };

    const handleLogout = () => { setAuthState('login'); setLoggedInUser(null); };

    // Staff Handlers
    const handleStaffUserRegister = (name: string, phone: string) => {
        const newUser: StaffUser = { 
            id: Date.now(), 
            name, 
            phone, 
            subscriptionStatus: 'none', 
            isBlocked: false, 
            registeredAt: new Date() 
        };
        setStaffUsers(prev => [...prev, newUser]);
        return newUser;
    };

    const handleStaffSubscriptionRequest = (userId: number) => {
        setStaffUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionStatus: 'pending' } : u));
    };

    const handleAdminApproveStaffSub = (userId: number, approve: boolean) => {
        setStaffUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionStatus: approve ? 'active' : 'none' } : u));
    };

    const handleAdminCreateJob = (job: Omit<RestaurantJobPost, 'id' | 'timestamp'>) => {
        const newJob: RestaurantJobPost = { ...job, id: Date.now(), timestamp: new Date() };
        setRestaurantJobPosts(prev => [...prev, newJob]);
    };

    const handleStaffApply = (application: StaffApplication) => {
        const newApp = { ...application, id: Date.now(), timestamp: new Date(), isRead: false };
        setStaffApplications(prev => [...prev, newApp]);
    };

    if (authState === 'staffApply') return <StaffApplicationPage onApply={handleStaffApply} restaurantJobs={restaurantJobPosts} registeredStaff={staffUsers} onRegisterStaff={handleStaffUserRegister} onSubscribeStaff={handleStaffSubscriptionRequest} />;
    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={() => {}} onNavigateToLogin={() => setAuthState('login')} />;
    
    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} staffUsers={staffUsers} tickets={supportTickets} staffRequests={staffRequests} staffApplications={staffApplications} onApproveReject={(id, dec) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected} : u))} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={(id, b) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: b ? UserStatus.Blocked : UserStatus.Approved} : u))} onSendMessage={() => {}} onPasswordChange={() => {}} onUpdateSubscription={() => {}} onUpdateMenu={() => {}} onDeleteUser={() => {}} />,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={(id, msg) => setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, messages: [...t.messages, { sender: 'admin', text: msg, timestamp: new Date() }], status: 'Pending', lastUpdate: new Date() } : t))} onResolve={(id) => setSupportTickets(prev => prev.map(t => t.id === id ? {...t, status: 'Resolved'} : t))} />,
            [AdminPage.StaffHub]: <AdminStaffHub applications={staffApplications} onDeleteApp={(id) => setStaffApplications(prev => prev.filter(a => a.id !== id))} onPostApp={() => {}} onMarkRead={(id) => setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a))} onCreateJob={handleAdminCreateJob} activeJobs={restaurantJobPosts} onDeleteJob={(id) => setRestaurantJobPosts(prev => prev.filter(p => p.id !== id))} />,
            [AdminPage.StaffManagement]: <AdminStaffManagement users={staffUsers} onBlock={(id, b) => setStaffUsers(prev => prev.map(u => u.id === id ? {...u, isBlocked: b} : u))} onDelete={(id) => setStaffUsers(prev => prev.filter(u => u.id !== id))} onApproveSubscription={handleAdminApproveStaffSub} onMessage={() => {}} />,
            [AdminPage.StaffRequirements]: <AdminStaffRequirements requests={staffRequests} applications={staffApplications} jobPosts={jobPosts} onAddPost={() => {}} onDeletePost={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} onMarkRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? {...r, isRead: true} : r))} onMarkAppRead={() => {}} />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={() => {}} />,
        };
        return <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, staffReqs: staffRequests.filter(r => !r.isRead).length, staffApps: staffApplications.filter(a => !a.isRead).length }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>{adminPages[currentAdminPage]}</AdminLayout>;
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const safeMenu = (Array.isArray(loggedInUser.menu) ? loggedInUser.menu : MOCK_MENU_ITEMS).filter(item => item && item.name && item.category);
        const pages = {
            dashboard: <Dashboard data={dashboardData} orders={orders.filter(o => o.restaurantId === loggedInUser.id)} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: 'Completed'} : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ''} menuItems={safeMenu} onUpdateOrder={() => {}} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />,
            billing: <Billing menuItems={safeMenu} onPrintKOT={(o) => setOrders(prev => [...prev, {...o, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date()}])} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} />,
            online: <OnlineOrders menuItems={safeMenu} onPrintKOT={(o) => setOrders(prev => [...prev, {...o, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date()}])} />,
            menu: <Menu menu={safeMenu} setMenu={(m) => setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? {...u, menu: m} : u))} />,
            qrMenu: <QrMenu menu={safeMenu} setMenu={() => {}} loggedInUser={loggedInUser} />,
            staff: <Staff />,
            staffRequirements: <StaffRequirements jobPosts={jobPosts} onSubmitRequirement={(req, sal) => setStaffRequests(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: req, salary: sal, timestamp: new Date(), isRead: false }])} />,
            inventory: <Inventory />,
            reports: <Reports />,
            social: <SocialMedia user={loggedInUser} />,
            refer: <Referral user={loggedInUser} />,
            settings: <Settings user={loggedInUser} onSave={(upd) => { setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? {...u, ...upd} : u)); setLoggedInUser(prev => prev ? {...prev, ...upd} : null); }} onLogout={handleLogout} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={() => {}} />,
        };
        return <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>{pages[currentPage]}</MainLayout>;
    }
    
    return <div>Refresh...</div>;
}

export default App;
