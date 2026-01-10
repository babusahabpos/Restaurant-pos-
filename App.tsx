
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
    const [restaurantJobs, setRestaurantJobs] = useState<RestaurantJobPost[]>([]);
    const [registeredStaff, setRegisteredStaff] = useState<StaffUser[]>([]);
    const [staffMessages, setStaffMessages] = useState<StaffMessage[]>([]);
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(MOCK_USERS);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);

    const handleAiQuery = async (query: string) => {
        if (!query.trim()) return;
        const newMsg = { role: 'user' as const, text: query };
        setAiMessages(prev => [...prev, newMsg]);
        setIsAiLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            
            // Create Context for AI
            const context = `
                System: You are 'BaBu SAHAB AI Assistant' for a restaurant owner. 
                Owner Name: ${loggedInUser?.name}
                Restaurant: ${loggedInUser?.restaurantName}
                Today's Stats: Offline Sales ₹${dashboardData.offlineSales}, Online Sales ₹${dashboardData.onlineSales}.
                Total Orders: ${dashboardData.offlineOrders + dashboardData.onlineOrders}.
                Inventory: ${inventoryItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}.
                Recent Orders: ${orders.slice(-5).map(o => o.sourceInfo).join(', ')}.
                Rule: Keep answers short, professional, and helpful. Use Bengali if the user asks in Bengali.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: context + "\nUser: " + query,
            });

            const aiText = response.text || "Sorry, I couldn't process that.";
            setAiMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        } catch (error) {
            console.error("AI Error:", error);
            setAiMessages(prev => [...prev, { role: 'ai', text: "Error: Could not connect to BaBu SAHAB AI. Please check your internet or API key." }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Initialization logic...
    useEffect(() => {
        const savedOrders = localStorage.getItem('babuSahabPos_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        
        const savedInventory = localStorage.getItem('babuSahabPos_inventoryItems');
        if (savedInventory) setInventoryItems(JSON.parse(savedInventory));
        
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

    const renderAdminPage = () => {
        switch (currentAdminPage) {
            case AdminPage.Dashboard:
                return <AdminDashboard users={registeredUsers} tickets={supportTickets} marketOrders={marketOrders} onApproveReject={() => {}} onApproveMarketOrder={() => {}} />;
            case AdminPage.UserManagement:
                return <UserManagement users={registeredUsers} onBlockUser={() => {}} onSendMessage={() => {}} onPasswordChange={() => {}} onUpdateSubscription={() => {}} onUpdateMenu={() => {}} onDeleteUser={() => {}} />;
            case AdminPage.UserOrders:
                return <MarketManagement products={marketProducts} orders={marketOrders} onAddProduct={(name, price, desc, image) => {
                    const newProd = { id: Date.now(), name, price, description: desc, image };
                    const updated = [...marketProducts, newProd];
                    setMarketProducts(updated);
                    localStorage.setItem('babuSahabPos_marketProducts', JSON.stringify(updated));
                }} onDeleteProduct={(id) => {
                    const updated = marketProducts.filter(p => p.id !== id);
                    setMarketProducts(updated);
                    localStorage.setItem('babuSahabPos_marketProducts', JSON.stringify(updated));
                }} onMessageUser={() => {}} />;
            case AdminPage.SupportTickets:
                return <SupportTickets tickets={supportTickets} onReply={() => {}} onResolve={() => {}} onDelete={() => {}} />;
            case AdminPage.SubscriptionRenewal:
                return <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={() => {}} />;
            case AdminPage.StaffHub:
                return <AdminStaffRequirements 
                            requests={staffRequests} 
                            applications={staffApplications} 
                            jobPosts={jobPosts} 
                            onAddPost={(post) => {
                                const newPost = { ...post, id: Date.now(), timestamp: new Date(), status: 'Approved' };
                                const updated = [...jobPosts, newPost as any];
                                setJobPosts(updated);
                                localStorage.setItem('babuSahabPos_jobPosts', JSON.stringify(updated));
                            }} 
                            onDeletePost={(id) => {
                                const updated = jobPosts.filter(p => p.id !== id);
                                setJobPosts(updated);
                                localStorage.setItem('babuSahabPos_jobPosts', JSON.stringify(updated));
                            }} 
                            onMarkRead={(id) => {
                                const updated = staffRequests.map(r => r.id === id ? { ...r, isRead: true } : r);
                                setStaffRequests(updated);
                                localStorage.setItem('babuSahabPos_staffRequests', JSON.stringify(updated));
                            }} 
                            onMarkAppRead={() => {}} 
                        />;
            default:
                return <AdminDashboard users={registeredUsers} tickets={supportTickets} marketOrders={marketOrders} onApproveReject={() => {}} onApproveMarketOrder={() => {}} />;
        }
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
                    {renderAdminPage()}
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
                    {currentPage === 'dashboard' && <Dashboard data={dashboardData} orders={orders} onCompleteOrder={() => {}} taxRate={5} restaurantName={loggedInUser!.restaurantName} address={loggedInUser!.address} fssai="" menuItems={loggedInUser!.menu} onUpdateOrder={() => {}} isPrinterEnabled={true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />}
                    {currentPage === 'billing' && <Billing menuItems={loggedInUser!.menu} onPrintKOT={() => {}} taxRate={5} restaurantName={loggedInUser!.restaurantName} isPrinterEnabled={true} />}
                    {currentPage === 'menu' && <Menu menu={loggedInUser!.menu} setMenu={() => {}} />}
                    {currentPage === 'inventory' && <Inventory />}
                    {currentPage === 'reports' && <Reports orders={orders} />}
                    {currentPage === 'settings' && <Settings user={loggedInUser!} onSave={() => {}} onLogout={() => setAuthState('login')} />}
                    {currentPage === 'staffRequirements' && <StaffRequirements jobPosts={jobPosts} onSubmitRequirement={(req, sal) => {
                        const newReq = { id: Date.now(), userId: loggedInUser!.id, restaurantName: loggedInUser!.restaurantName, requirement: req, salary: sal, timestamp: new Date(), isRead: false };
                        const updated = [...staffRequests, newReq];
                        setStaffRequests(updated);
                        localStorage.setItem('babuSahabPos_staffRequests', JSON.stringify(updated));
                    }} onMessageStaff={() => {}} />}
                    {currentPage === 'market' && <Market products={marketProducts} onPlaceOrder={(pid, pname, pprice, pqty) => {
                        const newOrder = { id: Date.now(), userId: loggedInUser!.id, userName: loggedInUser!.name, restaurantName: loggedInUser!.restaurantName, productId: pid, productName: pname, price: pprice, quantity: pqty, status: 'Pending', timestamp: new Date() };
                        const updated = [...marketOrders, newOrder as any];
                        setMarketOrders(updated);
                    }} user={loggedInUser!} />}
                    {currentPage === 'staff' && <Staff />}
                    {currentPage === 'qrMenu' && <QrMenu menu={loggedInUser!.menu} setMenu={() => {}} loggedInUser={loggedInUser!} />}
                    {currentPage === 'social' && <SocialMedia user={loggedInUser!} />}
                    {currentPage === 'refer' && <Referral user={loggedInUser!} />}
                    {currentPage === 'subscription' && <Subscription />}
                    {currentPage === 'help' && <HelpAndSupport userTickets={[]} onCreateTicket={() => {}} />}
                </MainLayout>
            )}

            {/* Floating AI Assistant */}
            <div className="fixed bottom-20 right-4 z-[200]">
                {!isAiOpen ? (
                    <button 
                        onClick={() => setIsAiOpen(true)}
                        className="w-14 h-14 bg-lemon text-black rounded-full shadow-2xl flex items-center justify-center animate-bounce hover:scale-110 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                    </button>
                ) : (
                    <div className="bg-gray-900 w-80 h-96 rounded-3xl border border-lemon shadow-2xl flex flex-col overflow-hidden animate-fade-in">
                        <div className="bg-lemon p-4 flex justify-between items-center shrink-0">
                            <h3 className="text-black font-black text-xs uppercase tracking-widest">Business AI</h3>
                            <button onClick={() => setIsAiOpen(false)} className="text-black font-bold">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                            {aiMessages.length === 0 && (
                                <p className="text-gray-500 text-[10px] text-center mt-10 uppercase font-bold">Ask me about your sales, stock, or marketing!</p>
                            )}
                            {aiMessages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] font-bold ${m.role === 'user' ? 'bg-gray-800 text-white' : 'bg-lemon/10 text-lemon border border-lemon/20'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {isAiLoading && <div className="text-lemon text-[10px] animate-pulse">Thinking...</div>}
                        </div>
                        <div className="p-3 bg-black border-t border-gray-800 flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Type message..." 
                                className="flex-1 bg-gray-900 text-white text-[11px] p-3 rounded-xl outline-none focus:border-lemon border border-transparent"
                                onKeyDown={e => e.key === 'Enter' && handleAiQuery((e.target as HTMLInputElement).value)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
