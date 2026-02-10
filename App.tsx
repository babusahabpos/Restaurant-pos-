
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
import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, MenuItem, MarketplaceProduct, MarketplaceOrder, StaffJobPost, RestaurantJobPost, StaffRequirementRequest, InventoryItem, StaffMember, StaffLogEntry, PaymentMember, PaymentRecord, StaffMessage } from './types';

/**
 * SYSTEM UPDATE: v1.0.1 - Force Vercel Rebuild
 * Ensuring all types and variable names are consistent for production build.
 */

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer';
    
    const isCustomerRoute = () => window.location.hash.includes('customer-order');
    const [lastSyncTime, setLastSyncTime] = useState<string>("Initializing...");
    const [syncError, setSyncError] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

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

    const [orders, setOrders] = useState<OrderStatusItem[]>([]);
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>([]);
    const [marketOrders, setMarketOrders] = useState<MarketplaceOrder[]>([]);
    const [staffJobPosts, setStaffJobPosts] = useState<StaffJobPost[]>([]);
    const [restaurantJobs, setRestaurantJobs] = useState<RestaurantJobPost[]>([]);
    
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [staffLog, setStaffLog] = useState<StaffLogEntry[]>([]);
    const [paymentMembers, setPaymentMembers] = useState<PaymentMember[]>([]);
    const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);

    useEffect(() => {
        if (authState !== 'customer' && authState !== 'register') localStorage.setItem('babuSahabPos_session', authState);
        if (loggedInUser) localStorage.setItem('babuSahabPos_activeUser', JSON.stringify(loggedInUser));
    }, [authState, loggedInUser]);

    useEffect(() => {
        const usersRef = ref(db, 'global/users');
        const ticketsRef = ref(db, 'global/supportTickets');
        const productsRef = ref(db, 'global/marketProducts');
        const marketOrdersRef = ref(db, 'global/marketOrders');
        const staffJobsRef = ref(db, 'global/staffJobPosts');
        const restaurantJobsRef = ref(db, 'global/restaurantJobs');

        onValue(usersRef, (snapshot) => {
            if (snapshot.val()) {
                const list = Object.values(snapshot.val()) as RegisteredUser[];
                setRegisteredUsers(list);
                if (loggedInUser) {
                    const updatedMe = list.find(u => u.id === loggedInUser.id);
                    if (updatedMe) setLoggedInUser(updatedMe);
                }
            }
            setLastSyncTime(new Date().toLocaleTimeString());
        }, () => setSyncError(true));

        onValue(ticketsRef, (snapshot) => {
            if (snapshot.val()) {
                const list = Object.values(snapshot.val()).map((t: any) => ({
                    ...t, lastUpdate: new Date(t.lastUpdate),
                    messages: t.messages ? Object.values(t.messages) : []
                })) as SupportTicket[];
                setSupportTickets(list);
            }
        });

        onValue(productsRef, (snapshot) => {
            if (snapshot.val()) setMarketplaceProducts(Object.values(snapshot.val()));
        });

        onValue(marketOrdersRef, (snapshot) => {
            if (snapshot.val()) {
                const list = Object.values(snapshot.val()).map((o: any) => ({
                    ...o, timestamp: new Date(o.timestamp),
                    messages: o.messages ? Object.values(o.messages) : []
                })) as MarketplaceOrder[];
                setMarketOrders(list);
            }
        });

        onValue(staffJobsRef, (snapshot) => {
            if (snapshot.val()) setStaffJobPosts(Object.values(snapshot.val()));
        });

        onValue(restaurantJobsRef, (snapshot) => {
            if (snapshot.val()) setRestaurantJobs(Object.values(snapshot.val()));
        });

        if (loggedInUser) {
            onValue(ref(db, `orders/${loggedInUser.id}`), (snapshot) => {
                if (snapshot.val()) setOrders(Object.values(snapshot.val()).map((o:any) => ({...o, timestamp: new Date(o.timestamp)})));
                else setOrders([]);
            });

            onValue(ref(db, `userdata/${loggedInUser.id}/inventory`), (snapshot) => {
                if (snapshot.val()) setInventory(Object.values(snapshot.val()));
                else setInventory(MOCK_INVENTORY_ITEMS);
            });

            onValue(ref(db, `userdata/${loggedInUser.id}/staff`), (snapshot) => {
                if (snapshot.val()) setStaff(Object.values(snapshot.val()));
                else setStaff([]);
            });

            onValue(ref(db, `userdata/${loggedInUser.id}/staffLog`), (snapshot) => {
                if (snapshot.val()) setStaffLog(Object.values(snapshot.val()).map((l:any) => ({...l, timestamp: new Date(l.timestamp)})));
                else setStaffLog([]);
            });

            onValue(ref(db, `userdata/${loggedInUser.id}/paymentMembers`), (snapshot) => {
                if (snapshot.val()) setPaymentMembers(Object.values(snapshot.val()));
                else setPaymentMembers([]);
            });

            onValue(ref(db, `userdata/${loggedInUser.id}/paymentRecords`), (snapshot) => {
                if (snapshot.val()) setPaymentRecords(Object.values(snapshot.val()));
                else setPaymentRecords([]);
            });
        }
    }, [loggedInUser?.id]);

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

    if (authState === 'customer' || isCustomerRoute()) return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={async (u, s) => {
        const uid = Date.now();
        const newUser = { ...u, id: uid, status: s, subscriptionEndDate: new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0], menu: MOCK_MENU_ITEMS, taxRate: 5, deliveryCharge: 30, isDeliveryEnabled: true, isPrinterEnabled: true, referralCode: 'REF'+uid };
        await set(ref(db, `global/users/${uid}`), newUser);
    }} onNavigateToLogin={() => setAuthState('login')} />;

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {authState === 'adminLoggedIn' ? (
                <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, marketOrders: marketOrders.filter(o => o.status === 'Pending').length }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>
                    {currentAdminPage === AdminPage.Dashboard && <AdminDashboard users={registeredUsers} tickets={supportTickets} marketOrders={marketOrders} onApproveReject={(id, dec) => update(ref(db, `global/users/${id}`), { status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected })} onApproveMarketOrder={(o) => update(ref(db, `global/marketOrders/${o.id}`), {status: 'Accepted'})} syncStatus={{ time: lastSyncTime, error: syncError }} />}
                    {currentAdminPage === AdminPage.UserManagement && <UserManagement users={registeredUsers} onBlockUser={(id, b) => update(ref(db, `global/users/${id}`), { status: b ? UserStatus.Blocked : UserStatus.Approved })} onSendMessage={(id, m) => push(ref(db, `global/adminAlerts`), { id: Date.now(), userId: id, message: m })} onPasswordChange={(id, p) => update(ref(db, `global/users/${id}`), { password: p })} onUpdateSubscription={(id, d) => update(ref(db, `global/users/${id}`), { subscriptionEndDate: d })} onUpdateMenu={(id, m) => update(ref(db, `global/users/${id}`), { menu: m })} onUpdateUserInfo={(id, name, email, phone, pass, rName) => update(ref(db, `global/users/${id}`), { name, email, phone, password: pass, restaurantName: rName })} onDeleteUser={(id) => remove(ref(db, `global/users/${id}`))} onAddUser={(u) => push(ref(db, 'global/users'), u)} />}
                    {currentAdminPage === AdminPage.UserOrders && <MarketManagement products={marketplaceProducts} orders={marketOrders} users={registeredUsers} onAddProduct={(n, p, d, i) => { const pid = Date.now(); set(ref(db, `global/marketProducts/${pid}`), { id: pid, name: n, price: p, description: d, image: i }); }} onDeleteProduct={(id) => remove(ref(db, `global/marketProducts/${id}`))} onMessageUser={(uid, msg) => push(ref(db, `global/adminAlerts`), { id: Date.now(), userId: uid, message: msg })} onUpdateStatus={(oid, s, d) => update(ref(db, `global/marketOrders/${oid}`), {status: s, deliveryDate: d})} onDeleteOrder={(oid) => remove(ref(db, `global/marketOrders/${oid}`))} onSendMessageOrder={(oid, t, s) => push(ref(db, `global/marketOrders/${oid}/messages`), { sender: s, text: t, timestamp: new Date().toISOString() })} />}
                    {currentAdminPage === AdminPage.SupportTickets && <SupportTickets tickets={supportTickets} onReply={(tid, msg) => push(ref(db, `global/supportTickets/${tid}/messages`), { sender: 'admin', text: msg, timestamp: new Date().toISOString() })} onResolve={(tid) => update(ref(db, `global/supportTickets/${tid}`), { status: 'Resolved' })} onDelete={(tid) => remove(ref(db, `global/supportTickets/${tid}`))} />}
                </AdminLayout>
            ) : (
                loggedInUser && (
                <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts} onDismissAlert={() => {}} loggedInUser={loggedInUser}>
                    {currentPage === 'dashboard' && <Dashboard data={{ onlineSales: orders.filter(o => o.type==='Online' && o.status==='Completed').reduce((s,o)=>s+o.total,0), offlineSales: orders.filter(o => o.type==='Offline' && o.status==='Completed').reduce((s,o)=>s+o.total,0), onlineOrders: orders.filter(o=>o.type==='Online').length, offlineOrders: orders.filter(o=>o.type==='Offline').length }} orders={orders} onCompleteOrder={(id) => update(ref(db, `orders/${loggedInUser.id}/${id}`), { status: 'Completed' })} taxRate={loggedInUser.taxRate} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ""} menuItems={loggedInUser.menu} onUpdateOrder={(o) => update(ref(db, `orders/${loggedInUser.id}/${o.id}`), o)} isPrinterEnabled={loggedInUser.isPrinterEnabled || true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />}
                    {currentPage === 'billing' && <Billing menuItems={loggedInUser.menu} onPrintKOT={(o) => { const oid = Date.now(); set(ref(db, `orders/${loggedInUser.id}/${oid}`), { ...o, id: oid, status: 'Preparation', timestamp: new Date().toISOString() }); }} taxRate={loggedInUser.taxRate} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled || true} />}
                    {currentPage === 'online' && <OnlineOrders menuItems={loggedInUser.menu} onPrintKOT={(o) => { const oid = Date.now(); set(ref(db, `orders/${loggedInUser.id}/${oid}`), { ...o, id: oid, status: 'Preparation', timestamp: new Date().toISOString() }); }} />}
                    {currentPage === 'menu' && <Menu menu={loggedInUser.menu} setMenu={(m) => update(ref(db, `global/users/${loggedInUser.id}`), { menu: m })} />}
                    {currentPage === 'qrMenu' && <QrMenu menu={loggedInUser.menu} setMenu={(m) => update(ref(db, `global/users/${loggedInUser.id}`), { menu: m })} loggedInUser={loggedInUser} />}
                    {currentPage === 'inventory' && <Inventory items={inventory} setItems={(items) => set(ref(db, `userdata/${loggedInUser.id}/inventory`), items)} />}
                    {currentPage === 'reports' && <Reports orders={orders} />}
                    {currentPage === 'staff' && <Staff staff={staff} onAddStaff={(s) => { const sid = Date.now(); set(ref(db, `userdata/${loggedInUser.id}/staff/${sid}`), { ...s, id: sid, status: 'Clocked Out', lastAction: 'Never' }); }} onAction={(sid, action) => { const logId = Date.now(); const member = staff.find(m => m.id === sid); if(!member) return; let newStatus = member.status; if(action==='Clock In') newStatus='Clocked In'; if(action==='Clock Out') newStatus='Clocked Out'; if(action==='Take Break') newStatus='On Break'; if(action==='End Break') newStatus='Clocked In'; update(ref(db, `userdata/${loggedInUser.id}/staff/${sid}`), { status: newStatus, lastAction: new Date().toLocaleString() }); set(ref(db, `userdata/${loggedInUser.id}/staffLog/${logId}`), { id: logId, staffId: sid, staffName: member.name, action, timestamp: new Date().toISOString() }); }} staffLog={staffLog} />}
                    {currentPage === 'payment' && <Payment members={paymentMembers} records={paymentRecords} onAddMember={(n, c, t) => { const mid = Date.now(); set(ref(db, `userdata/${loggedInUser.id}/paymentMembers/${mid}`), { id: mid, name: n, category: c, type: t }); }} onRecordPayment={(mid, p, d, dt) => { const rid = Date.now(); set(ref(db, `userdata/${loggedInUser.id}/paymentRecords/${rid}`), { id: rid, memberId: mid, paid: p, due: d, date: dt }); }} onUpdateRecord={(rid, p, d, dt) => update(ref(db, `userdata/${loggedInUser.id}/paymentRecords/${rid}`), { paid: p, due: d, date: dt })} onDeleteRecord={(rid) => remove(ref(db, `userdata/${loggedInUser.id}/paymentRecords/${rid}`))} onDeleteMember={(mid) => { remove(ref(db, `userdata/${loggedInUser.id}/paymentMembers/${mid}`)); paymentRecords.filter(r => r.memberId === mid).forEach(r => remove(ref(db, `userdata/${loggedInUser.id}/paymentRecords/${r.id}`))); }} />}
                    {currentPage === 'market' && <Market products={marketplaceProducts} orders={marketOrders.filter(o => o.userId === loggedInUser.id)} onPlaceOrder={(pid, pn, pr, q) => { const oid = Date.now(); set(ref(db, `global/marketOrders/${oid}`), { id: oid, userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, productId: pid, productName: pn, price: pr, quantity: q, status: 'Pending', timestamp: new Date().toISOString() }); }} onCancelOrder={(id) => update(ref(db, `global/marketOrders/${id}`), {status: 'Cancelled'})} onSendMessage={(oid, t, s) => push(ref(db, `global/marketOrders/${oid}/messages`), { sender: s, text: t, timestamp: new Date().toISOString() })} user={loggedInUser} />}
                    {currentPage === 'settings' && <Settings user={loggedInUser} onSave={(updates) => update(ref(db, `global/users/${loggedInUser.id}`), updates)} onLogout={handleLogout} />}
                    {currentPage === 'help' && <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={(s, m, a, at) => { const tid = Date.now(); set(ref(db, `global/supportTickets/${tid}`), { id: tid, userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, subject: s, messages: [{ sender: 'user', text: m, timestamp: new Date().toISOString(), attachment: a, attachmentType: at }], status: 'Open', lastUpdate: new Date().toISOString() }); }} onReplyToTicket={(tid, msg) => push(ref(db, `global/supportTickets/${tid}/messages`), { sender: 'user', text: msg, timestamp: new Date().toISOString() })} />}
                    {currentPage === 'subscription' && <Subscription user={loggedInUser} onRequestRenewal={() => alert('Sent!')} />}
                    {currentPage === 'customerOffer' && <CustomerOffer orders={orders} restaurantName={loggedInUser.restaurantName} />}
                    {currentPage === 'refer' && <Referral user={loggedInUser} />}
                    {currentPage === 'social' && <SocialMedia user={loggedInUser} />}
                    {currentPage === 'staffRequirements' && <StaffRequirements jobPosts={staffJobPosts} activeRestaurantJobs={restaurantJobs} onSubmitRequirement={(req, sal) => { const rid = Date.now(); set(ref(db, `global/staffRequirements/${rid}`), { id: rid, userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: req, salary: sal, timestamp: new Date().toISOString(), isRead: false }); }} onMessageStaff={(p, t) => { const mid = Date.now(); set(ref(db, `global/staffMessages/${mid}`), { id: mid, senderName: loggedInUser.restaurantName, recipientPhone: p, text: t, timestamp: new Date().toISOString(), isRead: false }); }} />}
                </MainLayout>
                )
            )}
        </div>
    );
}

export default App;
