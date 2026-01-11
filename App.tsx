
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
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
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportTickets from './components/admin/SupportTickets';
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import MarketManagement from './components/admin/MarketManagement';
import AdminStaffHub from './components/admin/AdminStaffHub';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';
import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, MenuItem, MarketplaceProduct, MarketplaceOrder, StaffJobPost, RestaurantJobPost, StaffRequirementRequest } from './types';

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
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiMessages, setAiMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // --- Persistent Data States ---
    const [orders, setOrders] = useState<OrderStatusItem[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_orders');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_users');
        return saved ? JSON.parse(saved) : MOCK_USERS;
    });

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_tickets');
        return saved ? JSON.parse(saved) : MOCK_TICKETS;
    });

    const [alerts, setAlerts] = useState<AdminAlert[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_alerts');
        return saved ? JSON.parse(saved) : [];
    });

    const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_marketProducts');
        return saved ? JSON.parse(saved) : [];
    });

    const [marketOrders, setMarketOrders] = useState<MarketplaceOrder[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_marketOrders');
        return saved ? JSON.parse(saved) : [];
    });

    const [staffJobPosts, setStaffJobPosts] = useState<StaffJobPost[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_staffJobPosts');
        return saved ? JSON.parse(saved) : [];
    });

    const [restaurantJobs, setRestaurantJobs] = useState<RestaurantJobPost[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_restaurantJobs');
        return saved ? JSON.parse(saved) : [];
    });

    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_staffRequests');
        return saved ? JSON.parse(saved) : [];
    });

    // --- Save to LocalStorage ---
    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('babuSahabPos_alerts', JSON.stringify(alerts)); }, [alerts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_marketProducts', JSON.stringify(marketplaceProducts)); }, [marketplaceProducts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_marketOrders', JSON.stringify(marketOrders)); }, [marketOrders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffJobPosts', JSON.stringify(staffJobPosts)); }, [staffJobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_restaurantJobs', JSON.stringify(restaurantJobs)); }, [restaurantJobs]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffRequests', JSON.stringify(staffRequests)); }, [staffRequests]);

    const handleAiQuery = async (query: string) => {
        if (!query.trim()) return;
        setAiMessages(prev => [...prev, { role: 'user', text: query }]);
        setIsAiLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: query });
            setAiMessages(prev => [...prev, { role: 'ai', text: response.text || "I am currently processing your request." }]);
        } catch (e) {
            setAiMessages(prev => [...prev, { role: 'ai', text: "AI System temporary offline." }]);
        } finally { setIsAiLoading(false); }
    };

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

    const handleRegister = (newUser: any) => {
        const user: RegisteredUser = { ...newUser, id: Date.now(), status: UserStatus.Approved, lastLogin: 'Just Now', subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], menu: MOCK_MENU_ITEMS, taxRate: 5, deliveryCharge: 30, isDeliveryEnabled: true, isPrinterEnabled: true, referralCode: 'REF' + Math.random().toString(36).substring(7).toUpperCase() };
        setRegisteredUsers(prev => [...prev, user]);
    };

    const handleUpdateMenu = (userId: number, menu: MenuItem[]) => {
        setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, menu } : u));
        if (loggedInUser?.id === userId) setLoggedInUser(prev => prev ? { ...prev, menu } : null);
    };

    const handlePrintKOT = (newOrderData: any) => {
        const newOrder: OrderStatusItem = { ...newOrderData, id: Date.now(), restaurantId: loggedInUser?.id || 0, status: 'Preparation', timestamp: new Date() };
        setOrders(prev => [...prev, newOrder]);
    };

    const handlePlaceMarketOrder = (productId: number, productName: string, price: number, quantity: number) => {
        if (!loggedInUser) return;
        const newOrder: MarketplaceOrder = { id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, restaurantName: loggedInUser.restaurantName, productId, productName, price, quantity, status: 'Pending', timestamp: new Date() };
        setMarketOrders(prev => [...prev, newOrder]);
    };

    const handleStaffRequirementSubmit = (req: string, salary: string) => {
        if (!loggedInUser) return;
        const newReq: StaffRequirementRequest = { id: Date.now(), userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: req, salary, timestamp: new Date(), isRead: false };
        setStaffRequests(prev => [...prev, newReq]);
    };

    const dashboardData: DashboardData = {
        onlineSales: orders.filter(o => o.type === 'Online' && o.status === 'Completed').reduce((sum, o) => sum + o.total, 0),
        offlineSales: orders.filter(o => o.type === 'Offline' && o.status === 'Completed').reduce((sum, o) => sum + o.total, 0),
        onlineOrders: orders.filter(o => o.type === 'Online' && o.status === 'Completed').length,
        offlineOrders: orders.filter(o => o.type === 'Offline' && o.status === 'Completed').length,
    };

    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {authState === 'adminLoggedIn' ? (
                <AdminLayout 
                    badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, marketOrders: marketOrders.filter(o => o.status === 'Pending').length }} 
                    currentPage={currentAdminPage} 
                    setCurrentPage={setCurrentAdminPage} 
                    handleLogout={() => setAuthState('login')}
                >
                    {currentAdminPage === AdminPage.Dashboard && <AdminDashboard users={registeredUsers} tickets={supportTickets} marketOrders={marketOrders} onApproveReject={(id, dec) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected } : u))} onApproveMarketOrder={(o) => setMarketOrders(prev => prev.map(mo => mo.id === o.id ? { ...mo, status: 'Accepted' } : mo))} />}
                    {currentAdminPage === AdminPage.UserManagement && <UserManagement users={registeredUsers} onBlockUser={(id, b) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, status: b ? UserStatus.Blocked : UserStatus.Approved } : u))} onSendMessage={(id, m) => setAlerts(prev => [...prev, { id: Date.now(), userId: id, message: m }])} onPasswordChange={(id, p) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, password: p } : u))} onUpdateSubscription={(id, d) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, subscriptionEndDate: d } : u))} onUpdateMenu={handleUpdateMenu} onDeleteUser={(id) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, status: UserStatus.Deleted } : u))} />}
                    {currentAdminPage === AdminPage.SupportTickets && <SupportTickets tickets={supportTickets} onReply={(id, m) => setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, messages: [...t.messages, { sender: 'admin', text: m, timestamp: new Date() }], status: 'Pending' } : t))} onResolve={(id) => setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t))} onDelete={(id) => setSupportTickets(prev => prev.filter(t => t.id !== id))} />}
                    {currentAdminPage === AdminPage.SubscriptionRenewal && <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={(id, d) => setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, subscriptionEndDate: d } : u))} />}
                    {currentAdminPage === AdminPage.UserOrders && <MarketManagement products={marketplaceProducts} orders={marketOrders} onAddProduct={(n, p, d, i) => setMarketplaceProducts(prev => [...prev, { id: Date.now(), name: n, price: p, description: d, image: i }])} onDeleteProduct={(id) => setMarketplaceProducts(prev => prev.filter(p => p.id !== id))} onMessageUser={(id, m) => setAlerts(prev => [...prev, { id: Date.now(), userId: id, message: m }])} />}
                    {currentAdminPage === AdminPage.StaffHub && <AdminStaffHub jobPosts={staffJobPosts} onApprove={(id) => setStaffJobPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved' } : p))} onDelete={(id) => setStaffJobPosts(prev => prev.filter(p => p.id !== id))} onMessage={(ph, txt) => setAlerts(prev => [...prev, { id: Date.now(), userId: 'all', message: `To ${ph}: ${txt}` }])} onCreateRestaurantJob={(j) => setRestaurantJobs(prev => [...prev, { ...j, id: Date.now(), timestamp: new Date() }])} activeRestaurantJobs={restaurantJobs} onDeleteRestaurantJob={(id) => setRestaurantJobs(prev => prev.filter(j => j.id !== id))} staffRequests={staffRequests} onMarkRequestRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r))} />}
                </AdminLayout>
            ) : (
                <MainLayout 
                    currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} 
                    handleLogout={() => setAuthState('login')} 
                    alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser?.id)} 
                    onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} 
                    loggedInUser={loggedInUser!}
                >
                    {currentPage === 'dashboard' && <Dashboard data={dashboardData} orders={orders.filter(o => o.restaurantId === loggedInUser?.id)} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Completed' } : o))} taxRate={loggedInUser?.taxRate || 5} restaurantName={loggedInUser!.restaurantName} address={loggedInUser!.address} fssai={loggedInUser?.fssai || ""} menuItems={loggedInUser!.menu} onUpdateOrder={(o) => setOrders(prev => prev.map(p => p.id === o.id ? o : p))} isPrinterEnabled={loggedInUser?.isPrinterEnabled || true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />}
                    {currentPage === 'billing' && <Billing menuItems={loggedInUser!.menu} onPrintKOT={handlePrintKOT} taxRate={loggedInUser?.taxRate || 5} restaurantName={loggedInUser!.restaurantName} isPrinterEnabled={loggedInUser?.isPrinterEnabled || true} onToggleStock={(id) => handleUpdateMenu(loggedInUser!.id, loggedInUser!.menu.map(m => m.id === id ? { ...m, inStock: !m.inStock } : m))} />}
                    {currentPage === 'online' && <OnlineOrders menuItems={loggedInUser!.menu} onPrintKOT={handlePrintKOT} />}
                    {currentPage === 'menu' && <Menu menu={loggedInUser!.menu} setMenu={(m) => handleUpdateMenu(loggedInUser!.id, m)} />}
                    {currentPage === 'inventory' && <Inventory />}
                    {currentPage === 'staff' && <Staff />}
                    {currentPage === 'staffRequirements' && <StaffRequirements jobPosts={staffJobPosts.filter(p => p.status === 'Approved')} activeRestaurantJobs={restaurantJobs} onSubmitRequirement={handleStaffRequirementSubmit} onMessageStaff={(ph, txt) => alert("Message sent!")} />}
                    {currentPage === 'market' && <Market products={marketplaceProducts} onPlaceOrder={handlePlaceMarketOrder} user={loggedInUser!} />}
                    {currentPage === 'reports' && <Reports orders={orders.filter(o => o.restaurantId === loggedInUser?.id)} />}
                    {currentPage === 'social' && <SocialMedia user={loggedInUser!} />}
                    {currentPage === 'refer' && <Referral user={loggedInUser!} />}
                    {currentPage === 'subscription' && <Subscription />}
                    {currentPage === 'settings' && <Settings user={loggedInUser!} onSave={(updates) => setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser!.id ? { ...u, ...updates } : u))} onLogout={() => setAuthState('login')} />}
                    {currentPage === 'qrMenu' && <QrMenu menu={loggedInUser!.menu} setMenu={(m) => handleUpdateMenu(loggedInUser!.id, m)} loggedInUser={loggedInUser!} />}
                    {currentPage === 'help' && <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser?.id)} onCreateTicket={(s, m, a, at) => setSupportTickets(prev => [...prev, { id: Date.now(), userId: loggedInUser!.id, userName: loggedInUser!.name, subject: s, messages: [{ sender: 'user', text: m, timestamp: new Date(), attachment: a, attachmentType: at }], status: 'Open', lastUpdate: new Date() }])} />}
                </MainLayout>
            )}

            {/* AI Assistant FAB */}
            <div className="fixed bottom-20 right-4 z-[200]">
                {!isAiOpen ? (
                    <button onClick={() => setIsAiOpen(true)} className="w-14 h-14 bg-lemon text-black rounded-full shadow-2xl flex items-center justify-center animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/></svg>
                    </button>
                ) : (
                    <div className="bg-gray-900 w-80 h-96 rounded-3xl border border-lemon shadow-2xl flex flex-col overflow-hidden animate-fade-in">
                        <div className="bg-lemon p-4 flex justify-between items-center">
                            <h3 className="text-black font-black text-xs uppercase">BaBu AI</h3>
                            <button onClick={() => setIsAiOpen(false)} className="text-black font-bold">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                            {aiMessages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] font-bold ${m.role === 'user' ? 'bg-gray-800 text-white' : 'bg-lemon/10 text-lemon border border-lemon/20'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {isAiLoading && <div className="text-lemon text-[10px] animate-pulse p-4 text-center italic">Processing...</div>}
                        </div>
                        <div className="p-3 bg-black border-t border-gray-800 flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Ask me something..." 
                                className="flex-1 bg-gray-900 text-white text-[11px] p-3 rounded-xl outline-none focus:border-lemon border border-transparent"
                                onKeyDown={e => { if(e.key === 'Enter') { handleAiQuery((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
