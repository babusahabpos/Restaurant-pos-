import { Page, MenuItem, RegisteredUser, UserStatus, SupportTicket, InventoryItem, StaffMember } from './types';

export const NAV_ITEMS: { name: Page; icon: string }[] = [
    { name: 'dashboard', icon: 'dashboard' },
    { name: 'billing', icon: 'billing' },
    { name: 'online', icon: 'online' },
    { name: 'menu', icon: 'menu' },
    { name: 'qrMenu', icon: 'qrCode' },
    { name: 'inventory', icon: 'inventory' },
    { name: 'staffRequirements', icon: 'staff' },
    { name: 'staff', icon: 'staff' },
    { name: 'market', icon: 'market' }, // Moved below staff
    { name: 'reports', icon: 'reports' },
    { name: 'social', icon: 'social' }, 
    { name: 'refer', icon: 'refer' }, 
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
];

export const MOCK_USERS: RegisteredUser[] = [
    { 
        id: 1, 
        name: 'Anil Kumar', 
        email: 'user@example.com', 
        phone: '9876543210', 
        password: 'password', 
        restaurantName: 'BaBu SAHAB', 
        address: '123 Food Street, Culinary City, 400001',
        taxRate: 5,
        deliveryCharge: 40,
        isDeliveryEnabled: true,
        isPrinterEnabled: true,
        fssai: '12345678901234',
        menu: MOCK_MENU_ITEMS,
        status: UserStatus.Approved, 
        lastLogin: '2 hours ago', 
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        referralCode: 'referbabusahab',
        socialMedia: { instagram: '@babusahab', facebook: 'BaBu SAHAB Official' }
    },
];

export const MOCK_TICKETS: SupportTicket[] = [
    { id: 1, userId: 1, userName: 'Anil Kumar', subject: 'Billing Issue', messages: [
        { sender: 'user', text: 'My billing page is not loading correctly.', timestamp: new Date(Date.now() - 3600000) },
        { sender: 'admin', text: 'We are looking into it.', timestamp: new Date(Date.now() - 1800000) }
    ], status: 'Pending', lastUpdate: new Date(Date.now() - 1800000) },
];

export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
    { id: 1, name: 'Tomato', category: 'Vegetables', quantity: 10, unit: 'kg', lowStockThreshold: 5 },
    { id: 2, name: 'Cheese', category: 'Dairy', quantity: 2, unit: 'kg', lowStockThreshold: 3 },
    { id: 3, name: 'Flour', category: 'Pantry', quantity: 20, unit: 'kg', lowStockThreshold: 10 },
];

export const MOCK_STAFF: StaffMember[] = [
    { id: 1, name: 'Rahul Sharma', role: 'Head Chef', avatar: 'RS', status: 'Clocked Out', lastAction: 'Never' },
    { id: 2, name: 'Priya Singh', role: 'Waitress', avatar: 'PS', status: 'Clocked In', lastAction: '2 hours ago' },
];