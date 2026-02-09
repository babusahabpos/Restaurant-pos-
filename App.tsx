import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, push, remove } from 'firebase/database';
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
import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, MenuItem, MarketplaceProduct, MarketplaceOrder, StaffJobPost, RestaurantJobPost, StaffRequirementRequest, InventoryItem, StaffMember, StaffLogEntry } from './types';

// আপনার দেওয়া Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6rJzFw7FwUP3MFveojRAUB7GuhAmGXHI",
  authDomain: "babu-sahab.firebaseapp.com",
  databaseURL: "https://babu-sahab-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "babu-sahab",
  storageBucket: "babu-sahab.firebasestorage.app",
  messagingSenderId: "544048344901",
  appId: "1:544048344901:web:c55e7d2faaba5c1cd8982c",
  measurementId: "G-1NDD8M4BJS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer';
    
    const isCustomerRoute = () => window.location.hash.includes('customer-order');
    const [lastSyncTime, setLastSyncTime] = useState<string>("Initializing...");
    const [syncError, setSyncError] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

    const getSafeData = (key: string, defaultValue: any) => {
        try {
            const saved = localStorage.getItem(key);
            if (!saved || saved === "undefined" || saved === "[]") return defaultValue;
            const data = JSON.parse(saved);
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

    // States with real-time listeners
    const [orders, setOrders] = useState<OrderStatusItem[]>([]);
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => getSafeData('babuSahabPos_alerts', []));
    const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>([]);
    const [marketOrders, setMarketOrders] = useState<MarketplaceOrder[]>([]);
    const [staffJobPosts, setStaffJobPosts] = useState<StaffJobPost[]>([]);
    const [restaurantJobs, setRestaurantJobs] = useState<RestaurantJobPost[]>([]);
    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>(() => getSafeData('babuSahabPos_inventoryItems', MOCK_INVENTORY_ITEMS));
    const [staff, setStaff] = useState<StaffMember[]>(() => getSafeData('babuSahabPos_staff', MOCK_STAFF));

    useEffect(() => {
        if (authState !== 'customer' && authState !== 'register') localStorage.setItem('babuSahabPos_session', authState);
        if (loggedInUser) localStorage.setItem('babuSahabPos_activeUser', JSON.stringify(loggedInUser));
    }, [authState, loggedInUser]);

    // --- REAL-TIME SYNC ENGINE ---
    useEffect(() => {
        const usersRef = ref(db, 'global/users');
        const ticketsRef = ref(db, 'global/supportTickets');
        const productsRef = ref(db, 'global/marketProducts');
        const marketOrdersRef = ref(db, 'global/marketOrders');

        // Listen for all users
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.values(data) as RegisteredUser[];
                setRegisteredUsers(list);
                if (loggedInUser) {
                    const updatedMe = list.find(u => u.id === loggedInUser.id);
                    if (updatedMe) setLoggedInUser(updatedMe);
                }
            }
            setLastSyncTime(new Date().toLocaleTimeString());
        }, () => setSyncError(true));

        // Listen for Tickets
        onValue(ticketsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.values(data).map((t: any) => ({
                    ...t, lastUpdate: new Date(t.lastUpdate),
                    messages: t.messages ? Object.values(t.messages) : []
                })) as SupportTicket[];
                setSupportTickets(list);
            }
        });

        // Listen for Marketplace
        onValue(productsRef, (snapshot) => {
            if (snapshot.val()) setMarketplaceProducts(Object.values(snapshot.val()));
        });

        onValue(marketOrdersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.values(data).map((o: any) => ({
                    ...o, timestamp: new Date(o.timestamp),
                    messages: o.messages ? Object.values(o.messages) : []
                })) as MarketplaceOrder[];
                setMarketOrders(list);
            } else {
                setMarketOrders([]);
            }
        });

        // Current User's Orders listener
        if (loggedInUser) {
            const ordersRef = ref(db, `orders/${loggedInUser.id}`);
            onValue(ordersRef, (snapshot) => {
                if (snapshot.val()) setOrders(Object.values(snapshot.val()));
            });
        }
    }, [loggedInUser?.id]);

    // Firebase Handlers
    const handleRegister = async (newUser: any, status: UserStatus = UserStatus.Approved) => {
        const userId = Date.now();
        const user: RegisteredUser = { 
            ...newUser, id: userId, status, lastLogin: 'Just Now', 
            subscriptionEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            menu: MOCK_MENU_ITEMS, taxRate: 5, deliveryCharge: 30, isDeliveryEnabled: true, isPrinterEnabled: true, 
            referralCode: 'REF' + Math.random().toString(36).substring(7).toUpperCase(), address: 'Setup Needed'
        };
        await set(ref(db, `global/users/${userId}`), user);
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

    const handleLogout = () => {
        if (window.confirm('Logout?')) {
            setAuthState('login'); setLoggedInUser(null);
            localStorage.removeItem('babuSahabPos_session');
            localStorage.removeItem('babuSahabPos_activeUser');
        }
    };

    const getTodaysDashboardData = (): DashboardData => {
        const todayString = new Date().toDateString();
        const todaysOrders = orders.filter(o => o.status === 'Completed' && new Date(o.timestamp).toDateString() === todayString);
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
                    {currentAdminPage === AdminPage.Dashboard && <AdminDashboard users={registeredUsers} tickets={supportTickets} marketOrders={marketOrders} onApproveReject={(id, dec) => update(ref(db, `global/users/${id}`), { status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected })} onApproveMarketOrder={(o) => update(ref(db, `global/marketOrders/${o.id}`), {status: 'Accepted'})} syncStatus={{ time: lastSyncTime, error: syncError }} />}
                    {currentAdminPage === AdminPage.UserManagement && <UserManagement users={registeredUsers} onBlockUser={(id, b) => update(ref(db, `global/users/${id}`), { status: b ? UserStatus.Blocked : UserStatus.Approved })} onSendMessage={(id, m) => setAlerts(prev => [...prev, { id: Date.now(), userId: id, message: m }])} onPasswordChange={(id, p) => update(ref(db, `global/users/${id}`), { password: p })} onUpdateSubscription={(id, d) => update(ref(db, `global/users/${id}`), { subscriptionEndDate: d })} onUpdateMenu={(id, m) => update(ref(db, `global/users/${id}`), { menu: m })} onUpdateUserInfo={(id, name, email, phone, pass, rName) => update(ref(db, `global/users/${id}`), { name, email, phone, password: pass, restaurantName: rName })} onDeleteUser={(id) => remove(ref(db, `global/users/${id}`))} onAddUser={(u) => handleRegister(u, UserStatus.Approved)} />}
                    {currentAdminPage === AdminPage.UserOrders && <MarketManagement products={marketplaceProducts} orders={marketOrders} users={registeredUsers} onAddProduct={(n, p, d, i) => { const pid = Date.now(); set(ref(db, `global/marketProducts/${pid}`), { id: pid, name: n, price: p, description: d, image: i }); }} onDeleteProduct={(id) => remove(ref(db, `global/marketProducts/${id}`))} onMessageUser={(uid, msg) => setAlerts(prev => [...prev, { id: Date.now(), userId: uid, message: msg }])} onUpdateStatus={(oid, s, d) => update(ref(db, `global/marketOrders/${oid}`), {status: s, deliveryDate: d})} onDeleteOrder={(oid) => remove(ref(db, `global/marketOrders/${oid}`))} onSendMessageOrder={(oid, t, s) => push(ref(db, `global/marketOrders/${oid}/messages`), { sender: s, text: t, timestamp: new Date().toISOString() })} />}
                    {currentAdminPage === AdminPage.SupportTickets && <SupportTickets tickets={supportTickets} onReply={(tid, msg) => push(ref(db, `global/supportTickets/${tid}/messages`), { sender: 'admin', text: msg, timestamp: new Date().toISOString() })} onResolve={(tid) => update(ref(db, `global/supportTickets/${tid}`), { status: 'Resolved' })} onDelete={(tid) => remove(ref(db, `global/supportTickets/${tid}`))} />}
                </AdminLayout>
            ) : (
                loggedInUser && (
                <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>
                    {currentPage === 'dashboard' && <Dashboard data={getTodaysDashboardData()} orders={orders} onCompleteOrder={(id) => update(ref(db, `orders/${loggedInUser.id}/${id}`), { status: 'Completed' })} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ""} menuItems={loggedInUser.menu} onUpdateOrder={(o) => update(ref(db, `orders/${loggedInUser.id}/${o.id}`), o)} isPrinterEnabled={loggedInUser.isPrinterEnabled || true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />}
                    {currentPage === 'billing' && <Billing menuItems={loggedInUser.menu} onPrintKOT={(newOrderData) => { const oid = Date.now(); set(ref(db, `orders/${loggedInUser.id}/${oid}`), { ...newOrderData, id: oid, restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date().toISOString() }); }} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled || true} />}
                    {currentPage === 'online' && <OnlineOrders menuItems={loggedInUser.menu} onPrintKOT={(newOrderData) => { const oid = Date.now(); set(ref(db, `orders/${loggedInUser.id}/${oid}`), { ...newOrderData, id: oid, restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date().toISOString() }); }} />}
                    {currentPage === 'menu' && <Menu menu={loggedInUser.menu} setMenu={(m) => update(ref(db, `global/users/${loggedInUser.id}`), { menu: m })} />}
                    {currentPage === 'qrMenu' && <QrMenu menu={loggedInUser.menu} setMenu={(m) => update(ref(db, `global/users/${loggedInUser.id}`), { menu: m })} loggedInUser={loggedInUser} />}
                    {currentPage === 'settings' && <Settings user={loggedInUser} onSave={(updates) => update(ref(db, `global/users/${loggedInUser.id}`), updates)} onLogout={handleLogout} />}
                    {currentPage === 'help' && <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={(s, m, a, at) => { const tid = Date.now(); set(ref(db, `global/supportTickets/${tid}`), { id: tid, userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, subject: s, messages: [{ sender: 'user', text: m, timestamp: new Date().toISOString(), attachment: a, attachmentType: at }], status: 'Open', lastUpdate: new Date().toISOString() }); }} onReplyToTicket={(tid, msg) => push(ref(db, `global/supportTickets/${tid}/messages`), { sender: 'user', text: msg, timestamp: new Date().toISOString() })} />}
                    {currentPage === 'market' && <Market products={marketplaceProducts} orders={marketOrders.filter(o => o.userId === loggedInUser.id)} onPlaceOrder={(pid, pn, pr, q) => { const oid = Date.now(); set(ref(db, `global/marketOrders/${oid}`), { id: oid, userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, productId: pid, productName: pn, price: pr, quantity: q, status: 'Pending', timestamp: new Date().toISOString() }); }} onCancelOrder={(id) => update(ref(db, `global/marketOrders/${id}`), {status: 'Cancelled'})} onSendMessage={(oid, t, s) => push(ref(db, `global/marketOrders/${oid}/messages`), { sender: s, text: t, timestamp: new Date().toISOString() })} user={loggedInUser} />}
                    {currentPage === 'subscription' && <Subscription user={loggedInUser} onRequestRenewal={() => {}} />}
                </MainLayout>
                )
            )}
        </div>
    );
}

export default App;