
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

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, StaffJobPost, StaffRequirementRequest, StaffApplication, MenuItem } from './types';

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
    
    const [jobPosts, setJobPosts] = useState<StaffJobPost[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_jobPosts') || '[]'));
    const [staffRequests, setStaffRequests] = useState<StaffRequirementRequest[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_staffRequests') || '[]').map((r: any) => ({...r, timestamp: new Date(r.timestamp)})));
    const [staffApplications, setStaffApplications] = useState<StaffApplication[]>(() => {
        const saved = localStorage.getItem('babuSahabPos_staffApplications');
        if (saved) {
            return JSON.parse(saved).map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }));
        }
        return [];
    });

    useEffect(() => {
        const handleHashChange = () => { 
            if (window.location.hash.startsWith('#customer-order')) setAuthState('customer'); 
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'babuSahabPos_staffApplications') {
                const latest = localStorage.getItem('babuSahabPos_staffApplications');
                if (latest) {
                    setStaffApplications(JSON.parse(latest).map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })));
                }
            }
            if (e.key === 'babuSahabPos_jobPosts') {
                const latest = localStorage.getItem('babuSahabPos_jobPosts');
                if (latest) {
                    setJobPosts(JSON.parse(latest).map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) })));
                }
            }
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
        if (authState === 'adminLoggedIn') {
            const totalNotifications = 
                supportTickets.filter(t => t.status === 'Open').length + 
                staffRequests.filter(r => !r.isRead).length +
                staffApplications.filter(a => !a.isRead).length;
            document.title = totalNotifications > 0 ? `(${totalNotifications}) Admin Panel` : 'Admin Panel';
        } else {
            document.title = 'BaBu SAHAB POS';
        }
    }, [authState, supportTickets, staffRequests, staffApplications]);

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
                    newAlerts.push({ id: alertId, userId: user.id, message: 'Subscription Renewal: Your plan is expiring soon.' });
                }
            });
            return newAlerts;
        });
    }, [registeredUsers]);

    const handleLogin = (email: string, pass: string): 'ok' | 'pending' | 'blocked' | 'admin' | 'not_found' | 'deleted' => {
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') { setAuthState('adminLoggedIn'); return 'admin'; }
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.status === UserStatus.Approved) { setAuthState('loggedIn'); setLoggedInUser(user); return 'ok'; }
            return user.status === UserStatus.Pending ? 'pending' : user.status === UserStatus.Blocked ? 'blocked' : user.status === UserStatus.Deleted ? 'deleted' : 'blocked';
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
                setAlerts(prev => [...prev, { id: Date.now() + 1, userId: referrer.id, message: 'Congrats! You earned 1 Month Free Subscription!' }]);
            }
        }

        const user: RegisteredUser = { 
            ...newUser, 
            id: Date.now(), 
            status: UserStatus.Pending, 
            lastLogin: 'Never', 
            subscriptionEndDate: getFutureDate(30), 
            address: 'Update in settings', 
            taxRate: 5, 
            deliveryCharge: 30, 
            isDeliveryEnabled: true, 
            isPrinterEnabled: true, 
            menu: MOCK_MENU_ITEMS, 
            referralCode: generatedReferralCode, 
            referredBy: referrerCodeFound, 
            socialMedia: { autoPostEnabled: false } 
        };
        setRegisteredUsers([...updatedUsers, user]);
    };

    const handleForgotPassword = (identifier: string): boolean => {
        const user = registeredUsers.find(u => u.email === identifier || u.phone === identifier);
        if (user || identifier === 'diptifoodice@gmail.com') {
            alert(`A password reset link has been sent. (Simulation)`);
            return true;
        }
        alert("User not found.");
        return false;
    };

    const handleGuestMessage = (email: string, message: string) => {
        setAlerts(prev => [...prev, { id: Date.now(), userId: 'all', message: `[Guest] From: ${email} - ${message}` }]);
    };

    const handleLogout = () => { setAuthState('login'); setLoggedInUser(null); };

    const handleKOT = (newOrderData: any) => {
        if (!loggedInUser) return;
        const newOrder: OrderStatusItem = { ...newOrderData, id: Date.now(), restaurantId: loggedInUser.id, status: 'Preparation', timestamp: new Date() };
        setOrders(prev => [...prev, newOrder]);
        const audio = document.getElementById('notification-sound') as HTMLAudioElement;
        if(audio) audio.play().catch(() => {});
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
        const sanitizedMenu = newMenu.map(m => ({ ...m, offlinePrice: Number(m.offlinePrice) || 0, onlinePrice: Number(m.onlinePrice) || 0 }));
        setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? { ...u, menu: sanitizedMenu } : u));
        setLoggedInUser(prev => prev ? { ...prev, menu: sanitizedMenu } : null);
    };

    const handleSettingsUpdate = (updates: Partial<RegisteredUser>) => {
        if (!loggedInUser) return;
        const finalUpdates = { ...updates };
        if (updates.restaurantName && updates.restaurantName !== loggedInUser.restaurantName) {
             finalUpdates.referralCode = `refer${updates.restaurantName.replace(/\s+/g, '').toLowerCase()}`;
        }
        setRegisteredUsers(prev => prev.map(u => u.id === loggedInUser.id ? { ...u, ...finalUpdates } : u));
        setLoggedInUser(prev => prev ? { ...prev, ...finalUpdates } : null);
        alert('Settings updated!');
    };

    const handleDismissAlert = (alertId: number | string) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    };

    const handleStaffRequirementSubmit = (req: string, salary: string) => {
        if (!loggedInUser) return;
        const newReq: StaffRequirementRequest = { id: Date.now(), userId: loggedInUser.id, restaurantName: loggedInUser.restaurantName, requirement: req, salary, timestamp: new Date(), isRead: false };
        setStaffRequests(prev => [...prev, newReq]);
    };

    const handleAddStaffPost = (post: any) => {
        setJobPosts(prev => [...prev, { ...post, id: Date.now(), timestamp: new Date() }]);
    };

    const handleMarkAppRead = (id: number) => {
        setStaffApplications(prev => prev.map(a => a.id === id ? {...a, isRead: true} : a));
    };

    const handleApproveRejectUser = (id: number, decision: 'approve' | 'reject') => {
        setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: decision === 'approve' ? UserStatus.Approved : UserStatus.Rejected} : u));
    };
    const handleBlockUser = (id: number, b: boolean) => {
        setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: b ? UserStatus.Blocked : UserStatus.Approved} : u));
    };
    const handleDeleteUser = (id: number) => {
        setRegisteredUsers(prev => prev.map(u => u.id === id ? {...u, status: UserStatus.Deleted} : u));
    };
    const handleAdminSendMessage = (userId: number | 'all', message: string) => {
        setAlerts(prev => [...prev, { id: Date.now(), userId, message }]);
    };
    const handlePasswordChange = (userId: number, newPass: string) => {
        setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPass } : u));
    };
    const handleUpdateSubscription = (userId: number, newDate: string) => {
        setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionEndDate: newDate } : u));
    };
    const handleAdminUpdateMenu = (userId: number, menu: MenuItem[]) => {
        setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, menu } : u));
    };
    const handleTicketReply = (id: number, msg: string) => {
        setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, messages: [...t.messages, { sender: 'admin', text: msg, timestamp: new Date() }], status: 'Pending', lastUpdate: new Date() } : t));
    };
    const handleResolveTicket = (id: number) => {
        setSupportTickets(prev => prev.map(t => t.id === id ? {...t, status: 'Resolved'} : t));
    };

    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={handleForgotPassword} onContactAdmin={handleGuestMessage} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;
    
    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} onApproveReject={handleApproveRejectUser} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={handleBlockUser} onSendMessage={handleAdminSendMessage} onPasswordChange={handlePasswordChange} onUpdateSubscription={handleUpdateSubscription} onUpdateMenu={handleAdminUpdateMenu} onDeleteUser={handleDeleteUser} />,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={handleTicketReply} onResolve={handleResolveTicket} />,
            [AdminPage.StaffRequirements]: <AdminStaffRequirements requests={staffRequests} applications={staffApplications} jobPosts={jobPosts} onAddPost={handleAddStaffPost} onDeletePost={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} onMarkRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? {...r, isRead: true} : r))} onMarkAppRead={handleMarkAppRead} />,
            /**
             * Added StaffHub page handling for admin to resolve indexing errors
             */
            [AdminPage.StaffHub]: <AdminStaffRequirements requests={staffRequests} applications={staffApplications} jobPosts={jobPosts} onAddPost={handleAddStaffPost} onDeletePost={(id) => setJobPosts(prev => prev.filter(p => p.id !== id))} onMarkRead={(id) => setStaffRequests(prev => prev.map(r => r.id === id ? {...r, isRead: true} : r))} onMarkAppRead={handleMarkAppRead} />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={handleUpdateSubscription} />,
        };
        // Detailed counts for AdminLayout's badge display
        const staffReqsCount = staffRequests.filter(r => !r.isRead).length;
        const staffAppsCount = staffApplications.filter(a => !a.isRead).length;
        return <AdminLayout badgeCounts={{ tickets: supportTickets.filter(t => t.status === 'Open').length, staffReqs: staffReqsCount, staffApps: staffAppsCount }} currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>{adminPages[currentAdminPage]}</AdminLayout>;
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const userOrders = orders.filter(o => o.restaurantId === loggedInUser.id);
        const safeMenu = (Array.isArray(loggedInUser.menu) ? loggedInUser.menu : MOCK_MENU_ITEMS).filter(item => item && item.name && item.category);

        const pages = {
            dashboard: <Dashboard data={dashboardData} orders={userOrders} onCompleteOrder={handleCompleteOrder} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} address={loggedInUser.address} fssai={loggedInUser.fssai || ''} menuItems={safeMenu} onUpdateOrder={handleUpdateOrder} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} onNavigateToQrMenu={() => setCurrentPage('qrMenu')} />,
            billing: <Billing menuItems={safeMenu} onPrintKOT={handleKOT} taxRate={loggedInUser.taxRate || 5} restaurantName={loggedInUser.restaurantName} isPrinterEnabled={loggedInUser.isPrinterEnabled ?? true} />,
            online: <OnlineOrders menuItems={safeMenu} onPrintKOT={handleKOT} />,
            menu: <Menu menu={safeMenu} setMenu={handleUpdateMenu} />,
            qrMenu: <QrMenu menu={safeMenu} setMenu={handleUpdateMenu} loggedInUser={loggedInUser} />,
            staff: <Staff />,
            staffRequirements: <StaffRequirements jobPosts={jobPosts} onSubmitRequirement={handleStaffRequirementSubmit} />,
            inventory: <Inventory />,
            reports: <Reports />,
            social: <SocialMedia user={loggedInUser} />,
            refer: <Referral user={loggedInUser} />,
            settings: <Settings user={loggedInUser} onSave={handleSettingsUpdate} onLogout={handleLogout} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={handleCreateTicket} />,
        };

        return <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={handleDismissAlert} loggedInUser={loggedInUser}>{pages[currentPage]}</MainLayout>;
    }
    
    return <div>Something went wrong. Please refresh.</div>;
}

export default App;
