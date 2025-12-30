
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
import AdminStaffManagement from './components/admin/AdminStaffManagement';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, StaffJobPost, StaffRequirementRequest, StaffApplication, MenuItem, StaffUser, RestaurantJobPost } from './types';

// --- Market Component ---
const Market: React.FC = () => (
    <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-gray-900 border border-gray-800 p-10 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="w-20 h-20 bg-lemon/10 rounded-full mx-auto flex items-center justify-center text-lemon">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">BaBu SAHAB Merket</h2>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-tight leading-relaxed">Access premium restaurant equipment, groceries, and services at the best industry rates.</p>
            <button 
                onClick={() => window.open('https://merket.babusahab.com', '_blank')}
                className="w-full bg-lemon text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-lemon/20 active:scale-95 transition-all"
            >
                Visit Market Portal
            </button>
        </div>
    </div>
);

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

    // --- State Management ---
    const [orders, setOrders] = useState<OrderStatusItem[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_orders') || '[]').map((o: any) => ({...o, timestamp: new Date(o.timestamp)})) );
    const [dashboardData, setDashboardData] = useState<DashboardData>({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
    
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
        try {
            const storedUsers = localStorage.getItem('babuSahabPos_users');
            if (storedUsers) {
                return JSON.parse(storedUsers).map((u: any) => ({
                    ...u,
                    menu: (Array.isArray(u.menu) && u.menu.length > 0) ? u.menu.map((m: any) => ({
                        ...m,
                        offlinePrice: Number(m.offlinePrice) || 0,
                        onlinePrice: Number(m.onlinePrice) || 0,
                    })) : MOCK_MENU_ITEMS
                }));
            }
        } catch (error) {}
        return JSON.parse(JSON.stringify(MOCK_USERS));
    });

    const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_staffUsers');
        return saved ? JSON.parse(saved).map((u: any) => ({...u, registeredAt: new Date(u.registeredAt)})) : [];
    });

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_tickets') || JSON.stringify(MOCK_TICKETS)).map((t: any) => ({...t, lastUpdate: new Date(t.lastUpdate), messages: t.messages.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))})));
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_alerts') || '[]'));
    
    const [jobPosts, setJobPosts] = useState<StaffJobPost[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_jobPosts') || '[]').map((p: any) => ({...p, timestamp: new Date(p.timestamp)})));
    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_staffRequests') || '[]').map((r: any) => ({...r, timestamp: new Date(r.timestamp)})));
    const [staffApplications, setStaffApplications] = useState<StaffApplication[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_staffApplications');
        return saved ? JSON.parse(saved).map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })) : [];
    });
    const [restaurantJobPosts, setRestaurantJobPosts] = useState<RestaurantJobPost[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_restaurantJobPosts');
        return saved ? JSON.parse(saved).map((p: any) => ({...p, timestamp: new Date(p.timestamp)})) : [];
    });

    // --- Persistence Effects ---
    useEffect(() => { localStorage.setItem('babuSahabPos_staffUsers', JSON.stringify(staffUsers)); }, [staffUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffApplications', JSON.stringify(staffApplications)); }, [staffApplications]);
    useEffect(() => { localStorage.setItem('babuSahabPos_jobPosts', JSON.stringify(jobPosts)); }, [jobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_restaurantJobPosts', JSON.stringify(restaurantJobPosts)); }, [restaurantJobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_alerts', JSON.stringify(alerts)); }, [alerts]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'babuSahabPos_staffUsers') {
                setStaffUsers(JSON.parse(e.newValue || '[]').map((u: any) => ({...u, registeredAt: new Date(u.registeredAt)})));
            }
            if (e.key === 'babuSahabPos_restaurantJobPosts') {
                setRestaurantJobPosts(JSON.parse(e.newValue || '[]').map((p: any) => ({...p, timestamp: new Date(p.timestamp)})));
            }
            if (e.key === 'babuSahabPos_staffApplications') {
                setStaffApplications(JSON.parse(e.newValue || '[]').map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })));
            }
            if (e.key === 'babuSahabPos_alerts') {
                setAlerts(JSON.parse(e.newValue || '[]'));
            }
            if (e.key?.startsWith('babuSahabPos_incomingOrder_') && e.newValue) {
                try {
                    const incomingOrder: OrderStatusItem = JSON.parse(e.newValue);
                    incomingOrder.timestamp = new Date(incomingOrder.timestamp);
                    setOrders(prevOrders => [...prevOrders, incomingOrder]);
                    const audio = document.getElementById('notification-sound') as HTMLAudioElement;
                    if (audio) audio.play().catch(() => {});
                    localStorage.removeItem(e.key);
                } catch (err) {}
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // --- Handlers ---
    const handleLogin = (email: string, pass: string): 'ok' | 'pending' | 'blocked' | 'admin' | 'not_found' | 'deleted' => {
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Approved) { setAuthState('loggedIn'); setLoggedInUser(user); return 'ok'; }
            return user.status === UserStatus.Pending ? 'pending' : user.status === UserStatus.Blocked ? 'blocked' : user.status === UserStatus.Deleted ? 'deleted' : 'blocked';
        }
        return 'not_found';
    };

    const handleStaffUserRegister = (name: string, phone: string) => {
        const newUser: StaffUser = { id: Date.now(), name, phone, status: 'Pending', isBlocked: false, registeredAt: new Date() };
        const updatedStaff = [...staffUsers, newUser];
        setStaffUsers(updatedStaff);
        localStorage.setItem('babuSahabPos_staffUsers', JSON.stringify(updatedStaff));
        return newUser;
    };

    const handleApproveStaff = (id: number, approve: boolean) => {
        setStaffUsers(prev => prev.map(u => u.id === id ? { ...u, status: approve ? 'Approved' : 'Rejected' } : u));
    };

    const handleBlockStaff = (id: number, block: boolean) => {
        setStaffUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked: block } : u));
    };

    const handleDeleteStaff = (id: number) => {
        if (window.confirm("Delete permanently?")) setStaffUsers(prev => prev.filter(u => u.id !== id));
    };

    const handleLogout = () => { setAuthState('login'); setLoggedInUser(null); };

    const handleStaffApply = (application: StaffApplication) => {
        const updatedApps = [...staffApplications, { ...application, isRead: false }];
        setStaffApplications(updatedApps);
        localStorage.setItem('babuSahabPos_staffApplications', JSON.stringify(updatedApps));
    };

    const handleCreateAdminJobPost = (job: Omit<RestaurantJobPost, 'id' | 'timestamp'>) => {
        const newJob: RestaurantJobPost = { ...job, id: Date.now(), timestamp: new Date() };
        const updatedJobs = [...restaurantJobPosts, newJob];
        setRestaurantJobPosts(updatedJobs);
        localStorage.setItem('babuSahabPos_restaurantJobPosts', JSON.stringify(updatedJobs));
    };

    // --- Rendering Logic ---

    if (authState === 'staffApply') return <StaffApplicationPage onApply={handleStaffApply} restaurantJobs={restaurantJobPosts} registeredStaff={staffUsers} onRegisterStaff={handleStaffUserRegister} />;
    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={handleLogin} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={(u, r) => setRegisteredUsers(prev => [...prev, {...u, id: Date.now(), status: UserStatus.Pending, lastLogin: 'Never', subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], address: '', taxRate: 5, deliveryCharge: 30, isDeliveryEnabled: true, menu: MOCK_MENU_ITEMS, referralCode: 'refer'+u.restaurantName.replace(/\s+/g,'').toLowerCase(), referredBy: r||'', socialMedia: {}}])} onNavigateToLogin={() => setAuthState('login')} />;
    
    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} staffUsers={staffUsers} tickets={supportTickets} staffRequests={staffRequests} staffApplications={staffApplications} onApproveReject={(id, dec) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected} : u))} onApproveStaff={handleApproveStaff} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={(id, b) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: b ? UserStatus.Blocked : UserStatus.Approved} : u))} onSendMessage={(id, msg) => setAlerts(prev => [...prev, { id: Date.now(), userId: id, message: msg }])} onPasswordChange={() => {}} onUpdateSubscription={() => {}} onUpdateMenu={() => {}} onDeleteUser={(id) => setRegisteredUsers(prev => prev.filter(u => u.id !== id))} />,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={() => {}} onResolve={() => {}} />,
            [AdminPage.StaffHub]: <AdminStaffHub applications={staffApplications} onDeleteApp={(id) => setStaffApplications(prev => prev.filter(a => a.id !== id))} onPostApp={() => {}} onMarkRead={(id) => setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a))} onCreateJob={handleCreateAdminJobPost} activeJobs={restaurantJobPosts} onDeleteJob={(id) => setRestaurantJobPosts(prev => prev.filter(p => p.id !== id))} />,
            [AdminPage.StaffManagement]: <AdminStaffManagement users={staffUsers} onBlock={handleBlockStaff} onDelete={handleDeleteStaff} onApproveStatus={handleApproveStaff} onMessage={() => {}} />,
            [AdminPage.StaffRequirements]: <AdminStaffRequirements requests={staffRequests} applications={staffApplications} jobPosts={jobPosts} onAddPost={(p) => setJobPosts(prev => [...prev, {...p, id: Date.now(), timestamp: new Date()}])} onDeletePost={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} onMarkRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? {...r, isRead: true} : r))} onMarkAppRead={(id) => setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a))} />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={() => {}} />,
        };
        const totalAlerts = supportTickets.filter(t => t.status === 'Open').length + staffRequests.filter(r => !r.isRead).length + staffApplications.filter(a => !a.isRead).length + staffUsers.filter(u => u.status === 'Pending').length;
        return <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, staffReqs: totalAlerts, staffApps: staffApplications.filter(a => !a.isRead).length }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>{adminPages[currentAdminPage]}</AdminLayout>;
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const pages = {
            dashboard: <Dashboard data={dashboardData} orders={orders.filter(o => o.restaurantId === loggedInUser.id)} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: 'Completed'} : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ''} menuItems={loggedInUser.menu} onUpdateOrder={(o) => setOrders(prev => prev.map(x => x.id === o.id ? o : x))} isPrinterEnabled={true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />,
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
            market: <Market />,
        };
        return <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>{pages[currentPage]}</MainLayout>;
    }
    
    return <div>Refresh...</div>;
}

export default App;
