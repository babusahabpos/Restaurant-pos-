
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import OnlineOrders from './components/OnlineOrders';
import Menu from './components/Menu';
import Inventory from './components/Inventory';
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
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import AdminStaffRequirements from './components/admin/AdminStaffRequirements';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, MenuItem, StaffJobPost, StaffRequirementRequest, StaffApplication } from './types';

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer';
    
    const [authState, setAuthState] = useState<AuthState>(() => {
        if (window.location.hash.startsWith('#customer-order')) return 'customer';
        const savedUser = localStorage.getItem('babuSahabPos_loggedInUser');
        const savedAdmin = localStorage.getItem('babuSahabPos_adminLoggedIn');
        if (savedAdmin === 'true') return 'adminLoggedIn';
        if (savedUser) return 'loggedIn';
        return 'login';
    });

    const [loggedInUser, setLoggedInUser] = useState<RegisteredUser | null>(() => {
        const saved = localStorage.getItem('babuSahabPos_loggedInUser');
        return saved ? JSON.parse(saved) : null;
    });

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
                    menu: (Array.isArray(u.menu) && u.menu.length > 0) ? u.menu : MOCK_MENU_ITEMS
                }));
            }
        } catch (error) {}
        return JSON.parse(JSON.stringify(MOCK_USERS));
    });

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_tickets') || JSON.stringify(MOCK_TICKETS)).map((t: any) => ({...t, lastUpdate: new Date(t.lastUpdate), messages: t.messages.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))})));
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_alerts') || '[]'));
    
    const [jobPosts, setJobPosts] = useState<StaffJobPost[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_jobPosts') || '[]'));
    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_staffRequests') || '[]').map((r: any) => ({...r, timestamp: new Date(r.timestamp)})));
    const [staffApplications, setStaffApplications] = useState<StaffApplication[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_staffApplications') || '[]').map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })));

    useEffect(() => {
        const handleHashChange = () => { 
            if (window.location.hash.startsWith('#customer-order')) setAuthState('customer'); 
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key?.startsWith('babuSahabPos_incomingOrder_') && e.newValue) {
                try {
                    const incomingOrder: OrderStatusItem = JSON.parse(e.newValue);
                    incomingOrder.timestamp = new Date(incomingOrder.timestamp);
                    setOrders(prevOrders => [...prevOrders, incomingOrder]);
                    const audio = document.getElementById('notification-sound') as HTMLAudioElement;
                    if (audio) audio.play().catch(() => {});
                    localStorage.removeItem(e.key);
                } catch (err) {}
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
    useEffect(() => { localStorage.setItem('babuSahabPos_staffApplications', JSON.stringify(staffApplications)); }, [staffApplications]);
    
    useEffect(() => {
        if (!loggedInUser) return;
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

    const handleLogin = (email: string, pass: string) => {
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') { 
            setAuthState('adminLoggedIn'); 
            localStorage.setItem('babuSahabPos_adminLoggedIn', 'true');
            return 'admin'; 
        }
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Approved) { 
                setAuthState('loggedIn'); 
                setLoggedInUser(user); 
                localStorage.setItem('babuSahabPos_loggedInUser', JSON.stringify(user));
                return 'ok'; 
            }
            return user.status === UserStatus.Pending ? 'pending' : 'blocked';
        }
        return 'not_found';
    };

    const handleRegister = (newUser: any, referralCode?: string) => {
        const getFutureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const generatedReferralCode = `refer${newUser.restaurantName.replace(/\s+/g, '').toLowerCase()}`;
        let updatedUsers = [...registeredUsers];
        let referrerCodeFound = '';

        if (referralCode) {
            const referrerIndex = updatedUsers.findIndex(u => u.referralCode === referralCode);
            if (referrerIndex !== -1) {
                referrerCodeFound = referralCode;
                const referrer = updatedUsers[referrerIndex];
                const currentEndDate = new Date(referrer.subscriptionEndDate);
                const newEndDate = new Date(currentEndDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                updatedUsers[referrerIndex] = { ...referrer, subscriptionEndDate: newEndDate };
            }
        }

        const user: RegisteredUser = { 
            ...newUser, 
            id: Date.now(), 
            status: UserStatus.Approved, 
            lastLogin: 'Never', 
            subscriptionEndDate: getFutureDate(30), 
            address: '', 
            taxRate: 5, 
            deliveryCharge: 30, 
            isDeliveryEnabled: true, 
            menu: MOCK_MENU_ITEMS, 
            referralCode: generatedReferralCode, 
            referredBy: referrerCodeFound, 
            socialMedia: {} 
        };
        setRegisteredUsers([...updatedUsers, user]);
    };

    const handleLogout = () => { 
        setAuthState('login'); 
        setLoggedInUser(null); 
        localStorage.removeItem('babuSahabPos_loggedInUser');
        localStorage.removeItem('babuSahabPos_adminLoggedIn');
    };

    const handleKOT = (newOrderData: any) => {
        if (!loggedInUser) return;
        const newOrder: OrderStatusItem = { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() };
        setOrders(prev => [...prev, newOrder]);
        const audio = document.getElementById('notification-sound') as HTMLAudioElement;
        if(audio) audio.play().catch(() => {});
    };

    const handleStaffRequirementSubmit = (req: string, salary: string) => {
        if (!loggedInUser) return;
        const newReq: StaffRequirementRequest = { id: Date.now(), userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: req, salary, timestamp: new Date(), isRead: false };
        setStaffRequests(prev => [...prev, newReq]);
    };

    const handleAddStaffPost = (post: any) => {
        setJobPosts(prev => [...prev, { ...post, id: Date.now(), timestamp: new Date(), status: 'Approved' }]);
    };

    const handleCompleteOrder = (orderId: number) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o));
    };

    const handleUpdateOrder = (updatedOrder: OrderStatusItem) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    };

    const handleCreateTicket = (subject: string, message: string, attachment?: string, attachmentType?: 'image' | 'pdf') => {
        if (!loggedInUser) return;
        const newTicket: SupportTicket = {
            id: Date.now(),
            userId: loggedInUser.id,
            userName: loggedInUser.name,
            subject,
            messages: [{ sender: 'user', text: message, timestamp: new Date(), attachment, attachmentType }],
            status: 'Open',
            lastUpdate: new Date(),
        };
        setSupportTickets(prev => [...prev, newTicket]);
    };

    const handleUpdateMenu = (newMenu: MenuItem[]) => {
        if (!loggedInUser) return;
        setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? { ...u, menu: newMenu } : u));
        setLoggedInUser(prev => prev ? { ...prev, menu: newMenu } : null);
    };

    const handleSettingsUpdate = (updates: Partial<RegisteredUser>) => {
        if (!loggedInUser) return;
        setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? { ...u, ...updates } : u));
        setLoggedInUser(prev => prev ? { ...prev, ...updates } : null);
        localStorage.setItem('babuSahabPos_loggedInUser', JSON.stringify({ ...loggedInUser, ...updates }));
    };

    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;
    
    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} onApproveReject={() => {}} tickets={supportTickets} staffRequests={staffRequests} staffApplications={staffApplications} jobPosts={jobPosts} staffUsers={[]} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={() => {}} onSendMessage={() => {}} onPasswordChange={() => {}} onUpdateSubscription={() => {}} onUpdateMenu={() => {}} onDeleteUser={() => {}} />,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={() => {}} onResolve={() => {}} />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={() => {}} />,
            [AdminPage.StaffRequirements]: <AdminStaffRequirements requests={staffRequests} applications={staffApplications} jobPosts={jobPosts} onAddPost={handleAddStaffPost} onDeletePost={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} onMarkRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? {...r, isRead: true} : r))} onMarkAppRead={(id) => setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a))} />,
            /**
             * Added StaffHub entry to resolve indexing errors when currentAdminPage is AdminPage.StaffHub
             */
            [AdminPage.StaffHub]: <AdminStaffRequirements requests={staffRequests} applications={staffApplications} jobPosts={jobPosts} onAddPost={handleAddStaffPost} onDeletePost={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} onMarkRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? {...r, isRead: true} : r))} onMarkAppRead={(id) => setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a))} />,
        };
        // Detailed counts for AdminLayout's badge display
        const staffReqsCount = staffRequests.filter(r => !r.isRead).length;
        const staffAppsCount = staffApplications.filter(a => !a.isRead).length;
        return <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, staffReqs: staffReqsCount, staffApps: staffAppsCount }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>{adminPages[currentAdminPage as keyof typeof adminPages] || null}</AdminLayout>;
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const pages = {
            dashboard: <Dashboard data={dashboardData} orders={orders.filter(o => o.restaurantId === loggedInUser.id)} onCompleteOrder={handleCompleteOrder} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ''} menuItems={loggedInUser.menu} onUpdateOrder={handleUpdateOrder} isPrinterEnabled={true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />,
            billing: <Billing menuItems={loggedInUser.menu} onPrintKOT={handleKOT} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={true} />,
            online: <OnlineOrders menuItems={loggedInUser.menu} onPrintKOT={handleKOT} />,
            menu: <Menu menu={loggedInUser.menu} setMenu={handleUpdateMenu} />,
            qrMenu: <QrMenu menu={loggedInUser.menu} setMenu={() => {}} loggedInUser={loggedInUser} />,
            staffRequirements: <StaffRequirements jobPosts={jobPosts.filter(p => p.status === 'Approved')} onSubmitRequirement={handleStaffRequirementSubmit} onMessageStaff={() => {}} />,
            inventory: <Inventory />,
            reports: <Reports />,
            social: <SocialMedia user={loggedInUser} />,
            refer: <Referral user={loggedInUser} />,
            settings: <Settings user={loggedInUser} onSave={handleSettingsUpdate} onLogout={handleLogout} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={handleCreateTicket} />,
        };

        return <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} loggedInUser={loggedInUser}>{pages[currentPage as keyof typeof pages]}</MainLayout>;
    }
    
    return null;
}

export default App;
