
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
import StaffRequirements from './components/StaffRequirements';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportTickets from './components/admin/SupportTickets';
import AdminStaffRequirements from './components/admin/AdminStaffRequirements';
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, StaffJobPost, StaffRequirementRequest, MenuItem } from './types';

// Helper for pure KOT Printing (No Amounts)
const triggerKOTPrint = (orderData: any) => {
    const kotContent = `
        <style>
            body { font-family: 'Courier New', monospace; font-size: 11pt; width: 80mm; margin: 0; padding: 5px; color: black; }
            .center { text-align: center; }
            h3 { margin: 5px 0; border-bottom: 1px solid black; padding-bottom: 5px; }
            p { margin: 2px 0; }
            hr { border: none; border-top: 1px dashed black; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 6px 2px; text-align: left; border-bottom: 1px dashed #eee; }
            .qty { text-align: center; width: 60px; font-weight: 900; font-size: 1.2em; }
            .item-name { font-weight: 900; font-size: 1.1em; }
        </style>
        <div class="center">
            <h3>KITCHEN ORDER TICKET</h3>
            <p><strong>${orderData.sourceInfo}</strong></p>
            <p>DATE: ${new Date().toLocaleDateString()}</p>
            <p>TIME: ${new Date().toLocaleTimeString()}</p>
        </div>
        <hr>
        <table>
            <thead><tr><th>ITEM NAME</th><th class="qty">QTY</th></tr></thead>
            <tbody>
                ${orderData.items.map((i: any) => `
                    <tr>
                        <td class="item-name">${i.name.toUpperCase()}</td>
                        <td class="qty">${i.quantity}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <hr>
        <div class="center" style="margin-top: 15px;">
            <p>*** NO PRICE ON KOT ***</p>
            <p>*** KITCHEN COPY ***</p>
        </div>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<html><head><title>KOT</title></head><body>' + kotContent + '</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    }
};

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
                    menu: (Array.isArray(u.menu) && u.menu.length > 0) ? u.menu : MOCK_MENU_ITEMS
                }));
            }
        } catch (error) {}
        return JSON.parse(JSON.stringify(MOCK_USERS));
    });

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_tickets') || JSON.stringify(MOCK_TICKETS)).map((t: any) => ({...t, lastUpdate: new Date(t.lastUpdate), messages: t.messages.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))})));
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_alerts') || '[]'));
    
    // Staff Hub State
    const [jobPosts, setJobPosts] = useState<StaffJobPost[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_jobPosts') || '[]'));
    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_staffRequests') || '[]'));

    useEffect(() => {
        const handleHashChange = () => { if (window.location.hash.startsWith('#customer-order')) setAuthState('customer'); };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key?.startsWith('babuSahabPos_incomingOrder_') && event.newValue) {
                try {
                    const incomingOrder: OrderStatusItem = JSON.parse(event.newValue);
                    incomingOrder.timestamp = new Date(incomingOrder.timestamp);
                    setOrders(prevOrders => [...prevOrders, incomingOrder]);
                    const audio = document.getElementById('notification-sound') as HTMLAudioElement;
                    if (audio) audio.play().catch(() => {});
                    localStorage.removeItem(event.key);
                } catch (e) {
                    if (event.key) localStorage.removeItem(event.key);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('babuSahabPos_alerts', JSON.stringify(alerts)); }, [alerts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_jobPosts', JSON.stringify(jobPosts)); }, [jobPosts]);
    useEffect(() => { localStorage.setItem('babuSahabPos_staffRequests', JSON.stringify(staffRequests)); }, [staffRequests]);
    
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

    const handleLogin = (email: string, pass: string): any => {
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Approved) { setAuthState('loggedIn'); setLoggedInUser(user); return 'ok'; }
            return user.status.toLowerCase();
        }
        return 'not_found';
    };

    const handleRegister = (newUser: any, referralCode?: string) => {
        const getFutureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const user: RegisteredUser = { ...newUser, id: Date.now(), status: UserStatus.Pending, lastLogin: 'Never', subscriptionEndDate: getFutureDate(30), address: 'Update in settings', taxRate: 5, deliveryCharge: 30, isDeliveryEnabled: true, isPrinterEnabled: true, menu: MOCK_MENU_ITEMS, referralCode: `refer${newUser.restaurantName.replace(/\s+/g, '').toLowerCase()}`, socialMedia: { autoPostEnabled: false } };
        setRegisteredUsers(prev => [...prev, user]);
    };

    const handleLogout = () => { setAuthState('login'); setLoggedInUser(null); };

    const handleKOT = (newOrderData: any) => {
        if (!loggedInUser) return;
        const newOrder: OrderStatusItem = { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() };
        setOrders(prev => [...prev, newOrder]);
        if (loggedInUser.isPrinterEnabled) triggerKOTPrint(newOrderData);
        const audio = document.getElementById('notification-sound') as HTMLAudioElement;
        if(audio) audio.play();
    };

    const handleStaffRequirementSubmit = (req: string, salary: string) => {
        if (!loggedInUser) return;
        const newReq: StaffRequirementRequest = { id: Date.now(), userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: req, salary: salary, timestamp: new Date(), isRead: false };
        setStaffRequests(prev => [...prev, newReq]);
        const audio = document.getElementById('notification-sound') as HTMLAudioElement;
        if (audio) audio.play().catch(() => {});
    };

    const handleAddStaffPost = (post: any) => {
        const newPost: StaffJobPost = { ...post, id: Date.now(), timestamp: new Date() };
        setJobPosts(prev => [...prev, newPost]);
    };

    const handleTicketReply = (ticketId: number, message: string) => {
        setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, { sender: 'admin', text: message, timestamp: new Date() }], status: 'Pending', lastUpdate: new Date() } : t));
    };

    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;
    
    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} onApproveReject={(id, dec) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: dec === 'approve' ? UserStatus.Approved : UserStatus.Rejected} : u))} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={(id, b) => setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: b ? UserStatus.Blocked : UserStatus.Approved} : u))} onSendMessage={() => {}} onPasswordChange={() => {}} onUpdateSubscription={() => {}} onUpdateMenu={() => {}} onDeleteUser={() => {}} />,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={handleTicketReply} onResolve={(id) => setSupportTickets(prev => prev.map(t => t.id === id ? {...t, status: 'Resolved'} : t))} />,
            [AdminPage.StaffRequirements]: <AdminStaffRequirements 
                requests={staffRequests} 
                jobPosts={jobPosts} 
                onAddPost={handleAddStaffPost} 
                onDeletePost={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))}
                onMarkRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? {...r, isRead: true} : r))}
            />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={() => {}} />,
        };
        return <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, staffReqs: staffRequests.filter(r => !r.isRead).length }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>{adminPages[currentAdminPage]}</AdminLayout>;
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const userOrders = orders.filter(o => o.restaurantId === loggedInUser.id);
        const safeMenu = (Array.isArray(loggedInUser.menu) ? loggedInUser.menu : MOCK_MENU_ITEMS).filter(item => item && item.name && item.category);

        const pages = {
            dashboard: <Dashboard data={dashboardData} orders={userOrders} onCompleteOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: 'Completed'} : o))} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ''} menuItems={safeMenu} onUpdateOrder={(upd) => setOrders(prev => prev.map(o => o.id === upd.id ? upd : o))} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />,
            billing: <Billing menuItems={safeMenu} onPrintKOT={handleKOT} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} />,
            online: <OnlineOrders menuItems={safeMenu} onPrintKOT={handleKOT} />,
            menu: <Menu menu={safeMenu} setMenu={(m) => { setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? {...u, menu: m} : u)); setLoggedInUser(prev => prev ? {...prev, menu: m} : null); }} />,
            qrMenu: <QrMenu menu={safeMenu} setMenu={() => {}} loggedInUser={loggedInUser} />,
            staffRequirements: <StaffRequirements jobPosts={jobPosts} onSubmitRequirement={handleStaffRequirementSubmit} />,
            inventory: <Inventory />,
            staff: <Staff />,
            reports: <Reports />,
            social: <SocialMedia user={loggedInUser} />,
            refer: <Referral user={loggedInUser} />,
            settings: <Settings user={loggedInUser} onSave={(upd) => { setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? {...u, ...upd} : u)); setLoggedInUser(prev => prev ? {...prev, ...upd} : null); }} onLogout={handleLogout} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={(sub, text) => setSupportTickets(prev => [...prev, { id: Date.now(), userId: loggedInUser.id, userName: loggedInUser.name, subject: sub, messages: [{ sender: 'user', text, timestamp: new Date() }], status: 'Open', lastUpdate: new Date() }])} />,
        };

        return <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>{pages[currentPage]}</MainLayout>;
    }
    
    return <div>Something went wrong. Please refresh.</div>;
}

export default App;
