
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
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, StaffJobPost, StaffRequirementRequest, StaffApplication, MenuItem, RestaurantJobPost } from './types';

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
            if (e.key === 'babuSahabPos_staffApplications') {
                const updated = JSON.parse(e.newValue || '[]').map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }));
                setStaffApplications(updated);
            }
            if (e.key === 'babuSahabPos_jobPosts') {
                const updated = JSON.parse(e.newValue || '[]').map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) }));
                setJobPosts(updated);
            }
            if (e.key === 'babuSahabPos_restaurantJobPosts') {
                const updated = JSON.parse(e.newValue || '[]').map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) }));
                setRestaurantJobPosts(updated);
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
    useEffect(() => { localStorage.setItem('babuSahabPos_alerts', JSON.stringify(alerts)); }, [alerts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_jobPosts', JSON.stringify(jobPosts)); }, [jobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffRequests', JSON.stringify(staffRequests)); }, [staffRequests]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffApplications', JSON.stringify(staffApplications)); }, [staffApplications]);
    useEffect(() => { localStorage.setItem('babuSahabPos_restaurantJobPosts', JSON.stringify(restaurantJobPosts)); }, [restaurantJobPosts]);
    
    useEffect(() => {
        if (authState === 'adminLoggedIn') {
            const totalNotifications = supportTickets.filter(t => t.status === 'Open').length + staffRequests.filter(r => !r.isRead).length + staffApplications.filter(a => !a.isRead).length;
            document.title = totalNotifications > 0 ? `(${totalNotifications}) Admin Panel` : 'Admin Panel';
        } else {
            document.title = 'BaBu SAHAB POS';
        }
    }, [authState, supportTickets, staffRequests, staffApplications]);

    useEffect(() => {
        if (!loggedInUser) { setDashboardData({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 }); return; };
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todaysUserOrders = orders.filter(o => o.restaurantId === loggedInUser.id && new Date(o.timestamp) >= startOfDay);
        const newDashboardData = todaysUserOrders.reduce((acc, order) => {
            if (order.status === 'Completed') {
                if (order.type === 'Online') { acc.onlineSales += order.total; acc.onlineOrders += 1; } 
                else { acc.offlineSales += order.total; acc.offlineOrders += 1; }
            }
            return acc;
        }, { onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
        setDashboardData(newDashboardData);
    }, [orders, loggedInUser]);

    const handleLogin = (email: string, pass: string): any => {
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Approved) { setAuthState('loggedIn'); setLoggedInUser(user); return 'ok'; }
            return user.status.toLowerCase();
        }
        return 'not_found';
    };

    const handleRegister = (newUser: any) => {
        const getFutureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const user: RegisteredUser = { ...newUser, id: Date.now(), status: UserStatus.Pending, lastLogin: 'Never', subscriptionEndDate: getFutureDate(30), address: 'Update in settings', taxRate: 5, deliveryCharge: 30, isDeliveryEnabled: true, isPrinterEnabled: true, menu: MOCK_MENU_ITEMS, referralCode: `refer${newUser.restaurantName.replace(/\s+/g, '').toLowerCase()}`, socialMedia: { autoPostEnabled: false } };
        setRegisteredUsers(prev => [...prev, user]);
    };

    const handleLogout = () => { setAuthState('login'); setLoggedInUser(null); };

    const handleStaffApply = (application: StaffApplication) => {
        const existing = JSON.parse(localStorage.getItem('babuSahabPos_staffApplications') || '[]');
        const updated = [...existing, { ...application, isRead: false }];
        localStorage.setItem('babuSahabPos_staffApplications', JSON.stringify(updated));
        setStaffApplications(updated.map(a => ({...a, timestamp: new Date(a.timestamp)})));
        const audio = document.getElementById('notification-sound') as HTMLAudioElement;
        if (audio) audio.play().catch(() => {});
    };

    const handleAdminCreateJob = (job: Omit<RestaurantJobPost, 'id' | 'timestamp'>) => {
        const newJob: RestaurantJobPost = { ...job, id: Date.now(), timestamp: new Date() };
        const existing = JSON.parse(localStorage.getItem('babuSahabPos_restaurantJobPosts') || '[]');
        const updated = [...existing, newJob];
        localStorage.setItem('babuSahabPos_restaurantJobPosts', JSON.stringify(updated));
        setRestaurantJobPosts(updated.map(p => ({...p, timestamp: new Date(p.timestamp)})));
        alert("Job Posted to Staff Hub!");
    };

    const handlePostStaffApp = (app: StaffApplication) => {
        const updatedApps = staffApplications.map(a => a.id === app.id ? {...a, isRead: true} : a);
        setStaffApplications(updatedApps);
        const newPost: StaffJobPost = { id: app.id, staffName: app.staffName, category: app.category, phone: app.phone, location: app.location, cvDetails: app.cvDetails, timestamp: new Date() };
        const existingPosts = JSON.parse(localStorage.getItem('babuSahabPos_jobPosts') || '[]');
        const updatedPosts = [...existingPosts, newPost];
        setJobPosts(updatedPosts.map(p => ({...p, timestamp: new Date(p.timestamp)})));
        alert(`${app.staffName} posted to live network!`);
    };

    const handleUpdateMenu = (m: MenuItem[]) => {
        if (!loggedInUser) return;
        setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? {...u, menu: m} : u));
        setLoggedInUser(prev => prev ? {...prev, menu: m} : null);
    };

    if (authState === 'staffApply') return <StaffApplicationPage onApply={handleStaffApply} restaurantJobs={restaurantJobPosts} />;
    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;
    
    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} onApproveReject={(id, dec) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected} : u))} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={(id, b) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: b ? UserStatus.Blocked : UserStatus.Approved} : u))} onSendMessage={() => {}} onPasswordChange={() => {}} onUpdateSubscription={() => {}} onUpdateMenu={() => {}} onDeleteUser={() => {}} />,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={(id, msg) => setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, messages: [...t.messages, { sender: 'admin', text: msg, timestamp: new Date() }], status: 'Pending', lastUpdate: new Date() } : t))} onResolve={(id) => setSupportTickets(prev => prev.map(t => t.id === id ? {...t, status: 'Resolved'} : t))} />,
            [AdminPage.StaffHub]: <AdminStaffHub applications={staffApplications} onDeleteApp={(id) => setStaffApplications(prev => prev.filter(a => a.id !== id))} onPostApp={handlePostStaffApp} onMarkRead={(id) => setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a))} onCreateJob={handleAdminCreateJob} activeJobs={restaurantJobPosts} onDeleteJob={(id) => setRestaurantJobPosts(prev => prev.filter(p => p.id !== id))} />,
            [AdminPage.StaffRequirements]: <AdminStaffRequirements requests={staffRequests} applications={staffApplications} jobPosts={jobPosts} onAddPost={(post) => setJobPosts(prev => [...prev, { ...post, id: Date.now(), timestamp: new Date() }])} onDeletePost={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} onMarkRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? {...r, isRead: true} : r))} onMarkAppRead={(id) => setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a))} />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={() => {}} />,
        };
        return <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, staffReqs: staffRequests.filter(r => !r.isRead).length, staffApps: staffApplications.filter(a => !a.isRead).length }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>{adminPages[currentAdminPage]}</AdminLayout>;
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const userOrders = orders.filter(o => o.restaurantId === loggedInUser.id);
        const safeMenu = (Array.isArray(loggedInUser.menu) ? loggedInUser.menu : MOCK_MENU_ITEMS).filter(item => item && item.name && item.category);
        const pages = {
            dashboard: <Dashboard data={dashboardData} orders={userOrders} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: 'Completed'} : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ''} menuItems={safeMenu} onUpdateOrder={(upd) => setOrders(prev => prev.map(o => o.id === upd.id ? upd : o))} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />,
            billing: <Billing menuItems={safeMenu} onPrintKOT={(newOrderData) => setOrders(prev => [...prev, { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() }])} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} />,
            online: <OnlineOrders menuItems={safeMenu} onPrintKOT={(newOrderData) => setOrders(prev => [...prev, { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() }])} />,
            menu: <Menu menu={safeMenu} setMenu={handleUpdateMenu} />,
            qrMenu: <QrMenu menu={safeMenu} setMenu={handleUpdateMenu} loggedInUser={loggedInUser} />,
            staff: <Staff />,
            staffRequirements: <StaffRequirements jobPosts={jobPosts} onSubmitRequirement={(req, sal) => setStaffRequests(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: req, salary: sal, timestamp: new Date(), isRead: false }])} />,
            inventory: <Inventory />,
            reports: <Reports />,
            social: <SocialMedia user={loggedInUser} />,
            refer: <Referral user={loggedInUser} />,
            settings: <Settings user={loggedInUser} onSave={(upd) => { setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? {...u, ...upd} : u)); setLoggedInUser(prev => prev ? {...prev, ...upd} : null); alert("Updated!"); }} onLogout={handleLogout} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={(sub, text) => setSupportTickets(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, subject: sub, messages: [{ sender: 'user', text, timestamp: new Date() }], status: 'Open', lastUpdate: new Date() }])} />,
        };
        return <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>{pages[currentPage]}</MainLayout>;
    }
    
    return <div>Refresh...</div>;
}

export default App;
