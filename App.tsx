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
import Subscription from './components/Subscription';
import HelpAndSupport from './components/HelpAndSupport';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportTickets from './components/admin/SupportTickets';
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import { MOCK_USERS, MOCK_TICKETS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, TicketMessage } from './types';

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn';
    const [authState, setAuthState] = useState<AuthState>('login');
    const [loggedInUser, setLoggedInUser] = useState<RegisteredUser | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

    // --- State Management ---
    const [orders, setOrders] = useState<OrderStatusItem[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_orders') || '[]').map((o: any) => ({...o, timestamp: new Date(o.timestamp)})) );
    const [dashboardData, setDashboardData] = useState<DashboardData>({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_users') || JSON.stringify(MOCK_USERS)));
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_tickets') || JSON.stringify(MOCK_TICKETS)).map((t: any) => ({...t, lastUpdate: new Date(t.lastUpdate), messages: t.messages.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))})));
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_alerts') || '[]'));

    // --- Persistence Effects ---
    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('babuSahabPos_alerts', JSON.stringify(alerts)); }, [alerts]);

    // --- Derived State & Logic ---
    useEffect(() => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const todaysOrders = orders.filter(o => o.timestamp >= today);

        const newDashboardData = todaysOrders.reduce((acc, order) => {
            if (order.status === 'Completed') {
                if (order.type === 'Online') {
                    acc.onlineSales += order.total;
                    acc.onlineOrders += 1;
                } else {
                    acc.offlineSales += order.total;
                    acc.offlineOrders += 1;
                }
            }
            return acc;
        }, { onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });

        setDashboardData(newDashboardData);
    }, [orders]);

    // Subscription renewal alert logic
    useEffect(() => {
        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const usersToAlert = registeredUsers.filter(user => {
            if (user.status !== UserStatus.Approved) return false;
            const endDate = new Date(user.subscriptionEndDate);
            return endDate <= sevenDaysFromNow && endDate >= today;
        });

        setAlerts(prevAlerts => {
            const newAlerts = [...prevAlerts];
            usersToAlert.forEach(user => {
                const alertId = `renewal-${user.id}`;
                if (!newAlerts.some(a => a.id === alertId)) {
                    newAlerts.push({
                        id: alertId,
                        userId: user.id,
                        message: 'SUBSCRIPTION RENEWAL: Your plan is expiring soon. Please renew to avoid service interruption.'
                    });
                }
            });
            return newAlerts;
        });
    }, [registeredUsers]);
    
    // --- Handlers ---
    const handleLogin = (email: string, pass: string): 'ok' | 'pending' | 'blocked' | 'admin' | 'not_found' => {
        if (email.toLowerCase() === 'admin@example.com') {
            setAuthState('adminLoggedIn');
            return 'admin';
        }
        const user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Pending) return 'pending';
            if (user.status === UserStatus.Blocked) return 'blocked';
            if (user.status === UserStatus.Approved) {
                setLoggedInUser(user);
                setAuthState('loggedIn');
                return 'ok';
            }
        }
        return 'not_found';
    };

    const handleRegister = (newUser: Omit<RegisteredUser, 'id' | 'status' | 'lastLogin' | 'subscriptionEndDate'>) => {
        // New users get 30 days trial by default
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);
        
        setRegisteredUsers(prev => [...prev, {
            ...newUser,
            id: Date.now(),
            status: UserStatus.Pending,
            lastLogin: 'Never',
            subscriptionEndDate: trialEndDate.toISOString().split('T')[0]
        }]);
        setAuthState('login');
    };

    const handleForgotPasswordRequest = (identifier: string) => {
        const user = registeredUsers.find(u => u.email === identifier || u.phone === identifier);
        if (!user) {
            alert('No user found with that email or phone number.');
            return false;
        }
        const newTicket: SupportTicket = {
            id: Date.now(),
            userId: user.id,
            userName: user.name,
            subject: 'PASSWORD RESET REQUEST',
            messages: [{ sender: 'user', text: `User ${user.name} (${user.email}) has requested a password reset.`, timestamp: new Date() }],
            status: 'Open',
            lastUpdate: new Date(),
        };
        setSupportTickets(prev => [newTicket, ...prev]);
        alert('Password reset request sent. Admin will review your request and contact you.');
        return true;
    };

    const handlePasswordChange = (userId: number, newPass: string) => {
        setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPass } : u));
        alert('Password updated successfully!');
    };
    
    const handleUpdateSubscription = (userId: number, newDate: string) => {
        setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionEndDate: newDate } : u));
        alert('Subscription date updated successfully!');
    };


    const handleLogout = () => {
        setLoggedInUser(null);
        setAuthState('login');
    };

    const handlePrintKOT = (newOrder: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp'>) => {
        setOrders(prev => [{ ...newOrder, id: Date.now(), status: 'Preparation', timestamp: new Date() }, ...prev]);
    };
    
    const handleCompleteOrder = (orderId: number) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o));
    };

    const handleUserApproval = (userId: number, decision: 'approve' | 'reject') => {
        setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, status: decision === 'approve' ? UserStatus.Approved : UserStatus.Rejected } : u));
    };
    
    const handleUserBlock = (userId: number, shouldBlock: boolean) => {
         setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, status: shouldBlock ? UserStatus.Blocked : UserStatus.Approved } : u));
    };

    const handleSendMessage = (userId: number | 'all', message: string) => {
        setAlerts(prev => [...prev, { id: Date.now(), userId, message }]);
        alert('Message sent!');
    };
    
    const handleDismissAlert = (alertId: number | string) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    };
    
    const handleCreateTicket = (subject: string, message: string) => {
        if (!loggedInUser) return;
        const newTicket: SupportTicket = {
            id: Date.now(),
            userId: loggedInUser.id,
            userName: loggedInUser.name,
            subject,
            messages: [{ sender: 'user', text: message, timestamp: new Date() }],
            status: 'Open',
            lastUpdate: new Date(),
        };
        setSupportTickets(prev => [newTicket, ...prev]);
    };

    const handleReplyTicket = (ticketId: number, message: string) => {
        setSupportTickets(prev => prev.map(t => t.id === ticketId ? {
            ...t,
            status: 'Pending', // Pending user reply
            lastUpdate: new Date(),
            messages: [...t.messages, { sender: 'admin', text: message, timestamp: new Date() }]
        } : t));
    };

    const handleResolveTicket = (ticketId: number) => {
        setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t));
    };
    
    // --- Render Logic ---
    const userAlerts = loggedInUser ? alerts.filter(a => a.userId === loggedInUser.id || a.userId === 'all') : [];

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard data={dashboardData} orders={orders} />;
            case 'billing': return <Billing onPrintKOT={handlePrintKOT} />;
            case 'online': return <OnlineOrders onPrintKOT={handlePrintKOT} />;
            case 'menu': return <Menu />;
            case 'inventory': return <Inventory />;
            case 'staff': return <Staff />;
            case 'reports': return <Reports />;
            case 'settings': return <Settings />;
            case 'subscription': return <Subscription />;
            case 'help': return <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser?.id)} onCreateTicket={handleCreateTicket} />;
            default: return <Dashboard data={dashboardData} orders={orders} />;
        }
    };

    const renderAdminPage = () => {
        switch (currentAdminPage) {
            case AdminPage.Dashboard: return <AdminDashboard users={registeredUsers} onApproveReject={handleUserApproval} />;
            case AdminPage.UserManagement: return <UserManagement users={registeredUsers} onBlockUser={handleUserBlock} onSendMessage={handleSendMessage} onPasswordChange={handlePasswordChange} onUpdateSubscription={handleUpdateSubscription} />;
            case AdminPage.SupportTickets: return <SupportTickets tickets={supportTickets} onReply={handleReplyTicket} onResolve={handleResolveTicket} />;
            case AdminPage.SubscriptionRenewal: return <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={handleUpdateSubscription} />;
            default: return <AdminDashboard users={registeredUsers} onApproveReject={handleUserApproval} />;
        }
    };

    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={handleForgotPasswordRequest} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;
    if (authState === 'adminLoggedIn') return <AdminLayout currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>{renderAdminPage()}</AdminLayout>;
    
    return (
        <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={userAlerts} onDismissAlert={handleDismissAlert}>
            {renderPage()}
        </MainLayout>
    );
}

export default App;