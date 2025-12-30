
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
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import AdminStaffHub from './components/admin/AdminStaffHub';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, StaffJobPost, StaffRequirementRequest, StaffApplication, MenuItem, StaffUser, RestaurantJobPost, StaffMessage } from './types';

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

    // --- Core Sync State ---
    const [orders, setOrders] = useState<OrderStatusItem[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_orders') || '[]').map((o: any) => ({...o, timestamp: new Date(o.timestamp)})) );
    const [dashboardData, setDashboardData] = useState<DashboardData>({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
    
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
        const stored = localStorage.getItem('babuSahabPos_users');
        return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(MOCK_USERS));
    });

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_tickets') || JSON.stringify(MOCK_TICKETS)).map((t: any) => ({...t, lastUpdate: new Date(t.lastUpdate), messages: t.messages.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))})));
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_alerts') || '[]'));

    // --- Rebuilt Staff Integration State ---
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_staffUsers');
        return saved ? JSON.parse(saved).map((u: any) => ({...u, registeredAt: new Date(u.registeredAt)})) : [];
    });

    const [staffMessages, setStaffMessages] = useState<StaffMessage[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_staffMessages');
        return saved ? JSON.parse(saved).map((m: any) => ({...m, timestamp: new Date(m.timestamp)})) : [];
    });

    const [jobPosts, setJobPosts] = useState<StaffJobPost[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_jobPosts');
        return saved ? JSON.parse(saved).map((p: any) => ({...p, timestamp: new Date(p.timestamp)})) : [];
    });

    const [restaurantJobPosts, setRestaurantJobPosts] = useState<RestaurantJobPost[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_restaurantJobPosts');
        return saved ? JSON.parse(saved).map((p: any) => ({...p, timestamp: new Date(p.timestamp)})) : [];
    });

    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_staffRequests');
        return saved ? JSON.parse(saved).map((r: any) => ({...r, timestamp: new Date(r.timestamp)})) : [];
    });

    const [staffApplications, setStaffApplications] = useState<StaffApplication[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_staffApplications');
        return saved ? JSON.parse(saved).map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })) : [];
    });

    // --- Cross-Tab Real-time Sync ---
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (!e.newValue) return;
            try {
                const parsed = JSON.parse(e.newValue);
                switch (e.key) {
                    case 'babuSahabPos_jobPosts':
                        setJobPosts(parsed.map((p: any) => ({...p, timestamp: new Date(p.timestamp)})));
                        break;
                    case 'babuSahabPos_restaurantJobPosts':
                        setRestaurantJobPosts(parsed.map((p: any) => ({...p, timestamp: new Date(p.timestamp)})));
                        break;
                    case 'babuSahabPos_staffUsers':
                        setStaffUsers(parsed.map((u: any) => ({...u, registeredAt: new Date(u.registeredAt)})));
                        break;
                    case 'babuSahabPos_staffMessages':
                        setStaffMessages(parsed.map((m: any) => ({...m, timestamp: new Date(m.timestamp)})));
                        break;
                }
            } catch (err) {}

            if (e.key?.startsWith('babuSahabPos_incomingOrder_') && e.newValue) {
                const incomingOrder: OrderStatusItem = JSON.parse(e.newValue);
                incomingOrder.timestamp = new Date(incomingOrder.timestamp);
                setOrders(prev => [...prev, incomingOrder]);
                const audio = document.getElementById('notification-sound') as HTMLAudioElement;
                if (audio) audio.play().catch(() => {});
                localStorage.removeItem(e.key);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // --- Persistence ---
    useEffect(() => { localStorage.setItem('babuSahabPos_jobPosts', JSON.stringify(jobPosts)); }, [jobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_restaurantJobPosts', JSON.stringify(restaurantJobPosts)); }, [restaurantJobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffUsers', JSON.stringify(staffUsers)); }, [staffUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffMessages', JSON.stringify(staffMessages)); }, [staffMessages]);
    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffRequests', JSON.stringify(staffRequests)); }, [staffRequests]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffApplications', JSON.stringify(staffApplications)); }, [staffApplications]);

    // --- Staff Logic ---
    const handleStaffRegister = (name: string, phone: string) => {
        const newUser: StaffUser = { id: Date.now(), name, phone, status: 'Approved', isBlocked: false, registeredAt: new Date() };
        setStaffUsers(prev => [...prev, newUser]);
        return newUser;
    };

    const handleStaffApply = (app: Omit<StaffApplication, 'id' | 'timestamp' | 'isRead'>) => {
        const id = Date.now();
        const timestamp = new Date();
        // 1. Instantly Approve Worker Profile for the Feed
        const newPost: StaffJobPost = { ...app, id, timestamp, status: 'Approved' };
        setJobPosts(prev => [...prev, newPost]);
        // 2. Log in Admin Inbox
        setStaffApplications(prev => [...prev, { ...app, id, timestamp, isRead: false }]);
        alert("Your profile is now LIVE! Restaurant owners can contact you.");
    };

    const handleSendMessageToStaff = (phone: string, text: string, senderName: string) => {
        const newMessage: StaffMessage = { id: Date.now(), senderName, recipientPhone: phone, text, timestamp: new Date(), isRead: false };
        setStaffMessages(prev => [...prev, newMessage]);
    };

    const handleCreateRestaurantJob = (job: Omit<RestaurantJobPost, 'id' | 'timestamp'>) => {
        const newJob: RestaurantJobPost = { ...job, id: Date.now(), timestamp: new Date() };
        setRestaurantJobPosts(prev => [...prev, newJob]);
    };

    // --- Auth Logic ---
    const handleLogin = (email: string, pass: string) => {
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Approved) { setAuthState('loggedIn'); setLoggedInUser(user); return 'ok'; }
            return user.status === UserStatus.Pending ? 'pending' : 'blocked';
        }
        return 'not_found';
    };

    // --- Render ---
    if (authState === 'staffApply') return (
        <StaffApplicationPage 
            onApply={handleStaffApply} 
            restaurantJobs={restaurantJobPosts} 
            registeredStaff={staffUsers} 
            onRegisterStaff={handleStaffRegister} 
            messages={staffMessages}
            onMarkMessageRead={(id) => setStaffMessages(prev => prev.map(m => m.id === id ? {...m, isRead: true} : m))}
        />
    );

    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} tickets={supportTickets} staffRequests={staffRequests} staffApplications={staffApplications} jobPosts={jobPosts} onApproveReject={(id, dec) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected} : u))} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={(id, b) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: b ? UserStatus.Blocked : UserStatus.Approved} : u))} onSendMessage={(id, msg) => setAlerts(prev => [...prev, { id: Date.now(), userId: id, message: msg }])} onPasswordChange={(id, p) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, password: p} : u))} onUpdateSubscription={(id, d) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, subscriptionEndDate: d} : u))} onUpdateMenu={(id, m) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, menu: m} : u))} onDeleteUser={(id) => setRegisteredUsers(prev => prev.filter(u => u.id !== id))} />,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={(id, m) => setSupportTickets(prev => prev.map(t => t.id === id ? {...t, messages: [...t.messages, {sender: 'admin', text: m, timestamp: new Date()}], lastUpdate: new Date()} : t))} onResolve={(id) => setSupportTickets(prev => prev.map(t => t.id === id ? {...t, status: 'Resolved'} : t))} />,
            [AdminPage.StaffHub]: (
                <AdminStaffHub 
                    jobPosts={jobPosts} 
                    onApprove={(id) => setJobPosts(prev => prev.map(p => p.id === id ? {...p, status: 'Approved'} : p))} 
                    onDelete={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} 
                    onMessage={(phone, text) => handleSendMessageToStaff(phone, text, "Administrator")} 
                    onCreateRestaurantJob={handleCreateRestaurantJob}
                    activeRestaurantJobs={restaurantJobPosts}
                    onDeleteRestaurantJob={(id) => setRestaurantJobPosts(prev => prev.filter(p => p.id !== id))}
                />
            ),
            [AdminPage.StaffRequirements]: <AdminStaffRequirements requests={staffRequests} applications={staffApplications} jobPosts={jobPosts.filter(p => p.status === 'Approved')} onAddPost={(p) => setJobPosts(prev => [...prev, {...p, id: Date.now(), timestamp: new Date(), status: 'Approved'}])} onDeletePost={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} onMarkRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? {...r, isRead: true} : r))} onMarkAppRead={(id) => setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a))} />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={(id, d) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, subscriptionEndDate: d} : u))} />,
        };
        return <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, staffReqs: staffRequests.filter(r => !r.isRead).length + staffApplications.filter(a => !a.isRead).length }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={() => setAuthState('login')}>{adminPages[currentAdminPage]}</AdminLayout>;
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const pages = {
            dashboard: <Dashboard data={dashboardData} orders={orders.filter(o => o.restaurantId === loggedInUser.id)} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: 'Completed'} : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ''} menuItems={loggedInUser.menu} onUpdateOrder={(o) => setOrders(prev => prev.map(x => x.id === o.id ? o : x))} isPrinterEnabled={true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />,
            billing: <Billing menuItems={loggedInUser.menu} onPrintKOT={(o) => setOrders(prev => [...prev, {...o, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date()}])} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={true} />,
            online: <OnlineOrders menuItems={loggedInUser.menu} onPrintKOT={(o) => setOrders(prev => [...prev, {...o, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date()}])} />,
            menu: <Menu menu={loggedInUser.menu} setMenu={(m) => setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? {...u, menu: m} : u))} />,
            qrMenu: <QrMenu menu={loggedInUser.menu} setMenu={() => {}} loggedInUser={loggedInUser} />,
            staff: <Staff />,
            staffRequirements: <StaffRequirements jobPosts={jobPosts.filter(p => p.status === 'Approved')} onSubmitRequirement={(r, s) => setStaffRequests(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: r, salary: s, timestamp: new Date(), isRead: false }])} onMessageStaff={(phone, text) => handleSendMessageToStaff(phone, text, loggedInUser.restaurantName)} />,
            inventory: <Inventory />,
            reports: <Reports />,
            social: <SocialMedia user={loggedInUser} />,
            refer: <Referral user={loggedInUser} />,
            settings: <Settings user={loggedInUser} onSave={(upd) => setLoggedInUser(prev => prev ? {...prev, ...upd} : null)} onLogout={() => setAuthState('login')} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={() => {}} />,
        };
        return <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={() => setAuthState('login')} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>{pages[currentPage]}</MainLayout>;
    }
    
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={(u) => setRegisteredUsers(prev => [...prev, {...u, id: Date.now(), status: UserStatus.Pending, lastLogin: 'Never', subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], address: '', taxRate: 5, deliveryCharge: 30, isDeliveryEnabled: true, menu: MOCK_MENU_ITEMS, referralCode: 'refer'+u.restaurantName.replace(/\s+/g,'').toLowerCase(), referredBy: '', socialMedia: {}}])} onNavigateToLogin={() => setAuthState('login')} />;
    if (authState === 'customer') return <CustomerOrderPage />;

    return <div>Something went wrong. Please refresh.</div>;
}

export default App;
