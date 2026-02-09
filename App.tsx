
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
import MarketManagement from './components/admin/MarketManagement';
import AdminStaffHub from './components/admin/AdminStaffHub';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS, MOCK_INVENTORY_ITEMS, MOCK_STAFF } from './constants';
import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, MenuItem, MarketplaceProduct, MarketplaceOrder, StaffJobPost, RestaurantJobPost, StaffRequirementRequest, PaymentMember, PaymentRecord, InventoryItem, StaffMember, StaffLogEntry } from './types';

const CLOUD_BASE_URL = "https://kvdb.io/59m7f7eK6Z6F6X9u6G6G6/";
const USER_SYNC_KEY = "global_registered_users_v8"; 
const REG_RELAY_KEY = "registration_relay_v8";
const TICKET_SYNC_KEY = "global_support_tickets_v8";
const MARKET_ORDER_SYNC_KEY = "global_market_orders_v8";
const MARKET_PRODUCT_SYNC_KEY = "global_market_products_v8";
const STAFF_JOB_SYNC_KEY = "global_staff_jobs_v8";
const RESTAURANT_JOB_SYNC_KEY = "global_restaurant_jobs_v8";
const STAFF_REQ_SYNC_KEY = "global_staff_requirements_v8";

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer';
    
    const isCustomerRoute = () => window.location.hash.includes('customer-order');
    const isSyncing = useRef(false);
    const [lastSyncTime, setLastSyncTime] = useState<string>("Never");
    const [syncError, setSyncError] = useState<boolean>(false);

    // Initial States
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

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
    
    const [inventory, setInventory] = useState<InventoryItem[]>(() => getSafeData('babuSahabPos_inventoryItems', MOCK_INVENTORY_ITEMS));
    const [staff, setStaff] = useState<StaffMember[]>(() => getSafeData('babuSahabPos_staff', MOCK_STAFF));
    const [staffLog, setStaffLog] = useState<StaffLogEntry[]>(() => getSafeData('babuSahabPos_staffLog', []));

    useEffect(() => {
        if (authState !== 'customer' && authState !== 'register') localStorage.setItem('babuSahabPos_session', authState);
        if (loggedInUser) localStorage.setItem('babuSahabPos_activeUser', JSON.stringify(loggedInUser));
        else localStorage.removeItem('babuSahabPos_activeUser');
    }, [authState, loggedInUser]);

    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_inventoryItems', JSON.stringify(inventory)); }, [inventory]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staff', JSON.stringify(staff)); }, [staff]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffLog', JSON.stringify(staffLog)); }, [staffLog]);

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

    // --- MASTER SYNC ENGINE (3s INTERVAL) ---
    useEffect(() => {
        const syncEverything = async () => {
            if (isSyncing.current) return;
            isSyncing.current = true;
            try {
                // 1. SYNC GLOBAL USERS
                const userRes = await fetch(`${CLOUD_BASE_URL}${USER_SYNC_KEY}`);
                let cloudUsers: RegisteredUser[] = userRes.ok ? await userRes.json() : [];
                if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
                    setRegisteredUsers(cloudUsers);
                    if (loggedInUser) {
                        const updatedMe = cloudUsers.find(u => u.id === loggedInUser.id);
                        if (updatedMe && JSON.stringify(updatedMe) !== JSON.stringify(loggedInUser)) {
                            setLoggedInUser(updatedMe);
                        }
                    }
                }

                // 2. SYNC GLOBAL HUB DATA
                const marketProdRes = await fetch(`${CLOUD_BASE_URL}${MARKET_PRODUCT_SYNC_KEY}`);
                if (marketProdRes.ok) setMarketplaceProducts(await marketProdRes.json());

                const marketOrderRes = await fetch(`${CLOUD_BASE_URL}${MARKET_ORDER_SYNC_KEY}`);
                if (marketOrderRes.ok) {
                    const rawOrders = await marketOrderRes.json();
                    setMarketOrders(rawOrders.map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) })));
                }

                // 3. PER-RESTAURANT SYNC
                if (loggedInUser && authState === 'loggedIn') {
                    const restId = loggedInUser.id;
                    const orderKey = `rest_orders_v8_${restId}`;
                    const oRes = await fetch(`${CLOUD_BASE_URL}${orderKey}`);
                    if (oRes.ok) {
                        const cloudOrdersRaw = await oRes.json();
                        const cloudOrders = cloudOrdersRaw.map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) }));
                        if (JSON.stringify(orders) !== JSON.stringify(cloudOrders)) setOrders(cloudOrders);
                    }

                    const invKey = `rest_inv_v8_${restId}`;
                    const iRes = await fetch(`${CLOUD_BASE_URL}${invKey}`);
                    if (iRes.ok) {
                        const cloudInv = await iRes.json();
                        if (JSON.stringify(inventory) !== JSON.stringify(cloudInv)) setInventory(cloudInv);
                    }

                    const staffKey = `rest_staff_v8_${restId}`;
                    const sRes = await fetch(`${CLOUD_BASE_URL}${staffKey}`);
                    if (sRes.ok) {
                        const cloudStaff = await sRes.json();
                        if (JSON.stringify(staff) !== JSON.stringify(cloudStaff)) setStaff(cloudStaff);
                    }
                }

                setSyncError(false);
                setLastSyncTime(new Date().toLocaleTimeString());
            } catch (e) {
                setSyncError(true);
            } finally {
                isSyncing.current = false;
            }
        };

        syncEverything();
        const interval = setInterval(syncEverything, 3000); 
        return () => clearInterval(interval);
    }, [authState, loggedInUser?.id]);

    const handleUpdateOrders = async (newOrders: OrderStatusItem[]) => {
        setOrders(newOrders);
        if (loggedInUser) await pushToCloud(`rest_orders_v8_${loggedInUser.id}`, newOrders);
    };

    const handleUpdateInventory = async (newInv: InventoryItem[]) => {
        setInventory(newInv);
        if (loggedInUser) await pushToCloud(`rest_inv_v8_${loggedInUser.id}`, newInv);
    };

    const handleUpdateStaff = async (newStaff: StaffMember[]) => {
        setStaff(newStaff);
        if (loggedInUser) await pushToCloud(`rest_staff_v8_${loggedInUser.id}`, newStaff);
    };

    const handlePlaceMarketOrder = async (productId: number, productName: string, price: number, quantity: number) => {
        if (!loggedInUser) return;
        const newOrder: MarketplaceOrder = {
            id: Date.now(),
            userId: loggedInUser.id,
            userName: loggedInUser.name,
            restaurantName: loggedInUser.restaurantName,
            productId, productName, price, quantity,
            status: 'Pending',
            timestamp: new Date(),
            messages: []
        };
        const updatedOrders = [...marketOrders, newOrder];
        setMarketOrders(updatedOrders);
        await pushToCloud(MARKET_ORDER_SYNC_KEY, updatedOrders);
    };

    const handleCancelMarketOrder = async (orderId: number) => {
        const updated = marketOrders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' as const } : o);
        setMarketOrders(updated);
        await pushToCloud(MARKET_ORDER_SYNC_KEY, updated);
    };

    const handleUpdateMarketOrderStatus = async (orderId: number, status: MarketplaceOrder['status'], deliveryDate?: string) => {
        const updated = marketOrders.map(o => o.id === orderId ? { 
            ...o, 
            status, 
            ...(deliveryDate !== undefined ? { deliveryDate } : {}) 
        } : o);
        setMarketOrders(updated);
        await pushToCloud(MARKET_ORDER_SYNC_KEY, updated);
    };

    const handleSendMessageMarketOrder = async (orderId: number, text: string, sender: 'user' | 'admin') => {
        const updated = marketOrders.map(o => o.id === orderId ? { 
            ...o, 
            messages: [...(o.messages || []), { sender, text, timestamp: new Date() }] 
        } : o);
        setMarketOrders(updated);
        await pushToCloud(MARKET_ORDER_SYNC_KEY, updated);
    };

    const handleSubmitStaffRequirement = async (requirement: string, salary: string) => {
        if (!loggedInUser) return;
        const newReq: StaffRequirementRequest = {
            id: Date.now(),
            userId: loggedInUser.id,
            restaurantName: loggedInUser.restaurantName,
            requirement, salary,
            timestamp: new Date(),
            isRead: false
        };
        const updatedReqs = [...staffRequests, newReq];
        setStaffRequests(updatedReqs);
        await pushToCloud(STAFF_REQ_SYNC_KEY, updatedReqs);
    };

    const handleLogin = (identifier: string, pass: string) => {
        const input = identifier.trim().toLowerCase();
        if (input === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        const user = registeredUsers.find(u => (u.email.trim().toLowerCase() === input || u.phone.trim() === input) && u.password === pass);
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
        const updatedUsers = [...registeredUsers, user];
        setRegisteredUsers(updatedUsers);
        await pushToCloud(USER_SYNC_KEY, updatedUsers);
    };

    const handleLogout = () => {
        if (window.confirm('Logout?')) {
            setAuthState('login'); setLoggedInUser(null);
            localStorage.removeItem('babuSahabPos_session');
            localStorage.removeItem('babuSahabPos_activeUser');
        }
    };

    const getTodaysDashboardData = (): DashboardData => {
        const d = new Date(); d.setHours(d.getHours() - 4); const todayString = d.toDateString();
        const myOrders = orders.filter(o => o.restaurantId == loggedInUser?.id && o.status === 'Completed');
        const todaysOrders = myOrders.filter(o => {
            const od = new Date(o.timestamp);
            od.setHours(od.getHours() - 4);
            return od.toDateString() === todayString;
        });
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
                    {currentAdminPage === AdminPage.Dashboard && <AdminDashboard users={registeredUsers} tickets={supportTickets} marketOrders={marketOrders} onApproveReject={(id, dec) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onApproveMarketOrder={(o) => handleUpdateMarketOrderStatus(o.id, 'Accepted')} syncStatus={{ time: lastSyncTime, error: syncError }} onDeepRecovery={() => {}} />}
                    {currentAdminPage === AdminPage.UserManagement && <UserManagement users={registeredUsers} onBlockUser={(id, b) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, status: b ? UserStatus.Blocked : UserStatus.Approved } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onSendMessage={(id, m) => setAlerts(prev => [...prev, { id: Date.now(), userId: id, message: m }])} onPasswordChange={(id, p) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, password: p } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onUpdateSubscription={(id, d) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, subscriptionEndDate: d } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onUpdateMenu={(id, m) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, menu: m } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onUpdateUserInfo={(id, name, email, phone, pass, rName) => { const updated = registeredUsers.map(u => u.id === id ? { ...u, name, email, phone, password: pass || u.password, restaurantName: rName || u.restaurantName } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onDeleteUser={(id) => { const updated = registeredUsers.filter(u => u.id !== id); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); }} onAddUser={(u) => handleRegister(u, UserStatus.Approved)} />}
                    {currentAdminPage === AdminPage.UserOrders && <MarketManagement products={marketplaceProducts} orders={marketOrders} users={registeredUsers} onAddProduct={async (n, p, d, i) => { const updated = [...marketplaceProducts, { id: Date.now(), name: n, price: p, description: d, image: i }]; setMarketplaceProducts(updated); await pushToCloud(MARKET_PRODUCT_SYNC_KEY, updated); }} onDeleteProduct={async (id) => { const updated = marketplaceProducts.filter(p => p.id !== id); setMarketplaceProducts(updated); await pushToCloud(MARKET_PRODUCT_SYNC_KEY, updated); }} onMessageUser={(uid, msg) => setAlerts(prev => [...prev, { id: Date.now(), userId: uid, message: msg }])} onUpdateStatus={handleUpdateMarketOrderStatus} onDeleteOrder={async (oid) => { const updated = marketOrders.filter(o => o.id !== oid); setMarketOrders(updated); await pushToCloud(MARKET_ORDER_SYNC_KEY, updated); }} onSendMessageOrder={handleSendMessageMarketOrder} />}
                    {currentAdminPage === AdminPage.StaffHub && <AdminStaffHub jobPosts={staffJobPosts} onApprove={async (id) => { const updated = staffJobPosts.map(p => p.id === id ? { ...p, status: 'Approved' } : p); setStaffJobPosts(updated); await pushToCloud(STAFF_JOB_SYNC_KEY, updated); }} onDelete={async (id) => { const updated = staffJobPosts.filter(p => p.id !== id); setStaffJobPosts(updated); await pushToCloud(STAFF_JOB_SYNC_KEY, updated); }} onMessage={() => {}} onCreateRestaurantJob={async (job) => { const updated = [...restaurantJobs, { ...job, id: Date.now(), timestamp: new Date() }]; setRestaurantJobs(updated); await pushToCloud(RESTAURANT_JOB_SYNC_KEY, updated); }} activeRestaurantJobs={restaurantJobs} onDeleteRestaurantJob={async (id) => { const updated = restaurantJobs.filter(j => j.id !== id); setRestaurantJobs(updated); await pushToCloud(RESTAURANT_JOB_SYNC_KEY, updated); }} staffRequests={staffRequests} onMarkRequestRead={async (id) => { const updated = staffRequests.map(r => r.id === id ? { ...r, isRead: true } : r); setStaffRequests(updated); await pushToCloud(STAFF_REQ_SYNC_KEY, updated); }} />}
                    {currentAdminPage === AdminPage.SupportTickets && <SupportTickets tickets={supportTickets} onReply={async (tid, msg) => { const updated = supportTickets.map(t => t.id === tid ? { ...t, status: 'Pending', messages: [...t.messages, { sender: 'admin', text: msg, timestamp: new Date() }] } : t); setSupportTickets(updated); await pushToCloud(TICKET_SYNC_KEY, updated); }} onResolve={async (tid) => { const updated = supportTickets.map(t => t.id === tid ? { ...t, status: 'Resolved' } : t); setSupportTickets(updated); await pushToCloud(TICKET_SYNC_KEY, updated); }} onDelete={async (tid) => { const updated = supportTickets.filter(t => t.id !== tid); setSupportTickets(updated); await pushToCloud(TICKET_SYNC_KEY, updated); }} />}
                </AdminLayout>
            ) : (
                loggedInUser && (
                <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>
                    {currentPage === 'dashboard' && <Dashboard data={getTodaysDashboardData()} orders={orders.filter(o => o.restaurantId == loggedInUser.id)} onCompleteOrder={(id) => handleUpdateOrders(orders.map(o => o.id === id ? { ...o, status: 'Completed' } : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ""} menuItems={loggedInUser.menu} onUpdateOrder={(o) => handleUpdateOrders(orders.map(p => p.id === o.id ? o : p))} isPrinterEnabled={loggedInUser.isPrinterEnabled || true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />}
                    {currentPage === 'billing' && <Billing menuItems={loggedInUser.menu} onPrintKOT={(newOrderData) => handleUpdateOrders([...orders, { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() }])} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled || true} onToggleStock={(id) => { const updatedMenu = loggedInUser.menu.map(m => m.id === id ? { ...m, inStock: !m.inStock } : m); const updatedList = registeredUsers.map(u => u.id === loggedInUser.id ? { ...u, menu: updatedMenu } : u); setRegisteredUsers(updatedList); pushToCloud(USER_SYNC_KEY, updatedList); setLoggedInUser({ ...loggedInUser, menu: updatedMenu }); }} />}
                    {currentPage === 'online' && <OnlineOrders menuItems={loggedInUser.menu} onPrintKOT={(newOrderData) => handleUpdateOrders([...orders, { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() }])} />}
                    {currentPage === 'menu' && <Menu menu={loggedInUser.menu} setMenu={(m) => { const updated = registeredUsers.map(u => u.id === loggedInUser.id ? { ...u, menu: m } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); setLoggedInUser({ ...loggedInUser, menu: m }); }} />}
                    {currentPage === 'qrMenu' && <QrMenu menu={loggedInUser.menu} setMenu={(m) => { const updated = registeredUsers.map(u => u.id === loggedInUser.id ? { ...u, menu: m } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); setLoggedInUser({ ...loggedInUser, menu: m }); }} loggedInUser={loggedInUser} />}
                    {currentPage === 'inventory' && <Inventory items={inventory} setItems={handleUpdateInventory} />}
                    {currentPage === 'staff' && <Staff staff={staff} setStaff={handleUpdateStaff} staffLog={staffLog} setStaffLog={setStaffLog} />}
                    {currentPage === 'reports' && <Reports orders={orders.filter(o => o.restaurantId == loggedInUser.id)} />}
                    {currentPage === 'settings' && <Settings user={loggedInUser} onSave={(updates) => { const updated = registeredUsers.map(u => u.id === loggedInUser.id ? { ...u, ...updates } : u); setRegisteredUsers(updated); pushToCloud(USER_SYNC_KEY, updated); setLoggedInUser({ ...loggedInUser, ...updates }); }} onLogout={handleLogout} />}
                    {currentPage === 'help' && <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={(s, m, a, at) => { const newT: SupportTicket = { id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, subject: s, messages: [{ sender: 'user', text: m, timestamp: new Date(), attachment: a, attachmentType: at }], status: 'Open', lastUpdate: new Date() }; const updated = [...supportTickets, newT]; setSupportTickets(updated); pushToCloud(TICKET_SYNC_KEY, updated); }} onReplyToTicket={(tid, msg) => { const updated = supportTickets.map(t => t.id === tid ? { ...t, status: 'Open', lastUpdate: new Date(), messages: [...t.messages, { sender: 'user', text: msg, timestamp: new Date() }] } : t); setSupportTickets(updated); pushToCloud(TICKET_SYNC_KEY, updated); }} />}
                    {currentPage === 'payment' && <Payment members={paymentMembers.filter(m => m.userId === loggedInUser.id)} records={paymentRecords.filter(r => paymentMembers.find(m => m.id === r.memberId && m.userId === loggedInUser.id))} onAddMember={(n, c, t) => setPaymentMembers(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, name: n, category: c, type: t }])} onRecordPayment={(mid, p, d, dt) => setPaymentRecords(prev => [...prev, { id: Date.now(), memberId: mid, paid: p, due: d, date: dt }])} onUpdateRecord={(id, p, d, dt) => setPaymentRecords(prev => prev.map(r => r.id === id ? { ...r, paid: p, due: d, date: dt } : r))} onDeleteRecord={(id) => setPaymentRecords(prev => prev.filter(r => r.id !== id))} onDeleteMember={(id) => { setPaymentMembers(prev => prev.filter(m => m.id !== id)); setPaymentRecords(prev => prev.filter(r => r.memberId !== id)); }} />}
                    {currentPage === 'customerOffer' && <CustomerOffer orders={orders.filter(o => o.restaurantId == loggedInUser.id)} restaurantName={loggedInUser.restaurantName} />}
                    {currentPage === 'market' && <Market products={marketplaceProducts} orders={marketOrders.filter(o => o.userId === loggedInUser.id)} onPlaceOrder={handlePlaceMarketOrder} onCancelOrder={handleCancelMarketOrder} onSendMessage={handleSendMessageMarketOrder} user={loggedInUser} />}
                    {currentPage === 'staffRequirements' && <StaffRequirements jobPosts={staffJobPosts} activeRestaurantJobs={restaurantJobs} onSubmitRequirement={handleSubmitStaffRequirement} onMessageStaff={() => {}} />}
                    {currentPage === 'social' && <SocialMedia user={loggedInUser} />}
                    {currentPage === 'refer' && <Referral user={loggedInUser} />}
                    {currentPage === 'subscription' && <Subscription user={loggedInUser} onRequestRenewal={() => {}} />}
                </MainLayout>
                )
            )}
        </div>
    );
}

export default App;
