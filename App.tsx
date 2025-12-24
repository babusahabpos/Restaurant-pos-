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
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportTickets from './components/admin/SupportTickets';
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, TicketMessage, OrderItem, MenuItem } from './types';

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn' | 'customer';
    
    const [authState, setAuthState] = useState<AuthState>(() => {
        if (window.location.hash.startsWith('#customer-order')) {
            return 'customer';
        }
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
                const parsedUsers = JSON.parse(storedUsers);
                return parsedUsers.map((u: any) => ({
                    ...u,
                    taxRate: u.taxRate !== undefined ? Number(u.taxRate) : 5,
                    deliveryCharge: u.deliveryCharge !== undefined ? Number(u.deliveryCharge) : 30,
                    isDeliveryEnabled: u.isDeliveryEnabled !== undefined ? u.isDeliveryEnabled : true,
                    isPrinterEnabled: u.isPrinterEnabled !== undefined ? u.isPrinterEnabled : true,
                    fssai: u.fssai !== undefined ? u.fssai : '',
                    referralCode: u.referralCode ? u.referralCode : `refer${u.restaurantName.replace(/\s+/g, '').toLowerCase()}`,
                    socialMedia: u.socialMedia || {},
                    menu: (Array.isArray(u.menu) && u.menu.length > 0) 
                        ? u.menu.map((m: any) => ({
                            ...m,
                            offlinePrice: Number(m.offlinePrice) || 0,
                            onlinePrice: Number(m.onlinePrice) || 0,
                            inStock: m.inStock !== undefined ? m.inStock : true,
                        })) 
                        : MOCK_MENU_ITEMS
                }));
            }
        } catch (error) {
            console.error("Error loading users", error);
        }
        return JSON.parse(JSON.stringify(MOCK_USERS));
    });

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_tickets') || JSON.stringify(MOCK_TICKETS)).map((t: any) => ({...t, lastUpdate: new Date(t.lastUpdate), messages: t.messages.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))})));
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_alerts') || '[]'));
    
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash.startsWith('#customer-order')) {
                setAuthState('customer');
            }
        };
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
                    if (audio) audio.play().catch(e => console.error("Audio notification failed:", e));
                    localStorage.removeItem(event.key);
                } catch (e) {
                    console.error("Error processing incoming order", e);
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
    
    // --- Dashboard Per-Day Logic: STRICT DAILY FILTER ---
    useEffect(() => {
        if (!loggedInUser) {
            setDashboardData({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
            return;
        };

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
        
        const todaysUserOrders = orders.filter(o => {
            const orderTime = new Date(o.timestamp).getTime();
            return (
                o.restaurantId === loggedInUser.id &&
                orderTime >= startOfToday &&
                orderTime < endOfToday
            );
        });

        const newDashboardData = todaysUserOrders.reduce((acc, order) => {
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
    }, [orders, loggedInUser]);

    const handleLogin = (email: string, pass: string): 'ok' | 'pending' | 'blocked' | 'admin' | 'not_found' | 'deleted' => {
        if (email === 'diptifoodice@gmail.com' && pass === 'suvo1992') {
            setAuthState('adminLoggedIn');
            setLoggedInUser(null);
            return 'admin';
        }
        const user = registeredUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            switch (user.status) {
                case UserStatus.Approved:
                    setAuthState('loggedIn');
                    setLoggedInUser(user);
                    return 'ok';
                case UserStatus.Pending: return 'pending';
                case UserStatus.Blocked: return 'blocked';
                case UserStatus.Rejected: return 'blocked';
                case UserStatus.Deleted: return 'deleted';
            }
        }
        return 'not_found';
    };

    const handleRegister = (newUser: Omit<RegisteredUser, 'id' | 'status' | 'lastLogin' | 'subscriptionEndDate' | 'menu' | 'address' | 'deliveryCharge' | 'isDeliveryEnabled' | 'isPrinterEnabled' | 'taxRate' | 'fssai' | 'referralCode' | 'socialMedia'>, referralCode?: string) => {
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
                setAlerts(prev => [...prev, { id: Date.now() + 1, userId: referrer.id, message: 'Congrats! You earned 1 Month Free Subscription for referring a new user!' }]);
            }
        }
        const user: RegisteredUser = {
            ...newUser,
            id: Date.now(),
            status: UserStatus.Pending,
            lastLogin: 'Never',
            subscriptionEndDate: getFutureDate(30),
            address: 'Please update in settings',
            taxRate: 5,
            deliveryCharge: 30,
            isDeliveryEnabled: true,
            isPrinterEnabled: true,
            fssai: '',
            menu: MOCK_MENU_ITEMS,
            referralCode: generatedReferralCode,
            referredBy: referrerCodeFound,
            socialMedia: { autoPostEnabled: false },
        };
        updatedUsers.push(user);
        setRegisteredUsers(updatedUsers);
    };

    const handleLogout = () => {
        setAuthState('login');
        setLoggedInUser(null);
    };

    const handleKOT = (newOrderData: Omit<OrderStatusItem, 'id' | 'status' | 'timestamp' | 'restaurantId'>) => {
        if (!loggedInUser) return;
        const newOrder: OrderStatusItem = {
            ...newOrderData,
            id: Date.now(),
            restaurantId: loggedInUser.id,
            status: 'Preparation',
            timestamp: new Date()
        };
        setOrders(prev => [...prev, newOrder]);
        const audio = document.getElementById('notification-sound') as HTMLAudioElement;
        if(audio) audio.play();
    };

    const handleCompleteOrder = (orderId: number) => {
        setOrders(prevOrders => prevOrders.map(order => 
            order.id === orderId ? { ...order, status: 'Completed' } : order
        ));
    };

    const handleUpdateOrder = (updatedOrder: OrderStatusItem) => {
        setOrders(prevOrders => prevOrders.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
        ));
    };

    const handleUpdateMenu = (newMenu: MenuItem[]) => {
        if (!loggedInUser) return;
        const sanitizedMenu = newMenu.map(item => ({
            ...item,
            offlinePrice: Number(item.offlinePrice) || 0,
            onlinePrice: Number(item.onlinePrice) || 0,
        }));
        setRegisteredUsers(prevUsers => prevUsers.map(user => user.id === loggedInUser.id ? { ...user, menu: sanitizedMenu } : user));
        setLoggedInUser(prev => prev ? { ...prev, menu: sanitizedMenu } : null);
    };

    const handleSettingsUpdate = (updates: Partial<RegisteredUser>) => {
        if (!loggedInUser) return;
        let finalUpdates = { ...updates };
        if (updates.restaurantName && updates.restaurantName !== loggedInUser.restaurantName) {
             const newReferralCode = `refer${updates.restaurantName.replace(/\s+/g, '').toLowerCase()}`;
             finalUpdates.referralCode = newReferralCode;
        }
        setRegisteredUsers(prev => prev.map(user => user.id === loggedInUser.id ? { ...user, ...finalUpdates } : user));
        setLoggedInUser(prev => prev ? { ...prev, ...finalUpdates } : null);
        alert('Settings updated successfully!');
    };

    const handleDismissAlert = (alertId: number | string) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    };

    if (authState === 'customer') return <CustomerOrderPage />;
    if (authState === 'login') return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={() => true} onContactAdmin={() => {}} />;
    if (authState === 'register') return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;
    
    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} onApproveReject={() => {}} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={() => {}} onSendMessage={() => {}} onPasswordChange={() => {}} onUpdateSubscription={() => {}} onUpdateMenu={() => {}} onDeleteUser={() => {}} />,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={() => {}} onResolve={() => {}} />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={() => {}} />,
        };
        return <AdminLayout currentPage={currentAdminPage} setCurrentPage={setCurrentAdminPage} handleLogout={handleLogout}>{adminPages[currentAdminPage]}</AdminLayout>;
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
            inventory: <Inventory />,
            staff: <Staff />,
            reports: <Reports />,
            social: <SocialMedia user={loggedInUser} />,
            refer: <Referral user={loggedInUser} />,
            settings: <Settings user={loggedInUser} onSave={handleSettingsUpdate} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={() => {}} />,
        };

        return <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)} onDismissAlert={handleDismissAlert} loggedInUser={loggedInUser}>{pages[currentPage]}</MainLayout>;
    }
    
    return <div>Something went wrong. Please refresh.</div>;
}

export default App;