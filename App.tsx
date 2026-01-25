
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
import HelpAndSupport from './components/HelpAndSupport';
import CustomerOrderPage from './components/CustomerOrderPage'; 
import Market from './components/Market';
import StaffRequirements from './components/StaffRequirements';
import SocialMedia from './components/SocialMedia';
import Referral from './components/Referral';
import Subscription from './components/Subscription';
import CustomerOffer from './components/CustomerOffer';
import Payment from './components/Payment';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportTickets from './components/admin/SupportTickets';
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import MarketManagement from './components/admin/MarketManagement';
import AdminStaffHub from './components/admin/AdminStaffHub';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';
import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, MenuItem, MarketplaceProduct, MarketplaceOrder, StaffJobPost, RestaurantJobPost, StaffRequirementRequest, PaymentMember, PaymentRecord } from './types';

// Public Relay for Cross-Device Syncing (Anonymous KV Store)
const CLOUD_SYNC_URL = "https://kvdb.io/59m7f7eK6Z6F6X9u6G6G6/orders_"; 

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer';
    
    const isCustomerRoute = () => window.location.hash.includes('customer-order');

    // --- SESSION PERSISTENCE LOGIC ---
    const [authState, setAuthState] = useState<AuthState>(() => {
        if (isCustomerRoute()) return 'customer';
        const savedSession = localStorage.getItem('babuSahabPos_session');
        if (savedSession === 'adminLoggedIn') return 'adminLoggedIn';
        if (savedSession === 'loggedIn') return 'loggedIn';
        return 'login';
    });

    const [loggedInUser, setLoggedInUser] = useState<RegisteredUser | null>(() => {
        const savedUser = localStorage.getItem('babuSahabPos_activeUser');
        if (savedUser) {
            try { return JSON.parse(savedUser); } catch (e) { return null; }
        }
        return null;
    });

    useEffect(() => {
        if (authState !== 'customer' && authState !== 'register') {
            localStorage.setItem('babuSahabPos_session', authState);
        }
        if (loggedInUser) {
            localStorage.setItem('babuSahabPos_activeUser', JSON.stringify(loggedInUser));
        } else {
            localStorage.removeItem('babuSahabPos_activeUser');
        }
    }, [authState, loggedInUser]);

    useEffect(() => {
        const handleHashChange = () => {
            if (isCustomerRoute()) setAuthState('customer');
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

    const getSafeData = (key: string, defaultValue: any) => {
        try {
            const saved = localStorage.getItem(key);
            if (!saved || saved === "undefined") return defaultValue;
            const data = JSON.parse(saved);
            if (key === 'babuSahabPos_orders') {
                return data.map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) }));
            }
            return data;
        } catch (e) {
            return defaultValue;
        }
    };

    const [orders, setOrders] = useState<OrderStatusItem[]>(() => getSafeData('babuSahabPos_orders', []));
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => getSafeData('babuSahabPos_users', MOCK_USERS));
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => getSafeData('babuSahabPos_tickets', MOCK_TICKETS));
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => getSafeData('babuSahabPos_alerts', []));
    const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>(() => getSafeData('babuSahabPos_marketProducts', []));
    const [marketOrders, setMarketOrders] = useState<MarketplaceOrder[]>(() => getSafeData('babuSahabPos_marketOrders', []));
    const [staffJobPosts, setStaffJobPosts] = useState<StaffJobPost[]>(() => getSafeData('babuSahabPos_staffJobPosts', []));
    const [restaurantJobs, setRestaurantJobs] = useState<RestaurantJobPost[]>(() => getSafeData('babuSahabPos_restaurantJobs', []));
    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>(() => getSafeData('babuSahabPos_staffRequests', []));
    const [paymentMembers, setPaymentMembers] = useState<PaymentMember[]>(() => getSafeData('babuSahabPos_paymentMembers', []));
    const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(() => getSafeData('babuSahabPos_paymentRecords', []));

    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('babuSahabPos_alerts', JSON.stringify(alerts)); }, [alerts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_marketProducts', JSON.stringify(marketplaceProducts)); }, [marketplaceProducts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_marketOrders', JSON.stringify(marketOrders)); }, [marketOrders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffJobPosts', JSON.stringify(staffJobPosts)); }, [staffJobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_restaurantJobs', JSON.stringify(restaurantJobs)); }, [restaurantJobs]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffRequests', JSON.stringify(staffRequests)); }, [staffRequests]);
    useEffect(() => { localStorage.setItem('babuSahabPos_paymentMembers', JSON.stringify(paymentMembers)); }, [paymentMembers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_paymentRecords', JSON.stringify(paymentRecords)); }, [paymentRecords]);

    // --- HELPER FOR 4 AM RESET LOGIC ---
    const getBusinessDateString = (date: Date) => {
        const d = new Date(date.getTime());
        // Subtract 4 hours to align with 4 AM reset
        d.setHours(d.getHours() - 4);
        return d.toDateString();
    };

    // --- DAILY STATS CALCULATION FOR DASHBOARD ---
    const getTodaysDashboardData = (): DashboardData => {
        const currentBusinessDay = getBusinessDateString(new Date());
        const restaurantOrders = orders.filter(o => o.restaurantId === loggedInUser?.id && o.status === 'Completed');
        
        const todaysOrders = restaurantOrders.filter(o => 
            getBusinessDateString(new Date(o.timestamp)) === currentBusinessDay
        );

        return {
            onlineSales: todaysOrders.filter(o => o.type === 'Online').reduce((sum, o) => sum + o.total, 0),
            offlineSales: todaysOrders.filter(o => o.type === 'Offline').reduce((sum, o) => sum + o.total, 0),
            onlineOrders: todaysOrders.filter(o => o.type === 'Online').length,
            offlineOrders: todaysOrders.filter(o => o.type === 'Offline').length
        };
    };

    // --- GLOBAL CLOUD SYNC ENGINE ---
    useEffect(() => {
        if (authState !== 'loggedIn' || !loggedInUser) return;

        const pollCloudOrders = async () => {
            try {
                const syncKey = `${loggedInUser.id}_${loggedInUser.phone}`;
                const response = await fetch(`${CLOUD_SYNC_URL}${syncKey}`);
                if (response.ok) {
                    const cloudData = await response.json();
                    if (Array.isArray(cloudData) && cloudData.length > 0) {
                        const newOrders = cloudData.map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) }));
                        setOrders(prev => {
                            const existingIds = new Set(prev.map(o => o.id));
                            const uniqueNew = newOrders.filter((o: OrderStatusItem) => !existingIds.has(o.id));
                            if (uniqueNew.length === 0) return prev;
                            const audio = document.getElementById('notification-sound') as HTMLAudioElement;
                            if (audio) audio.play().catch(() => {});
                            return [...prev, ...uniqueNew];
                        });
                        await fetch(`${CLOUD_SYNC_URL}${syncKey}`, {
                            method: 'PUT',
                            body: JSON.stringify([]),
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
            } catch (error) { console.warn("Cloud Sync Polling Error:", error); }
        };
        const syncInterval = setInterval(pollCloudOrders, 5000);
        return () => clearInterval(syncInterval);
    }, [authState, loggedInUser]);

    const handleLogin = (email: string, pass: string) => {
        const trimmedEmail = email.trim().toLowerCase();
        if (trimmedEmail === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        const user = registeredUsers.find(u => u.email.trim().toLowerCase() === trimmedEmail && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Blocked) return 'blocked';
            if (user.status === UserStatus.Deleted) return 'deleted';
            setAuthState('loggedIn'); setLoggedInUser(user); return 'ok'; 
        }
        return 'not_found';
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            setAuthState('login'); setLoggedInUser(null);
            localStorage.removeItem('babuSahabPos_session');
            localStorage.removeItem('babuSahabPos_activeUser');
        }
    };

    const handleRegister = (newUser: any) => {
        const user: RegisteredUser = { 
            ...newUser, id: Date.now(), status: UserStatus.Approved, lastLogin: 'Just Now', 
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            menu: MOCK_MENU_ITEMS, taxRate: 5, deliveryCharge: 30, isDeliveryEnabled: true, isPrinterEnabled: true, 
            referralCode: 'REF' + Math.random().toString(36).substring(7).toUpperCase() 
        };
        setRegisteredUsers(prev => [...prev, user]);
    };

    const handleUpdateMenu = (userId: number, menu: MenuItem[]) => {
        setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, menu } : u));
        if (loggedInUser?.id === userId) setLoggedInUser(prev => prev ? { ...prev, menu } : null);
    };

    if (authState === 'customer' || isCustomerRoute()) return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {authState === 'adminLoggedIn' ? (
                <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, marketOrders: marketOrders.filter(o => o.status === 'Pending').length }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>
                    {currentAdminPage === AdminPage.Dashboard && <AdminDashboard users={registeredUsers} tickets={supportTickets} marketOrders={marketOrders} onApproveReject={(id, dec) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected } : u))} onApproveMarketOrder={(o) => setMarketOrders(prev => prev.map(mo => mo.id === o.id ? { ...mo, status: 'Accepted' } : mo))} />}
                    {currentAdminPage === AdminPage.UserManagement && <UserManagement users={registeredUsers} onBlockUser={(id, b) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, status: b ? UserStatus.Blocked : UserStatus.Approved } : u))} onSendMessage={(id, m) => setAlerts(prev => [...prev, { id: Date.now(), userId: id, message: m }])} onPasswordChange={(id, p) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, password: p } : u))} onUpdateSubscription={(id, d) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, subscriptionEndDate: d } : u))} onUpdateMenu={handleUpdateMenu} onDeleteUser={(id) => setRegisteredUsers(prev => prev.filter(u => u.id !== id))} />}
                    {currentAdminPage === AdminPage.SupportTickets && <SupportTickets tickets={supportTickets} onReply={(id, m) => setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, messages: [...t.messages, { sender: 'admin', text: m, timestamp: new Date() }], status: 'Pending', lastUpdate: new Date() } : t))} onResolve={(id) => setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved', lastUpdate: new Date() } : t))} onDelete={(id) => setSupportTickets(prev => prev.filter(t => t.id !== id))} />}
                    {currentAdminPage === AdminPage.SubscriptionRenewal && <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={(id, d) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, subscriptionEndDate: d } : u))} />}
                    {currentAdminPage === AdminPage.UserOrders && <MarketManagement products={marketplaceProducts} orders={marketOrders} users={registeredUsers} onAddProduct={(n, p, d, i) => setMarketplaceProducts(prev => [...prev, { id: Date.now(), name: n, price: p, description: d, image: i }])} onDeleteProduct={(id) => setMarketplaceProducts(prev => prev.filter(p => p.id !== id))} onMessageUser={(id, m) => setAlerts(prev => [...prev, { id: Date.now(), userId: id, message: m }])} onUpdateStatus={(orderId, status) => setMarketOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))} onDeleteOrder={(id) => setMarketOrders(prev => prev.filter(o => o.id !== id))} />}
                    {currentAdminPage === AdminPage.StaffHub && <AdminStaffHub jobPosts={staffJobPosts} onApprove={(id) => setStaffJobPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved' } : p))} onDelete={(id) => setStaffJobPosts(prev => prev.filter(p => p.id !== id))} onMessage={(ph, txt) => setAlerts(prev => [...prev, { id: Date.now(), userId: 'all', message: `To ${ph}: ${txt}` }])} onCreateRestaurantJob={(j) => setRestaurantJobs(prev => [...prev, { ...j, id: Date.now(), timestamp: new Date() }])} activeRestaurantJobs={restaurantJobs} onDeleteRestaurantJob={(id) => setRestaurantJobs(prev => prev.filter(j => j.id !== id))} staffRequests={staffRequests} onMarkRequestRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r))} />}
                </AdminLayout>
            ) : (
                loggedInUser && (
                <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>
                    {currentPage === 'dashboard' && <Dashboard data={getTodaysDashboardData()} orders={orders.filter(o => o.restaurantId === loggedInUser.id)} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Completed' } : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ""} menuItems={loggedInUser.menu} onUpdateOrder={(o) => setOrders(prev => prev.map(p => p.id === o.id ? o : p))} isPrinterEnabled={loggedInUser.isPrinterEnabled || true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />}
                    {currentPage === 'billing' && <Billing menuItems={loggedInUser.menu} onPrintKOT={(newOrderData) => setOrders(prev => [...prev, { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() }])} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled || true} onToggleStock={(id) => handleUpdateMenu(loggedInUser.id, loggedInUser.menu.map(m => m.id === id ? { ...m, inStock: !m.inStock } : m))} />}
                    {currentPage === 'online' && <OnlineOrders menuItems={loggedInUser.menu} onPrintKOT={(newOrderData) => setOrders(prev => [...prev, { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() }])} />}
                    {currentPage === 'menu' && <Menu menu={loggedInUser.menu} setMenu={(m) => handleUpdateMenu(loggedInUser.id, m)} />}
                    {currentPage === 'inventory' && <Inventory />}
                    {currentPage === 'staff' && <Staff />}
                    {currentPage === 'staffRequirements' && <StaffRequirements jobPosts={staffJobPosts.filter(p => p.status === 'Approved')} activeRestaurantJobs={restaurantJobs} onSubmitRequirement={(req, salary) => setStaffRequests(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: req, salary, timestamp: new Date(), isRead: false }])} onMessageStaff={() => {}} />}
                    {currentPage === 'market' && <Market products={marketplaceProducts} onPlaceOrder={(pId, pN, pr, q) => setMarketOrders(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, productId: pId, productName: pN, price: pr, quantity: q, status: 'Pending', timestamp: new Date() }])} user={loggedInUser} />}
                    {currentPage === 'reports' && <Reports orders={orders.filter(o => o.restaurantId === loggedInUser.id)} />}
                    {currentPage === 'social' && <SocialMedia user={loggedInUser} />}
                    {currentPage === 'refer' && <Referral user={loggedInUser} />}
                    {currentPage === 'subscription' && <Subscription user={loggedInUser} onRequestRenewal={() => { setSupportTickets(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, subject: 'Renewal Request', messages: [{ sender: 'user', text: 'Renewal Request for ' + loggedInUser.restaurantName, timestamp: new Date() }], status: 'Open', lastUpdate: new Date() }]); setCurrentPage('help'); }} />}
                    {currentPage === 'customerOffer' && <CustomerOffer orders={orders.filter(o => o.restaurantId === loggedInUser.id)} restaurantName={loggedInUser.restaurantName} />}
                    {currentPage === 'payment' && <Payment members={paymentMembers.filter(m => m.userId === loggedInUser.id)} records={paymentRecords.filter(r => paymentMembers.find(m => m.id === r.memberId && m.userId === loggedInUser.id))} onAddMember={(n, c, t) => setPaymentMembers(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, name: n, category: c, type: t }])} onRecordPayment={(mid, p, d, dt) => setPaymentRecords(prev => [...prev, { id: Date.now(), memberId: mid, paid: p, due: d, date: dt }])} onUpdateRecord={(id, p, d, dt) => setPaymentRecords(prev => prev.map(r => r.id === id ? { ...r, paid: p, due: d, date: dt } : r))} onDeleteRecord={(id) => setPaymentRecords(prev => prev.filter(r => r.id !== id))} onDeleteMember={(id) => { setPaymentMembers(prev => prev.filter(m => m.id !== id)); setPaymentRecords(prev => prev.filter(r => r.memberId !== id)); }} />}
                    {currentPage === 'settings' && <Settings user={loggedInUser} onSave={(updates) => setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? { ...u, ...updates } : u))} onLogout={handleLogout} />}
                    {currentPage === 'qrMenu' && <QrMenu menu={loggedInUser.menu} setMenu={(m) => handleUpdateMenu(loggedInUser.id, m)} loggedInUser={loggedInUser} />}
                    {currentPage === 'help' && <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={(s, m, a, at) => setSupportTickets(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, subject: s, messages: [{ sender: 'user', text: m, timestamp: new Date(), attachment: a, attachmentType: at }], status: 'Open', lastUpdate: new Date() }])} onReplyToTicket={(tid, msg) => setSupportTickets(prev => prev.map(t => t.id === tid ? { ...t, status: 'Open', lastUpdate: new Date(), messages: [...t.messages, { sender: 'user', text: msg, timestamp: new Date() }] } : t))} />}
                </MainLayout>
                )
            )}
        </div>
    );
}

export default App;
