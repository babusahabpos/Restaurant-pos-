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
import Market from './components/Market';
import StaffRequirements from './components/StaffRequirements';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportTickets from './components/admin/SupportTickets';
import MarketManagement from './components/admin/MarketManagement';
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import AdminStaffRequirements from './components/admin/AdminStaffRequirements';
import AdminStaffHub from './components/admin/AdminStaffHub';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, MenuItem, MarketplaceProduct, MarketplaceOrder, StaffJobPost, StaffRequirementRequest, StaffApplication, RestaurantJobPost, StaffUser, StaffMessage } from './types';

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer';
    
    const [authState, setAuthState] = useState<AuthState>(() => {
        try {
            const hash = window.location.hash || '';
            if (hash.includes('customer-order')) return 'customer';
        } catch (e) {}
        return 'login';
    });

    const [loggedInUser, setLoggedInUser] = useState<RegisteredUser | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

    // --- Data State (Safe Initializers) ---
    const [orders, setOrders] = useState<OrderStatusItem[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_orders');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed
                .filter(o => o && typeof o === 'object')
                .map((o: any) => ({...o, timestamp: new Date(o.timestamp || Date.now())})) : [];
        } catch (e) { return []; }
    });

    const [dashboardData, setDashboardData] = useState<DashboardData>({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
    
    const [marketProducts, setMarketProducts] = useState<MarketplaceProduct[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_marketProducts');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    });

    const [marketOrders, setMarketOrders] = useState<MarketplaceOrder[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_marketOrders');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed
                .filter(o => o && typeof o === 'object')
                .map((o: any) => ({...o, timestamp: new Date(o.timestamp || Date.now())})) : [];
        } catch (e) { return []; }
    });

    const [jobPosts, setJobPosts] = useState<StaffJobPost[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_jobPosts');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed.map((p: any) => ({ ...p, timestamp: new Date(p.timestamp || Date.now()) })) : [];
        } catch (e) { return []; }
    });

    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_staffRequests');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed.map((r: any) => ({...r, timestamp: new Date(r.timestamp || Date.now())})) : [];
        } catch (e) { return []; }
    });

    const [staffApplications, setStaffApplications] = useState<StaffApplication[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_staffApplications');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp || Date.now()) })) : [];
        } catch (e) { return []; }
    });

    const [restaurantJobs, setRestaurantJobs] = useState<RestaurantJobPost[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_restaurantJobs');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed.map((j: any) => ({...j, timestamp: new Date(j.timestamp || Date.now())})) : [];
        } catch (e) { return []; }
    });

    const [registeredStaff, setRegisteredStaff] = useState<StaffUser[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_registeredStaff');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed.map((s: any) => ({...s, registeredAt: new Date(s.registeredAt || Date.now())})) : [];
        } catch (e) { return []; }
    });

    const [staffMessages, setStaffMessages] = useState<StaffMessage[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_staffMessages');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed.map((m: any) => ({...m, timestamp: new Date(m.timestamp || Date.now())})) : [];
        } catch (e) { return []; }
    });

    const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<MarketplaceOrder | null>(null);
    const [deliveryDateInput, setDeliveryDateInput] = useState('');

    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
        try {
            const storedUsers = localStorage.getItem('babuSahabPos_users');
            if (storedUsers) {
                const parsed = JSON.parse(storedUsers);
                if (Array.isArray(parsed)) {
                    return parsed.map((u: any) => ({
                        ...u,
                        taxRate: u.taxRate !== undefined ? Number(u.taxRate) : 5,
                        deliveryCharge: u.deliveryCharge !== undefined ? Number(u.deliveryCharge) : 30,
                        isDeliveryEnabled: u.isDeliveryEnabled !== undefined ? u.isDeliveryEnabled : true,
                        isPrinterEnabled: u.isPrinterEnabled !== undefined ? u.isPrinterEnabled : true,
                        menu: (Array.isArray(u.menu) && u.menu.length > 0) ? u.menu : MOCK_MENU_ITEMS
                    }));
                }
            }
        } catch (error) {}
        return JSON.parse(JSON.stringify(MOCK_USERS || []));
    });

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_tickets');
            const data = saved ? JSON.parse(saved) : MOCK_TICKETS;
            if (!Array.isArray(data)) return [];
            return data.map((t: any) => ({
                ...t, 
                lastUpdate: new Date(t.lastUpdate || Date.now()), 
                messages: (t.messages || []).map((m: any) => ({...m, timestamp: new Date(m.timestamp || Date.now())}))
            }));
        } catch (e) { return []; }
    });

    const [alerts, setAlerts] = useState<AdminAlert[]>(() => {
        try {
            const saved = localStorage.getItem('babuSahabPos_alerts');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    });
    
    // --- Persistence ---
    useEffect(() => { try { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); } catch (e) {} }, [orders]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); } catch (e) {} }, [registeredUsers]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_tickets', JSON.stringify(supportTickets)); } catch (e) {} }, [supportTickets]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_alerts', JSON.stringify(alerts)); } catch (e) {} }, [alerts]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_marketProducts', JSON.stringify(marketProducts)); } catch (e) {} }, [marketProducts]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_marketOrders', JSON.stringify(marketOrders)); } catch (e) {} }, [marketOrders]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_jobPosts', JSON.stringify(jobPosts)); } catch (e) {} }, [jobPosts]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_staffRequests', JSON.stringify(staffRequests)); } catch (e) {} }, [staffRequests]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_staffApplications', JSON.stringify(staffApplications)); } catch (e) {} }, [staffApplications]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_restaurantJobs', JSON.stringify(restaurantJobs)); } catch (e) {} }, [restaurantJobs]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_registeredStaff', JSON.stringify(registeredStaff)); } catch (e) {} }, [registeredStaff]);
    useEffect(() => { try { localStorage.setItem('babuSahabPos_staffMessages', JSON.stringify(staffMessages)); } catch (e) {} }, [staffMessages]);
    
    // --- Dashboard Calculation ---
    useEffect(() => {
        if (!loggedInUser) { setDashboardData({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 }); return; };
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todaysUserOrders = orders.filter(o => o && o.restaurantId === loggedInUser.id && new Date(o.timestamp) >= startOfDay);
        const newDashboardData = todaysUserOrders.reduce((acc, order) => {
            if (order.status === 'Completed') {
                if (order.type === 'Online') { acc.onlineSales += (order.total || 0); acc.onlineOrders += 1; } 
                else { acc.offlineSales += (order.total || 0); acc.offlineOrders += 1; }
            }
            return acc;
        }, { onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
        setDashboardData(newDashboardData);
    }, [orders, loggedInUser]);

    // --- Handlers ---
    const handleLogin = (email: string, pass: string): 'ok' | 'pending' | 'blocked' | 'admin' | 'not_found' | 'deleted' => {
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Approved) { setAuthState('loggedIn'); setLoggedInUser(user); return 'ok'; }
            if (user.status === UserStatus.Blocked) return 'blocked';
            if (user.status === UserStatus.Deleted) return 'deleted';
            return 'pending';
        }
        return 'not_found';
    };

    const handleRegister = (newUser: any) => {
        const getFutureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const user: RegisteredUser = { 
            ...newUser, 
            id: Date.now(), 
            status: UserStatus.Approved, 
            lastLogin: 'Never', 
            subscriptionEndDate: getFutureDate(30), 
            address: 'Update in settings', 
            taxRate: 5, deliveryCharge: 30, isDeliveryEnabled: true, isPrinterEnabled: true, menu: MOCK_MENU_ITEMS, referralCode: `ref${Date.now()}`, socialMedia: { autoPostEnabled: false } 
        };
        setRegisteredUsers([...registeredUsers, user]);
    };

    const handleMarketOrder = (productId: number, productName: string, price: number, quantity: number) => {
        if (!loggedInUser) return;
        const newOrder: MarketplaceOrder = {
            id: Date.now(),
            userId: loggedInUser.id,
            userName: loggedInUser.name,
            restaurantName: loggedInUser.restaurantName,
            productId,
            productName,
            price,
            quantity,
            status: 'Pending',
            timestamp: new Date()
        };
        setMarketOrders(prev => [...prev, newOrder]);
    };

    const handleStaffRequirementSubmit = (req: string, salary: string) => {
        if (!loggedInUser) return;
        const newReq: StaffRequirementRequest = { 
            id: Date.now(), 
            userId: loggedInUser.id, 
            restaurantName: loggedInUser.restaurantName, 
            requirement: req, 
            salary, 
            timestamp: new Date(), 
            isRead: false 
        };
        setStaffRequests(prev => [...prev, newReq]);
    };

    const handleAcceptMarketOrder = () => {
        if (!selectedOrderForDelivery || !deliveryDateInput) return;
        setMarketOrders(prev => prev.map(o => o.id === selectedOrderForDelivery.id ? { ...o, status: 'Accepted', deliveryDate: deliveryDateInput } : o));
        setAlerts(prev => [...prev, { id: Date.now(), userId: selectedOrderForDelivery.userId, message: `Your order for ${selectedOrderForDelivery.productName} is accepted! Expected Delivery: ${deliveryDateInput}` }]);
        setSelectedOrderForDelivery(null);
        setDeliveryDateInput('');
    };

    const handleAdminSendMessage = (userId: number | 'all', message: string) => {
        setAlerts(prev => [...prev, { id: Date.now(), userId, message }]);
    };

    const handleKOT = (newOrderData: any) => {
        if (!loggedInUser) return;
        const newOrder: OrderStatusItem = { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() };
        setOrders(prev => [...prev, newOrder]);
    };

    const handleApproveRejectUser = (id: number, decision: 'approve' | 'reject') => {
        setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: decision === 'approve' ? UserStatus.Approved : UserStatus.Rejected} : u));
    };

    // --- Render Logic ---
    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;
    
    if (authState === 'adminLoggedIn') {
        const adminPages: Record<string, React.ReactNode> = {
            [AdminPage.Dashboard]: (
                <AdminDashboard 
                    users={registeredUsers} 
                    tickets={supportTickets} 
                    marketOrders={marketOrders} 
                    onApproveReject={handleApproveRejectUser} 
                    onApproveMarketOrder={(o) => setSelectedOrderForDelivery(o)} 
                />
            ),
            [AdminPage.UserManagement]: (
                <UserManagement 
                    users={registeredUsers} 
                    onBlockUser={(id, b) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, status: b ? UserStatus.Blocked : UserStatus.Approved} : u))} 
                    onSendMessage={handleAdminSendMessage} 
                    onPasswordChange={(id, p) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, password: p} : u))} 
                    onUpdateSubscription={(id, d) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, subscriptionEndDate: d} : u))} 
                    onUpdateMenu={(id, m) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, menu: m} : u))} 
                    onDeleteUser={(id) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, status: UserStatus.Deleted} : u))} 
                />
            ),
            [AdminPage.SupportTickets]: (
                <SupportTickets 
                    tickets={supportTickets} 
                    onReply={(id, m) => setSupportTickets(prev => prev.map(t => t.id === id ? {...t, messages: [...t.messages, {sender: 'admin', text: m, timestamp: new Date()}], status: 'Pending'} : t))} 
                    onResolve={(id) => setSupportTickets(prev => prev.map(t => t.id === id ? {...t, status: 'Resolved'} : t))} 
                    onDelete={(id) => setSupportTickets(prev => prev.filter(t => t.id !== id))} 
                />
            ),
            [AdminPage.UserOrders]: (
                <MarketManagement 
                    products={marketProducts} 
                    orders={marketOrders} 
                    onAddProduct={(n, p, d) => setMarketProducts(prev => [...prev, {id: Date.now(), name: n, price: p, description: d}])} 
                    onDeleteProduct={(id) => setMarketProducts(prev => prev.filter(p => p.id !== id))} 
                    onMessageUser={handleAdminSendMessage} 
                />
            ),
            [AdminPage.StaffRequirements]: (
                <AdminStaffRequirements 
                    requests={staffRequests} 
                    applications={staffApplications} 
                    jobPosts={jobPosts} 
                    onAddPost={(p) => setJobPosts(prev => [...prev, {...p, id: Date.now(), timestamp: new Date(), status: 'Approved'}])} 
                    onDeletePost={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} 
                    onMarkRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? {...r, isRead: true} : r))} 
                    onMarkAppRead={(id) => setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a))} 
                />
            ),
            [AdminPage.StaffHub]: (
                <AdminStaffHub 
                    jobPosts={jobPosts} 
                    onApprove={(id) => setJobPosts(prev => prev.map(p => p.id === id ? {...p, status: 'Approved'} : p))} 
                    onDelete={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} 
                    onMessage={(phone, text) => {
                        const newMsg: StaffMessage = { id: Date.now(), senderName: 'Admin', recipientPhone: phone, text, timestamp: new Date(), isRead: false };
                        setStaffMessages(prev => [...prev, newMsg]);
                    }}
                    onCreateRestaurantJob={(job) => setRestaurantJobs(prev => [...prev, {...job, id: Date.now(), timestamp: new Date()}])}
                    activeRestaurantJobs={restaurantJobs}
                    onDeleteRestaurantJob={(id) => setRestaurantJobs(prev => prev.filter(j => j.id !== id))}
                />
            ),
            [AdminPage.SubscriptionRenewal]: (
                <SubscriptionRenewal 
                    users={registeredUsers} 
                    onUpdateSubscription={(id, d) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, subscriptionEndDate: d} : u))} 
                />
            ),
        };

        return (
            <>
            {selectedOrderForDelivery && (
                <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4">
                    <div className="bg-gray-900 p-8 rounded-3xl border border-lemon w-full max-w-sm animate-fade-in shadow-2xl">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4">Set Delivery Date</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase mb-6">Item: {selectedOrderForDelivery.productName}</p>
                        <input type="text" placeholder="Ex. 15th Oct, 2024" className="w-full bg-black text-lemon p-4 rounded-xl border border-gray-800 outline-none font-bold mb-6" value={deliveryDateInput} onChange={e => setDeliveryDateInput(e.target.value)} />
                        <div className="flex gap-2">
                             <button onClick={() => setSelectedOrderForDelivery(null)} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-xl text-[10px] uppercase">Cancel</button>
                             <button onClick={handleAcceptMarketOrder} className="flex-1 bg-lemon text-black font-black py-4 rounded-xl text-[10px] uppercase shadow-lg shadow-lemon/20">Accept Order</button>
                        </div>
                    </div>
                </div>
            )}
            <AdminLayout 
                badgeCounts={{ 
                    tickets: supportTickets.filter(t => t.status === 'Open').length, 
                    marketOrders: marketOrders.filter(o => o.status === 'Pending').length 
                }} 
                currentPage={currentAdminPage} 
                setCurrentPage={setCurrentAdminPage} 
                handleLogout={() => { setAuthState('login'); setLoggedInUser(null); }}
            >
                {adminPages[currentAdminPage] || <div className="p-10 text-center">Admin View Error</div>}
            </AdminLayout>
            </>
        );
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const userOrders = orders.filter(o => o && o.restaurantId === loggedInUser.id);
        const pages: Record<string, React.ReactNode> = {
            dashboard: <Dashboard data={dashboardData} orders={userOrders} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: 'Completed'} : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ''} menuItems={loggedInUser.menu} onUpdateOrder={(uo) => setOrders(prev => prev.map(o => o.id === uo.id ? uo : o))} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />,
            billing: <Billing menuItems={loggedInUser.menu} onPrintKOT={handleKOT} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} />,
            online: <OnlineOrders menuItems={loggedInUser.menu} onPrintKOT={handleKOT} />,
            menu: <Menu menu={loggedInUser.menu} setMenu={(m) => { setRegisteredUsers(users => users.map(u => u.id === loggedInUser.id ? {...u, menu: m} : u)); setLoggedInUser({...loggedInUser, menu: m}); }} />,
            qrMenu: <QrMenu menu={loggedInUser.menu} setMenu={(m) => { setRegisteredUsers(users => users.map(u => u.id === loggedInUser.id ? {...u, menu: m} : u)); setLoggedInUser({...loggedInUser, menu: m}); }} loggedInUser={loggedInUser} />,
            market: <Market products={marketProducts} onPlaceOrder={handleMarketOrder} user={loggedInUser} />,
            staffRequirements: <StaffRequirements jobPosts={jobPosts} onSubmitRequirement={handleStaffRequirementSubmit} onMessageStaff={(p, t) => alert(`Message to ${p}: ${t}`)} />,
            staff: <Staff />,
            inventory: <Inventory />,
            reports: <Reports orders={userOrders} />,
            social: <SocialMedia user={loggedInUser} />,
            refer: <Referral user={loggedInUser} />,
            settings: <Settings user={loggedInUser} onSave={(updates) => { setRegisteredUsers(users => users.map(u => u.id === loggedInUser.id ? {...u, ...updates} : u)); setLoggedInUser({...loggedInUser, ...updates}); }} onLogout={() => { setAuthState('login'); setLoggedInUser(null); }} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={(s, m) => setSupportTickets(prev => [...prev, {id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, subject: s, messages: [{sender: 'user', text: m, timestamp: new Date()}], status: 'Open', lastUpdate: new Date()}])} />,
        };
        return (
            <MainLayout 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
                handleLogout={() => { setAuthState('login'); setLoggedInUser(null); }} 
                alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} 
                onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} 
                loggedInUser={loggedInUser}
            >
                {pages[currentPage] || <div className="p-10 text-center">Page Not Found</div>}
            </MainLayout>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4 text-center">
            <h1 className="text-4xl font-black text-lemon uppercase mb-4 tracking-tighter">BaBu SAHAB</h1>
            <p className="text-gray-400 mb-8 max-w-xs uppercase text-[10px] font-bold tracking-widest">Initializing Secure POS environment...</p>
            <button onClick={() => setAuthState('login')} className="bg-lemon text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95">Enter Terminal</button>
        </div>
    );
}

export default App;