
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
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportTickets from './components/admin/SupportTickets';
import MarketManagement from './components/admin/MarketManagement';
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, MenuItem, MarketplaceProduct, MarketplaceOrder } from './types';

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer';
    
    const [authState, setAuthState] = useState<AuthState>(() => {
        if (window.location.hash.startsWith('#customer-order')) return 'customer';
        return 'login';
    });

    const [loggedInUser, setLoggedInUser] = useState<RegisteredUser | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

    const [orders, setOrders] = useState<OrderStatusItem[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_orders') || '[]').map((o: any) => ({...o, timestamp: new Date(o.timestamp)})) );
    const [dashboardData, setDashboardData] = useState<DashboardData>({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
    
    // Admin Managed Marketplace
    const [marketProducts, setMarketProducts] = useState<MarketplaceProduct[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_marketProducts') || '[]'));
    const [marketOrders, setMarketOrders] = useState<MarketplaceOrder[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_marketOrders') || '[]').map((o: any) => ({...o, timestamp: new Date(o.timestamp)})));
    const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<MarketplaceOrder | null>(null);
    const [deliveryDateInput, setDeliveryDateInput] = useState('');

    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
        try {
            const storedUsers = localStorage.getItem('babuSahabPos_users');
            if (storedUsers) {
                return JSON.parse(storedUsers).map((u: any) => ({
                    ...u,
                    taxRate: u.taxRate !== undefined ? Number(u.taxRate) : 5,
                    deliveryCharge: u.deliveryCharge !== undefined ? Number(u.deliveryCharge) : 30,
                    isDeliveryEnabled: u.isDeliveryEnabled !== undefined ? u.isDeliveryEnabled : true,
                    isPrinterEnabled: u.isPrinterEnabled !== undefined ? u.isPrinterEnabled : true,
                    menu: (Array.isArray(u.menu) && u.menu.length > 0) ? u.menu.map((m: any) => ({
                        ...m,
                        offlinePrice: Number(m.offlinePrice) || 0,
                        onlinePrice: Number(m.onlinePrice) || 0,
                        inStock: m.inStock !== undefined ? m.inStock : true,
                    })) : MOCK_MENU_ITEMS
                }));
            }
        } catch (error) {}
        return JSON.parse(JSON.stringify(MOCK_USERS));
    });

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_tickets') || JSON.stringify(MOCK_TICKETS)).map((t: any) => ({...t, lastUpdate: new Date(t.lastUpdate), messages: t.messages.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))})));
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_alerts') || '[]'));
    
    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('babuSahabPos_alerts', JSON.stringify(alerts)); }, [alerts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_marketProducts', JSON.stringify(marketProducts)); }, [marketProducts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_marketOrders', JSON.stringify(marketOrders)); }, [marketOrders]);
    
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

    const handleLogin = (email: string, pass: string): 'ok' | 'pending' | 'blocked' | 'admin' | 'not_found' | 'deleted' => {
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Approved) { setAuthState('loggedIn'); setLoggedInUser(user); return 'ok'; }
            return 'blocked';
        }
        return 'not_found';
    };

    const handleRegister = (newUser: any, referralCode?: string) => {
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

    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;
    
    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} tickets={supportTickets} marketOrders={marketOrders} onApproveReject={handleApproveRejectUser} onApproveMarketOrder={(o) => setSelectedOrderForDelivery(o)} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={(id, b) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, status: b ? UserStatus.Blocked : UserStatus.Approved} : u))} onSendMessage={handleAdminSendMessage} onPasswordChange={(id, p) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, password: p} : u))} onUpdateSubscription={(id, d) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, subscriptionEndDate: d} : u))} onUpdateMenu={(id, m) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, menu: m} : u))} onDeleteUser={(id) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, status: UserStatus.Deleted} : u))} />,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={(id, m) => setSupportTickets(prev => prev.map(t => t.id === id ? {...t, messages: [...t.messages, {sender: 'admin', text: m, timestamp: new Date()}], status: 'Pending'} : t))} onResolve={(id) => setSupportTickets(prev => prev.map(t => t.id === id ? {...t, status: 'Resolved'} : t))} onDelete={(id) => setSupportTickets(prev => prev.filter(t => t.id !== id))} />,
            [AdminPage.Marketplace]: <MarketManagement products={marketProducts} orders={marketOrders} onAddProduct={(n, p, d) => setMarketProducts(prev => [...prev, {id: Date.now(), name: n, price: p, description: d}])} onDeleteProduct={(id) => setMarketProducts(prev => prev.filter(p => p.id !== id))} onMessageUser={handleAdminSendMessage} />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={(id, d) => setRegisteredUsers(users => users.map(u => u.id === id ? {...u, subscriptionEndDate: d} : u))} />,
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
            <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, marketOrders: marketOrders.filter(o => o.status === 'Pending').length }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={() => setAuthState('login')}>{adminPages[currentAdminPage]}</AdminLayout>
            </>
        );
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const userOrders = orders.filter(o => o.restaurantId === loggedInUser.id);
        const pages = {
            dashboard: <Dashboard data={dashboardData} orders={userOrders} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: 'Completed'} : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ''} menuItems={loggedInUser.menu} onUpdateOrder={(uo) => setOrders(prev => prev.map(o => o.id === uo.id ? uo : o))} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />,
            billing: <Billing menuItems={loggedInUser.menu} onPrintKOT={handleKOT} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} />,
            online: <OnlineOrders menuItems={loggedInUser.menu} onPrintKOT={handleKOT} />,
            menu: <Menu menu={loggedInUser.menu} setMenu={(m) => { setRegisteredUsers(users => users.map(u => u.id === loggedInUser.id ? {...u, menu: m} : u)); setLoggedInUser({...loggedInUser, menu: m}); }} />,
            qrMenu: <QrMenu menu={loggedInUser.menu} setMenu={(m) => { setRegisteredUsers(users => users.map(u => u.id === loggedInUser.id ? {...u, menu: m} : u)); setLoggedInUser({...loggedInUser, menu: m}); }} loggedInUser={loggedInUser} />,
            market: <Market products={marketProducts} onPlaceOrder={handleMarketOrder} user={loggedInUser} />,
            staff: <Staff />,
            inventory: <Inventory />,
            reports: <Reports orders={userOrders} />,
            social: <SocialMedia user={loggedInUser} />,
            refer: <Referral user={loggedInUser} />,
            settings: <Settings user={loggedInUser} onSave={(updates) => { setRegisteredUsers(users => users.map(u => u.id === loggedInUser.id ? {...u, ...updates} : u)); setLoggedInUser({...loggedInUser, ...updates}); alert('Saved!'); }} onLogout={() => setAuthState('login')} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={(s, m) => setSupportTickets(prev => [...prev, {id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, subject: s, messages: [{sender: 'user', text: m, timestamp: new Date()}], status: 'Open', lastUpdate: new Date()}])} />,
        };
        return <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={() => setAuthState('login')} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>{pages[currentPage]}</MainLayout>;
    }
    
    return <div>Something went wrong. Please refresh.</div>;
}

export default App;
