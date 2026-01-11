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
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiMessages, setAiMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // --- Data States ---
    const [orders, setOrders] = useState<OrderStatusItem[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData>({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
    const [marketProducts, setMarketProducts] = useState<MarketplaceProduct[]>([]);
    const [marketOrders, setMarketOrders] = useState<MarketplaceOrder[]>([]);
    const [jobPosts, setJobPosts] = useState<StaffJobPost[]>([]);
    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>([]);
    const [staffApplications, setStaffApplications] = useState<StaffApplication[]>([]);
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(MOCK_USERS);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);

    const handleAiQuery = async (query: string) => {
        if (!query.trim()) return;
        const newMsg = { role: 'user' as const, text: query };
        setAiMessages(prev => [...prev, newMsg]);
        setIsAiLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: "You are the BaBu SAHAB AI Assistant. Answer this restaurant business query concisely: " + query,
            });
            const aiText = response.text || "I'm sorry, I couldn't generate a response.";
            setAiMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        } catch (error) {
            console.error("AI Error:", error);
            setAiMessages(prev => [...prev, { role: 'ai', text: "AI Service is temporarily unavailable." }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    useEffect(() => {
        const savedOrders = localStorage.getItem('babuSahabPos_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        
        const savedMarket = localStorage.getItem('babuSahabPos_marketProducts');
        if (savedMarket) setMarketProducts(JSON.parse(savedMarket));

        const savedJobPosts = localStorage.getItem('babuSahabPos_jobPosts');
        if (savedJobPosts) setJobPosts(JSON.parse(savedJobPosts));

        const savedRequests = localStorage.getItem('babuSahabPos_staffRequests');
        if (savedRequests) setStaffRequests(JSON.parse(savedRequests));
    }, []);

    const handleLogin = (email: string, pass: string) => {
        const trimmedEmail = email.trim().toLowerCase();
        if (trimmedEmail === 'diptifoodice@gmail.com' && pass === 'suvo1992') { 
            setAuthState('adminLoggedIn'); 
            return 'admin'; 
        }
        const user = registeredUsers.find(u => u.email.trim().toLowerCase() === trimmedEmail && u.password === pass);
        if (user) {
            setAuthState('loggedIn'); 
            setLoggedInUser(user); 
            return 'ok'; 
        }
        return 'not_found';
    };

    const handleRegister = (newUser: any) => {
        const user: RegisteredUser = { ...newUser, id: Date.now(), status: UserStatus.Approved, lastLogin: 'Just Now', subscriptionEndDate: '2025-12-31', menu: MOCK_MENU_ITEMS };
        setRegisteredUsers([...registeredUsers, user]);
    };

    const onUpdateOrder = (updatedOrder: OrderStatusItem) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
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
                    {currentAdminPage === AdminPage.Dashboard && <AdminDashboard users={registeredUsers} tickets={supportTickets} marketOrders={marketOrders} onApproveReject={() => {}} onApproveMarketOrder={() => {}} />}
                    {currentAdminPage === AdminPage.UserManagement && <UserManagement users={registeredUsers} onBlockUser={() => {}} onSendMessage={() => {}} onPasswordChange={() => {}} onUpdateSubscription={() => {}} onUpdateMenu={() => {}} onDeleteUser={() => {}} />}
                </AdminLayout>
            ) : (
                <MainLayout 
                    currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} 
                    handleLogout={() => setAuthState('login')} 
                    alerts={alerts} 
                    onDismissAlert={() => {}} 
                    loggedInUser={loggedInUser!}
                >
                    {currentPage === 'dashboard' && <Dashboard data={dashboardData} orders={orders} onCompleteOrder={() => {}} taxRate={5} restaurantName={loggedInUser!.restaurantName} address={loggedInUser!.address} fssai="" menuItems={loggedInUser!.menu} onUpdateOrder={onUpdateOrder} isPrinterEnabled={true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />}
                    {currentPage === 'billing' && <Billing menuItems={loggedInUser!.menu} onPrintKOT={() => {}} taxRate={5} restaurantName={loggedInUser!.restaurantName} isPrinterEnabled={true} />}
                    {currentPage === 'menu' && <Menu menu={loggedInUser!.menu} setMenu={() => {}} />}
                    {currentPage === 'settings' && <Settings user={loggedInUser!} onSave={() => {}} onLogout={() => setAuthState('login')} />}
                    {currentPage === 'qrMenu' && <QrMenu menu={loggedInUser!.menu} setMenu={() => {}} loggedInUser={loggedInUser!} />}
                    {currentPage === 'help' && <HelpAndSupport userTickets={[]} onCreateTicket={() => {}} />}
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