
import React, { useState, useEffect, useRef } from 'react';
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

const CLOUD_BASE_URL = "https://kvdb.io/59m7f7eK6Z6F6X9u6G6G6/";
// V8 Sync Cluster - Ensuring absolute data integrity
const USER_SYNC_KEY = "global_registered_users_v8"; 
const REG_RELAY_KEY = "registration_relay_v8";
const TICKET_SYNC_KEY = "global_support_tickets_v8";
const MARKET_ORDER_SYNC_KEY = "global_market_orders_v8";

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer';
    
    const isCustomerRoute = () => window.location.hash.includes('customer-order');
    const isSyncing = useRef(false);
    const [lastSyncTime, setLastSyncTime] = useState<string>("Never");
    const [syncError, setSyncError] = useState<boolean>(false);

    const getSafeData = (key: string, defaultValue: any) => {
        try {
            const saved = localStorage.getItem(key);
            if (!saved || saved === "undefined" || saved === "[]") return defaultValue;
            const data = JSON.parse(saved);
            if (key === 'babuSahabPos_orders') {
                return data.map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) }));
            }
            return data;
        } catch (e) { return defaultValue; }
    };

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

    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

    useEffect(() => {
        if (authState !== 'customer' && authState !== 'register') localStorage.setItem('babuSahabPos_session', authState);
        if (loggedInUser) localStorage.setItem('babuSahabPos_activeUser', JSON.stringify(loggedInUser));
        else localStorage.removeItem('babuSahabPos_activeUser');
    }, [authState, loggedInUser]);

    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('babuSahabPos_marketOrders', JSON.stringify(marketOrders)); }, [marketOrders]);

    // Generic Cloud Pusher
    const pushToCloud = async (key: string, data: any) => {
        try {
            await fetch(`${CLOUD_BASE_URL}${key}`, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            return true;
        } catch (e) { return false; }
    };

    // --- REFACTORED MASTER SYNC ENGINE (BIDIRECTIONAL) ---
    useEffect(() => {
        const syncEverything = async () => {
            if (isSyncing.current) return;
            isSyncing.current = true;
            try {
                // 1. SYNC USERS & REGISTRATION RELAY
                const userRes = await fetch(`${CLOUD_BASE_URL}${USER_SYNC_KEY}`);
                let cloudUsers: RegisteredUser[] = userRes.ok ? await userRes.json() : [];
                if (!Array.isArray(cloudUsers)) cloudUsers = [];

                const relayRes = await fetch(`${CLOUD_BASE_URL}${REG_RELAY_KEY}`);
                let relayUsers: RegisteredUser[] = relayRes.ok ? await relayRes.json() : [];
                if (!Array.isArray(relayUsers)) relayUsers = [];

                const userMap = new Map();
                cloudUsers.forEach(u => userMap.set(u.id, u));
                relayUsers.forEach(u => { if (!userMap.has(u.id)) userMap.set(u.id, u); });
                registeredUsers.forEach(u => { if (!userMap.has(u.id)) userMap.set(u.id, u); });
                
                const mergedUsers = Array.from(userMap.values()) as RegisteredUser[];
                if (JSON.stringify(registeredUsers) !== JSON.stringify(mergedUsers)) {
                    setRegisteredUsers(mergedUsers);
                    if (authState === 'adminLoggedIn') {
                        await pushToCloud(USER_SYNC_KEY, mergedUsers);
                        if (relayUsers.length > 0) await pushToCloud(REG_RELAY_KEY, []);
                    }
                }

                // 2. SYNC SUPPORT TICKETS (User messages to Admin)
                const ticketRes = await fetch(`${CLOUD_BASE_URL}${TICKET_SYNC_KEY}`);
                let cloudTickets: SupportTicket[] = ticketRes.ok ? await ticketRes.json() : [];
                if (!Array.isArray(cloudTickets)) cloudTickets = [];

                const ticketMap = new Map();
                cloudTickets.forEach(t => ticketMap.set(t.id, t));
                supportTickets.forEach(t => ticketMap.set(t.id, t));
                const mergedTickets = Array.from(ticketMap.values()) as SupportTicket[];
                
                if (JSON.stringify(supportTickets) !== JSON.stringify(mergedTickets)) {
                    setSupportTickets(mergedTickets);
                    // Both User and Admin can push tickets to cloud to ensure sync
                    await pushToCloud(TICKET_SYNC_KEY, mergedTickets);
                }

                // 3. SYNC MARKET ORDERS
                const marketRes = await fetch(`${CLOUD_BASE_URL}${MARKET_ORDER_SYNC_KEY}`);
                let cloudMarketOrders: MarketplaceOrder[] = marketRes.ok ? await marketRes.json() : [];
                if (!Array.isArray(cloudMarketOrders)) cloudMarketOrders = [];

                const marketMap = new Map();
                cloudMarketOrders.forEach(o => marketMap.set(o.id, o));
                marketOrders.forEach(o => marketMap.set(o.id, o));
                const mergedMarketOrders = Array.from(marketMap.values()) as MarketplaceOrder[];

                if (JSON.stringify(marketOrders) !== JSON.stringify(mergedMarketOrders)) {
                    setMarketOrders(mergedMarketOrders);
                    await pushToCloud(MARKET_ORDER_SYNC_KEY, mergedMarketOrders);
                }

                // 4. Update the Logged-In User session if Admin changed something
                if (loggedInUser) {
                    const updatedMe = mergedUsers.find(u => u.id === loggedInUser.id);
                    if (updatedMe) {
                        const localP = JSON.stringify({ ...loggedInUser, lastLogin: '' });
                        const cloudP = JSON.stringify({ ...updatedMe, lastLogin: '' });
                        if (localP !== cloudP) setLoggedInUser(updatedMe);
                    }
                }

                setSyncError(false);
                setLastSyncTime(new Date().toLocaleTimeString());
            } catch (e) {
                console.error("Master Heartbeat Failed", e);
                setSyncError(true);
            } finally {
                isSyncing.current = false;
            }
        };

        syncEverything();
        const interval = setInterval(syncEverything, authState === 'adminLoggedIn' ? 6000 : 12000); 
        return () => clearInterval(interval);
    }, [authState, registeredUsers.length, supportTickets.length, marketOrders.length, loggedInUser?.id]);

    const handleLogin = (identifier: string, pass: string) => {
        const input = identifier.trim().toLowerCase();
        if (input === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        
        const user = registeredUsers.find(u => 
            (u.email.trim().toLowerCase() === input || u.phone.trim() === input) && 
            u.password === pass
        );

        if (user) {
            if (user.status === UserStatus.Blocked) return 'blocked';
            if (user.status === UserStatus.Deleted) return 'deleted';
            setAuthState('loggedIn'); setLoggedInUser(user); return 'ok'; 
        }
        return 'not_found';
    };

    const handleRegister = async (newUser: any, status: UserStatus = UserStatus.Approved) => {
        const user: RegisteredUser = { 
            ...newUser, id: Date.now(), status, lastLogin: 'Just Now', 
            subscriptionEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            menu: MOCK_MENU_ITEMS, taxRate: 5, deliveryCharge: 30, isDeliveryEnabled: true, isPrinterEnabled: true, 
            referralCode: 'REF' + Math.random().toString(36).substring(7).toUpperCase(), address: 'Setup Required'
        };

        // Instant Relay Push
        try {
            const res = await fetch(`${CLOUD_BASE_URL}${REG_RELAY_KEY}`);
            let currentRelay = res.ok ? await res.json() : [];
            if (!Array.isArray(currentRelay)) currentRelay = [];
            currentRelay.push(user);
            await pushToCloud(REG_RELAY_KEY, currentRelay);
        } catch (e) {}

        setRegisteredUsers(prev => [...prev, user]);
    };

    const handleLogout = () => {
        if (window.confirm('Logout?')) {
            setAuthState('login'); setLoggedInUser(null);
            localStorage.removeItem('babuSahabPos_session');
            localStorage.removeItem('babuSahabPos_activeUser');
        }
    };

    const getBusinessDateString = (date: Date) => {
        const d = new Date(date.getTime());
        d.setHours(d.getHours() - 4);
        return d.toDateString();
    };

    const getTodaysDashboardData = (): DashboardData => {
        const today = getBusinessDateString(new Date());
        const todaysOrders = orders.filter(o => o.restaurantId === loggedInUser?.id && o.status === 'Completed' && getBusinessDateString(new Date(o.timestamp)) === today);
        return {
            onlineSales: todaysOrders.filter(o => o.type === 'Online').reduce((s, o) => s + o.total, 0),
            offlineSales: todaysOrders.filter(o => o.type === 'Offline').reduce((s, o) => s + o.total, 0),
            onlineOrders: todaysOrders.filter(o => o.type === 'Online').length,
            offlineOrders: todaysOrders.filter(o => o.type === 'Offline').length
        };
    };

    if (authState === 'customer' || isCustomerRoute()) return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {authState === 'adminLoggedIn' ? (
                <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, marketOrders: marketOrders.filter(o => o.status === 'Pending').length }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>
                    {currentAdminPage === AdminPage.Dashboard && <AdminDashboard users={registeredUsers} tickets={supportTickets} marketOrders={marketOrders} onApproveReject={(id, dec) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onApproveMarketOrder={(o) => setMarketOrders(prev => prev.map(mo => mo.id === o.id ? { ...mo, status: 'Accepted' } : mo))} syncStatus={{ time: lastSyncTime, error: syncError }} onDeepRecovery={() => {}} />}
                    {currentAdminPage === AdminPage.UserManagement && <UserManagement users={registeredUsers} onBlockUser={(id, b) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, status: b ? UserStatus.Blocked : UserStatus.Approved } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onSendMessage={(id, m) => setAlerts(prev => [...prev, { id: Date.now(), userId: id, message: m }])} onPasswordChange={(id, p) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, password: p } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onUpdateSubscription={(id, d) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, subscriptionEndDate: d } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onUpdateMenu={(id, m) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, menu: m } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onUpdateUserInfo={(id, name, email, phone, pass, rName) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, name, email, phone, password: pass || u.password, restaurantName: rName || u.restaurantName } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onDeleteUser={(id) => { const updated = registeredUsers.filter(u => u.id !== id); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onAddUser={(u) => handleRegister(u, UserStatus.Approved)} />}
                    {currentAdminPage === AdminPage.SupportTickets && <SupportTickets tickets={supportTickets} onReply={(id, m) => { const updated = supportTickets.map(t => t.id === id ? { ...t, messages: [...t.messages, { sender: 'admin', text: m, timestamp: new Date() }], status: 'Pending', lastUpdate: new Date() } : t); setSupportTickets(updated); pushToCloud(TICKET_SYNC_KEY, updated); }} onResolve={(id) => { const updated = supportTickets.map(t => t.id === id ? { ...t, status: 'Resolved', lastUpdate: new Date() } : t); setSupportTickets(updated); pushToCloud(TICKET_SYNC_KEY, updated); }} onDelete={(id) => { const updated = supportTickets.filter(t => t.id !== id); setSupportTickets(updated); pushToCloud(TICKET_SYNC_KEY, updated); }} />}
                    {currentAdminPage === AdminPage.SubscriptionRenewal && <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={(id, d) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, subscriptionEndDate: d } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} />}
                    {currentAdminPage === AdminPage.UserOrders && <MarketManagement products={marketplaceProducts} orders={marketOrders} users={registeredUsers} onAddProduct={(n, p, d, i) => setMarketplaceProducts(prev => [...prev, { id: Date.now(), name: n, price: p, description: d, image: i }])} onDeleteProduct={(id) => setMarketplaceProducts(prev => prev.filter(p => p.id !== id))} onMessageUser={(id, m) => setAlerts(prev => [...prev, { id: Date.now(), userId: id, message: m }])} onUpdateStatus={(orderId, status) => { const updated = marketOrders.map(o => o.id === orderId ? { ...o, status } : o); setMarketOrders(updated); pushToCloud(MARKET_ORDER_SYNC_KEY, updated); }} onDeleteOrder={(id) => { const updated = marketOrders.filter(o => o.id !== id); setMarketOrders(updated); pushToCloud(MARKET_ORDER_SYNC_KEY, updated); }} />}
                    {currentAdminPage === AdminPage.StaffHub && <AdminStaffHub jobPosts={staffJobPosts} onApprove={(id) => setStaffJobPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved' } : p))} onDelete={(id) => setStaffJobPosts(prev => prev.filter(p => p.id !== id))} onMessage={(ph, txt) => setAlerts(prev => [...prev, { id: Date.now(), userId: 'all', message: `To ${ph}: ${txt}` }])} onCreateRestaurantJob={(j) => setRestaurantJobs(prev => [...prev, { ...j, id: Date.now(), timestamp: new Date() }])} activeRestaurantJobs={restaurantJobs} onDeleteRestaurantJob={(id) => setRestaurantJobs(prev => prev.filter(j => j.id !== id))} staffRequests={staffRequests} onMarkRequestRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r))} />}
                </AdminLayout>
            ) : (
                loggedInUser && (
                <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>
                    {currentPage === 'dashboard' && <Dashboard data={getTodaysDashboardData()} orders={orders.filter(o => o.restaurantId === loggedInUser.id)} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Completed' } : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ""} menuItems={loggedInUser.menu} onUpdateOrder={(o) => setOrders(prev => prev.map(p => p.id === o.id ? o : p))} isPrinterEnabled={loggedInUser.isPrinterEnabled || true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />}
                    {currentPage === 'billing' && <Billing menuItems={loggedInUser.menu} onPrintKOT={(newOrderData) => setOrders(prev => [...prev, { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() }])} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled || true} onToggleStock={(id) => { const updatedMenu = loggedInUser.menu.map(m => m.id === id ? { ...m, inStock: !m.inStock } : m); const updatedList = registeredUsers.map(u => u.id === loggedInUser.id ? { ...u, menu: updatedMenu } : u); setRegisteredUsers(updatedList); pushToCloud(USER_SYNC_KEY, updatedList); setLoggedInUser({ ...loggedInUser, menu: updatedMenu }); }} />}
                    {currentPage === 'online' && <OnlineOrders menuItems={loggedInUser.menu} onPrintKOT={(newOrderData) => setOrders(prev => [...prev, { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() }])} />}
                    {currentPage === 'menu' && <Menu menu={loggedInUser.menu} setMenu={(m) => { const updated = registeredUsers.map(u => u.id === loggedInUser.id ? { ...u, menu: m } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); setLoggedInUser({ ...loggedInUser, menu: m }); }} />}
                    {currentPage === 'inventory' && <Inventory />}
                    {currentPage === 'staff' && <Staff />}
                    {currentPage === 'staffRequirements' && <StaffRequirements jobPosts={staffJobPosts.filter(p => p.status === 'Approved')} activeRestaurantJobs={restaurantJobs} onSubmitRequirement={(req, salary) => setStaffRequests(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: req, salary, timestamp: new Date(), isRead: false }])} onMessageStaff={() => {}} />}
                    {currentPage === 'market' && <Market products={marketplaceProducts} onPlaceOrder={(pId, pN, pr, q) => { const newOrder: MarketplaceOrder = { id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, productId: pId, productName: pN, price: pr, quantity: q, status: 'Pending', timestamp: new Date() }; const updated = [...marketOrders, newOrder]; setMarketOrders(updated); pushToCloud(MARKET_ORDER_SYNC_KEY, updated); }} user={loggedInUser} />}
                    {currentPage === 'reports' && <Reports orders={orders.filter(o => o.restaurantId === loggedInUser.id)} />}
                    {currentPage === 'social' && <SocialMedia user={loggedInUser} />}
                    {currentPage === 'refer' && <Referral user={loggedInUser} />}
                    {currentPage === 'subscription' && <Subscription user={loggedInUser} onRequestRenewal={() => { const newTicket: SupportTicket = { id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, subject: 'Renewal Request', messages: [{ sender: 'user', text: 'Renewal Request for ' + loggedInUser.restaurantName, timestamp: new Date() }], status: 'Open', lastUpdate: new Date() }; const updated = [...supportTickets, newTicket]; setSupportTickets(updated); pushToCloud(TICKET_SYNC_KEY, updated); setCurrentPage('help'); }} />}
                    {currentPage === 'customerOffer' && <CustomerOffer orders={orders.filter(o => o.restaurantId === loggedInUser.id)} restaurantName={loggedInUser.restaurantName} />}
                    {currentPage === 'payment' && <Payment members={paymentMembers.filter(m => m.userId === loggedInUser.id)} records={paymentRecords.filter(r => paymentMembers.find(m => m.id === r.memberId && m.userId === loggedInUser.id))} onAddMember={(n, c, t) => setPaymentMembers(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, name: n, category: c, type: t }])} onRecordPayment={(mid, p, d, dt) => setPaymentRecords(prev => [...prev, { id: Date.now(), memberId: mid, paid: p, due: d, date: dt }])} onUpdateRecord={(id, p, d, dt) => setPaymentRecords(prev => prev.map(r => r.id === id ? { ...r, paid: p, due: d, date: dt } : r))} onDeleteRecord={(id) => setPaymentRecords(prev => prev.filter(r => r.id !== id))} onDeleteMember={(id) => { setPaymentMembers(prev => prev.filter(m => m.id !== id)); setPaymentRecords(prev => prev.filter(r => r.memberId !== id)); }} />}
                    {currentPage === 'settings' && <Settings user={loggedInUser} onSave={(updates) => { const updated = registeredUsers.map(u => u.id === loggedInUser.id ? { ...u, ...updates } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); setLoggedInUser({ ...loggedInUser, ...updates }); }} onLogout={handleLogout} />}
                    {currentPage === 'qrMenu' && <QrMenu menu={loggedInUser.menu} setMenu={(m) => { const updated = registeredUsers.map(u => u.id === loggedInUser.id ? { ...u, menu: m } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); setLoggedInUser({ ...loggedInUser, menu: m }); }} loggedInUser={loggedInUser} />}
                    {currentPage === 'help' && <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={(s, m, a, at) => { const newT: SupportTicket = { id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, subject: s, messages: [{ sender: 'user', text: m, timestamp: new Date(), attachment: a, attachmentType: at }], status: 'Open', lastUpdate: new Date() }; const updated = [...supportTickets, newT]; setSupportTickets(updated); pushToCloud(TICKET_SYNC_KEY, updated); }} onReplyToTicket={(tid, msg) => { const updated = supportTickets.map(t => t.id === tid ? { ...t, status: 'Open', lastUpdate: new Date(), messages: [...t.messages, { sender: 'user', text: msg, timestamp: new Date() }] } : t); setSupportTickets(updated); pushToCloud(TICKET_SYNC_KEY, updated); }} />}
                </MainLayout>
                )
            )}
        </div>
    );
}

export default App;
