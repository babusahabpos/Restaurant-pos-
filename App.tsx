
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
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportTickets from './components/admin/SupportTickets';
import SubscriptionRenewal from './components/admin/SubscriptionRenewal';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MENU_ITEMS } from './constants';

import { Page, OrderStatusItem, DashboardData, AdminPage, RegisteredUser, UserStatus, SupportTicket, AdminAlert, TicketMessage, OrderItem, MenuItem } from './types';

function App() {
    type AuthState = 'login' | 'register' | 'loggedIn' | 'adminLoggedIn';
    const [authState, setAuthState] = useState<AuthState>('login');
    const [loggedInUser, setLoggedInUser] = useState<RegisteredUser | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>(AdminPage.Dashboard);

    // --- State Management ---
    const [orders, setOrders] = useState<OrderStatusItem[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_orders') || '[]').map((o: any) => ({...o, timestamp: new Date(o.timestamp)})) );
    const [dashboardData, setDashboardData] = useState<DashboardData>({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
    
    // Robust user loading with data migration for missing menus and sanitizing prices
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
        try {
            const storedUsers = localStorage.getItem('babuSahabPos_users');
            if (storedUsers) {
                const parsedUsers = JSON.parse(storedUsers);
                // Ensure every user has a menu property (migration fix) and valid prices and delivery settings
                return parsedUsers.map((u: any) => ({
                    ...u,
                    taxRate: u.taxRate !== undefined ? Number(u.taxRate) : 5, // Default to 5% if missing
                    deliveryCharge: u.deliveryCharge !== undefined ? Number(u.deliveryCharge) : 30, // Default delivery charge
                    isDeliveryEnabled: u.isDeliveryEnabled !== undefined ? u.isDeliveryEnabled : true, // Default delivery enabled
                    fssai: u.fssai !== undefined ? u.fssai : '', // Default empty FSSAI
                    menu: (Array.isArray(u.menu) && u.menu.length > 0) 
                        ? u.menu.map((m: any) => ({
                            ...m,
                            // Force prices to be numbers to prevent .toFixed crashes
                            offlinePrice: Number(m.offlinePrice) || 0,
                            onlinePrice: Number(m.onlinePrice) || 0,
                            inStock: m.inStock !== undefined ? m.inStock : true
                        })) 
                        : MOCK_MENU_ITEMS
                }));
            }
        } catch (error) {
            console.error("Error loading users from local storage", error);
        }
        return JSON.parse(JSON.stringify(MOCK_USERS));
    });

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_tickets') || JSON.stringify(MOCK_TICKETS)).map((t: any) => ({...t, lastUpdate: new Date(t.lastUpdate), messages: t.messages.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))})));
    const [alerts, setAlerts] = useState<AdminAlert[]>(() => JSON.parse(localStorage.getItem('babuSahabPos_alerts') || '[]'));
    
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // Check for new individual orders
            if (event.key?.startsWith('babuSahabPos_incomingOrder_') && event.newValue) {
                try {
                    const incomingOrder: OrderStatusItem = JSON.parse(event.newValue);
                    // Re-hydrate date objects
                    incomingOrder.timestamp = new Date(incomingOrder.timestamp);
                    
                    // Add the new order to the state
                    setOrders(prevOrders => [...prevOrders, incomingOrder]);
                    
                    // Play notification sound
                    const audio = document.getElementById('notification-sound') as HTMLAudioElement;
                    if (audio) audio.play().catch(e => console.error("Audio notification failed:", e));

                    // IMPORTANT: Remove the specific order key from localStorage to prevent re-processing
                    localStorage.removeItem(event.key);

                } catch (e) {
                    console.error("Error processing incoming order from localStorage", e);
                    // Also remove the key if parsing fails to avoid it being stuck
                    if (event.key) {
                        localStorage.removeItem(event.key);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // --- Persistence Effects ---
    useEffect(() => { localStorage.setItem('babuSahabPos_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('babuSahabPos_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
    useEffect(() => { localStorage.setItem('babuSahabPos_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('babuSahabPos_alerts', JSON.stringify(alerts)); }, [alerts]);
    
    // --- Derived State & Logic ---
    useEffect(() => {
        if (!loggedInUser) {
            setDashboardData({ onlineSales: 0, offlineSales: 0, onlineOrders: 0, offlineOrders: 0 });
            return;
        };

        const today = new Date();
        today.setHours(0,0,0,0);
        
        const todaysUserOrders = orders.filter(o => 
            o.restaurantId === loggedInUser.id &&
            new Date(o.timestamp) >= today
        );

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
                        message: 'Subscription Renewal: Your plan is expiring soon. Please renew to avoid service interruption.'
                    });
                }
            });
            return newAlerts;
        });
    }, [registeredUsers]);

    // --- Handlers ---

    const handleLogin = (email: string, pass: string): 'ok' | 'pending' | 'blocked' | 'admin' | 'not_found' => {
        // Updated Admin Credentials
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
                case UserStatus.Pending:
                    return 'pending';
                case UserStatus.Blocked:
                    return 'blocked';
                case UserStatus.Rejected:
                    return 'blocked'; // Treat rejected as blocked for login purposes
            }
        }
        return 'not_found';
    };

    const handleRegister = (newUser: Omit<RegisteredUser, 'id' | 'status' | 'lastLogin' | 'subscriptionEndDate' | 'menu' | 'address' | 'deliveryCharge' | 'isDeliveryEnabled' | 'taxRate' | 'fssai'>) => {
        const getFutureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const user: RegisteredUser = {
            ...newUser,
            id: Date.now(),
            status: UserStatus.Pending,
            lastLogin: 'Never',
            subscriptionEndDate: getFutureDate(30), // Default 30 day trial
            address: 'Please update in settings',
            taxRate: 5, // Default tax rate
            deliveryCharge: 30, // Default delivery charge
            isDeliveryEnabled: true,
            fssai: '', // Default empty FSSAI
            menu: MOCK_MENU_ITEMS, // Start with a default menu
        };
        setRegisteredUsers(prev => [...prev, user]);
    };

    const handleForgotPassword = (identifier: string): boolean => {
        // Check for Admin email for password reset simulation
        if (identifier === 'diptifoodice@gmail.com') {
             alert(`A password reset link has been sent to ${identifier}. (Simulation)`);
             return true;
        }

        const user = registeredUsers.find(u => u.email === identifier || u.phone === identifier);
        if (user) {
            alert(`A password reset link has been sent to ${user.email}. (Simulation)`);
            return true;
        } else {
            alert("User not found.");
            return false;
        }
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

    const handleCreateTicket = (subject: string, message: string) => {
        if (!loggedInUser) return;
        const newTicket: SupportTicket = {
            id: Date.now(),
            userId: loggedInUser.id,
            userName: loggedInUser.name,
            subject: subject,
            messages: [{ sender: 'user', text: message, timestamp: new Date() }],
            status: 'Open',
            lastUpdate: new Date(),
        };
        setSupportTickets(prev => [...prev, newTicket]);
    };

    const handleUpdateMenu = (newMenu: MenuItem[]) => {
        if (!loggedInUser) return;
        // Ensure new menu items also have numeric prices to avoid future issues
        const sanitizedMenu = newMenu.map(item => ({
            ...item,
            offlinePrice: Number(item.offlinePrice) || 0,
            onlinePrice: Number(item.onlinePrice) || 0
        }));

        setRegisteredUsers(prevUsers => 
            prevUsers.map(user => 
                user.id === loggedInUser.id ? { ...user, menu: sanitizedMenu } : user
            )
        );
        // Also update loggedInUser state to reflect changes immediately
        setLoggedInUser(prev => prev ? { ...prev, menu: sanitizedMenu } : null);
    };

    const handleSettingsUpdate = (updates: Partial<RegisteredUser>) => {
        if (!loggedInUser) return;
        setRegisteredUsers(prev => prev.map(user => 
            user.id === loggedInUser.id ? { ...user, ...updates } : user
        ));
        setLoggedInUser(prev => prev ? { ...prev, ...updates } : null);
        alert('Settings updated successfully!');
    };
    
    const handleDismissAlert = (alertId: number | string) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    };

    // --- Admin Handlers ---
    const handleApproveRejectUser = (userId: number, decision: 'approve' | 'reject') => {
        setRegisteredUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, status: decision === 'approve' ? UserStatus.Approved : UserStatus.Rejected } : user
        ));
        const user = registeredUsers.find(u => u.id === userId);
        if (user) {
            const message = decision === 'approve' ? `Your account has been approved. You can now log in.` : `Your account has been rejected.`;
            handleAdminSendMessage(userId, message);
        }
    };

    const handleBlockUser = (userId: number, shouldBlock: boolean) => {
        setRegisteredUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, status: shouldBlock ? UserStatus.Blocked : UserStatus.Approved } : user
        ));
    };

    const handleAdminSendMessage = (userId: number | 'all', message: string) => {
        const newAlert = {
            id: Date.now(),
            userId,
            message
        };
        setAlerts(prev => [...prev, newAlert]);
        alert(`Message sent!`);
    };
    
    const handlePasswordChange = (userId: number, newPass: string) => {
        setRegisteredUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, password: newPass } : user
        ));
        alert('Password updated successfully!');
    };
    
    const handleUpdateSubscription = (userId: number, newDate: string) => {
        setRegisteredUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, subscriptionEndDate: newDate } : user
        ));
        alert('Subscription date updated!');
    };
    
    const handleTicketReply = (ticketId: number, message: string) => {
        setSupportTickets(prev => prev.map(ticket => {
            if (ticket.id === ticketId) {
                return {
                    ...ticket,
                    messages: [...ticket.messages, { sender: 'admin', text: message, timestamp: new Date() }],
                    status: 'Pending',
                    lastUpdate: new Date()
                };
            }
            return ticket;
        }));
    };
    
    const handleResolveTicket = (ticketId: number) => {
        setSupportTickets(prev => prev.map(ticket =>
            ticket.id === ticketId ? { ...ticket, status: 'Resolved' } : ticket
        ));
    };


    // --- Render Logic ---

    if (authState === 'login') {
        return <Login onLogin={handleLogin} onNavigateToRegister={() => setAuthState('register')} onForgotPassword={handleForgotPassword} />;
    }
    if (authState === 'register') {
        return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthState('login')} />;
    }
    
    if (authState === 'adminLoggedIn') {
        const adminPages = {
            [AdminPage.Dashboard]: <AdminDashboard users={registeredUsers} onApproveReject={handleApproveRejectUser} />,
            [AdminPage.UserManagement]: <UserManagement users={registeredUsers} onBlockUser={handleBlockUser} onSendMessage={handleAdminSendMessage} onPasswordChange={handlePasswordChange} onUpdateSubscription={handleUpdateSubscription}/>,
            [AdminPage.SupportTickets]: <SupportTickets tickets={supportTickets} onReply={handleTicketReply} onResolve={handleResolveTicket} />,
            [AdminPage.SubscriptionRenewal]: <SubscriptionRenewal users={registeredUsers} onUpdateSubscription={handleUpdateSubscription} />,
        };

        return (
            <AdminLayout currentPage={currentAdminPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout}>
                {adminPages[currentAdminPage]}
            </AdminLayout>
        );
    }

    if (authState === 'loggedIn' && loggedInUser) {
        const userOrders = orders.filter(o => o.restaurantId === loggedInUser.id);
        
        // Ensure menu is an array and filter out malformed items to prevent crashes
        const safeMenu = (Array.isArray(loggedInUser.menu) ? loggedInUser.menu : MOCK_MENU_ITEMS).filter(item => item && item.name && item.category);

        const pages = {
            dashboard: <Dashboard 
                data={dashboardData} 
                orders={userOrders} 
                onCompleteOrder={handleCompleteOrder} 
                taxRate={loggedInUser.taxRate || 5} 
                restaurantName={loggedInUser.restaurantName}
                address={loggedInUser.address}
                fssai={loggedInUser.fssai || ''}
                menuItems={safeMenu}
                onUpdateOrder={handleUpdateOrder}
            />,
            billing: <Billing 
                menuItems={safeMenu} 
                onPrintKOT={handleKOT} 
                taxRate={loggedInUser.taxRate || 5} 
                restaurantName={loggedInUser.restaurantName}
            />,
            online: <OnlineOrders menuItems={safeMenu} onPrintKOT={handleKOT} />,
            menu: <Menu menu={safeMenu} setMenu={handleUpdateMenu} />,
            qrMenu: <QrMenu menu={safeMenu} setMenu={handleUpdateMenu} loggedInUser={loggedInUser} />,
            inventory: <Inventory />,
            staff: <Staff />,
            reports: <Reports />,
            settings: <Settings user={loggedInUser} onSave={handleSettingsUpdate} />,
            subscription: <Subscription />,
            help: <HelpAndSupport userTickets={supportTickets.filter(t => t.userId === loggedInUser.id)} onCreateTicket={handleCreateTicket} />,
        };

        return (
            <MainLayout
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                handleLogout={handleLogout}
                alerts={alerts.filter(a => a.userId === 'all' || a.userId === loggedInUser.id)}
                onDismissAlert={handleDismissAlert}
                loggedInUser={loggedInUser}
            >
                {pages[currentPage]}
            </MainLayout>
        );
    }
    
    return <div>Something went wrong. Please refresh.</div>;
}

export default App;
