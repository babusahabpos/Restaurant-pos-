import { Page, MenuItem, InventoryItem, StaffMember, RegisteredUser, UserStatus, SupportTicket } from './types';

export const NAV_ITEMS: { name: Page; icon: string }[] = [
    { name: 'dashboard', icon: 'dashboard' },
    { name: 'billing', icon: 'billing' },
    { name: 'online', icon: 'online' },
    { name: 'menu', icon: 'menu' },
    { name: 'qrMenu', icon: 'qrCode' },
    { name: 'inventory', icon: 'inventory' },
    { name: 'staff', icon: 'staff' },
    { name: 'reports', icon: 'reports' },
    { name: 'subscription', icon: 'subscription' },
    { name: 'help', icon: 'help' },
    { name: 'settings', icon: 'settings' },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
    { id: 1, name: 'Margherita Pizza', category: 'Pizza', offlinePrice: 250, onlinePrice: 275, inStock: true },
    { id: 2, name: 'Paneer Tikka Pizza', category: 'Pizza', offlinePrice: 350, onlinePrice: 385, inStock: true },
    { id: 3, name: 'Veg Burger', category: 'Burgers', offlinePrice: 120, onlinePrice: 135, inStock: true },
    { id: 4, name: 'French Fries', category: 'Sides', offlinePrice: 90, onlinePrice: 100, inStock: false },
    { id: 5, name: 'Coke', category: 'Beverages', offlinePrice: 40, onlinePrice: 45, inStock: true },
    { id: 6, name: 'Hakka Noodles', category: 'Chinese', offlinePrice: 180, onlinePrice: 200, inStock: true },
    { id: 7, name: 'Manchurian', category: 'Chinese', offlinePrice: 160, onlinePrice: 175, inStock: true },
];

export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
    { id: 1, name: 'Pizza Base', category: 'Bakery', quantity: 50, unit: 'pcs', lowStockThreshold: 20 },
    { id: 2, name: 'Mozzarella Cheese', category: 'Dairy', quantity: 10, unit: 'kg', lowStockThreshold: 5 },
    { id: 3, name: 'Tomato', category: 'Vegetable', quantity: 15, unit: 'kg', lowStockThreshold: 5 },
    { id: 4, name: 'Onion', category: 'Vegetable', quantity: 25, unit: 'kg', lowStockThreshold: 10 },
    { id: 5, name: 'Coca-cola Cans', category: 'Beverages', quantity: 100, unit: 'pcs', lowStockThreshold: 48 },
];

export const MOCK_STAFF: StaffMember[] = [
    { id: 1, name: 'Anil Kumar', role: 'Manager', avatar: 'AK', status: 'Clocked In', lastAction: '26 Jun, 09:00 AM' },
    { id: 2, name: 'Sunita Sharma', role: 'Head Chef', avatar: 'SS', status: 'Clocked Out', lastAction: '25 Jun, 11:00 PM' },
    { id: 3, name: 'Ravi Verma', role: 'Waiter', avatar: 'RV', status: 'On Break', lastAction: '26 Jun, 01:00 PM' },
];

const getFutureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const getPastDate = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];


export const MOCK_USERS: RegisteredUser[] = [
    { 
        id: 1, 
        name: 'Anil Kumar', 
        email: 'user@example.com', 
        phone: '9876543210', 
        password: 'password', 
        restaurantName: 'BaBu SAHAB', 
        address: '123 Food Street, Culinary City, 400001',
        menu: MOCK_MENU_ITEMS,
        status: UserStatus.Approved, 
        lastLogin: '2 hours ago', 
        subscriptionEndDate: getFutureDate(30) 
    },
    { 
        id: 2, 
        name: 'Priya Singh', 
        email: 'priya@pizzapalace.com', 
        phone: '9876543211', 
        password: 'password', 
        restaurantName: 'Pizza Palace', 
        address: '456 Pizza Avenue, Slice Town, 400002',
        menu: [
            { id: 101, name: 'Farmhouse Pizza', category: 'Pizza', offlinePrice: 400, onlinePrice: 440, inStock: true },
            { id: 102, name: 'Garlic Bread', category: 'Sides', offlinePrice: 150, onlinePrice: 165, inStock: true },
        ],
        status: UserStatus.Pending, 
        lastLogin: 'Never', 
        subscriptionEndDate: getFutureDate(5) 
    },
    { 
        id: 3, 
        name: 'Rajesh Gupta', 
        email: 'rajesh@chaipoint.com', 
        phone: '9876543212', 
        password: 'password', 
        restaurantName: 'Chai Point',
        address: '789 Tea Lane, Brew City, 400003',
        menu: [
             { id: 201, name: 'Masala Chai', category: 'Beverages', offlinePrice: 50, onlinePrice: 55, inStock: true },
             { id: 202, name: 'Samosa', category: 'Snacks', offlinePrice: 20, onlinePrice: 25, inStock: true },
        ],
        status: UserStatus.Blocked, 
        lastLogin: '1 month ago', 
        subscriptionEndDate: getPastDate(10) 
    },
];

export const MOCK_TICKETS: SupportTicket[] = [
    { id: 1, userId: 1, userName: 'Anil Kumar', subject: 'Billing Issue', messages: [
        { sender: 'user', text: 'My billing page is not loading correctly.', timestamp: new Date(Date.now() - 3600000) },
        { sender: 'admin', text: 'We are looking into it. Can you please provide a screenshot?', timestamp: new Date(Date.now() - 1800000) }
    ], status: 'Pending', lastUpdate: new Date(Date.now() - 1800000) },
];

export const SALES_BREAKDOWN_DATA = [
    { name: 'Dine-in', value: 15000 },
    { name: 'Takeaway', value: 8000 },
    { name: 'Swiggy', value: 12000 },
    { name: 'Zomato', value: 10500 },
];