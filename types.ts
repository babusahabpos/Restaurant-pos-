// FIX: Removed circular import of 'Page' type.
export type Page = 
    'dashboard' | 
    'billing' | 
    'online' | 
    'menu' | 
    'inventory' | 
    'staff' | 
    'reports' | 
    'subscription' | 
    'help' | 
    'qrMenu' |
    'settings';

export interface MenuItem {
    id: number;
    name: string;
    category: string;
    offlinePrice: number;
    onlinePrice: number;
    inStock: boolean;
}

export interface OrderItem extends MenuItem {
    quantity: number;
}

export interface OrderStatusItem {
    id: number;
    restaurantId: number;
    type: 'Online' | 'Offline';
    status: 'Preparation' | 'Completed';
    items: OrderItem[];
    total: number;
    sourceInfo: string; // e.g., "Swiggy #12345" or "Table: 5"
    timestamp: Date;
}

export interface DashboardData {
    onlineSales: number;
    offlineSales: number;
    onlineOrders: number;
    offlineOrders: number;
}

export interface InventoryItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
}

export interface StaffMember {
    id: number;
    name: string;
    role: string;
    avatar: string;
    status: 'Clocked In' | 'Clocked Out' | 'On Break';
    lastAction: string;
}

export interface StaffLogEntry {
    id: number;
    staffId: number;
    staffName: string;
    action: 'Clock In' | 'Clock Out' | 'Take Break' | 'End Break' | 'Absent';
    timestamp: Date;
}

export enum AdminPage {
    Dashboard = 'Admin Dashboard',
    UserManagement = 'User Management',
    SupportTickets = 'Support Tickets',
    SubscriptionRenewal = 'Subscription Renewal',
}

export enum UserStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Blocked = 'Blocked',
}

export interface RegisteredUser {
    id: number;
    name: string;
    phone: string;
    email: string;
    password: string; // Added password field
    restaurantName: string;
    address: string;
    menu: MenuItem[];
    status: UserStatus;
    lastLogin: string;
    subscriptionEndDate: string; // ISO Date String
}

export interface TicketMessage {
    sender: 'user' | 'admin';
    text: string;
    timestamp: Date;
}

export interface SupportTicket {
    id: number;
    userId: number;
    userName: string;
    subject: string;
    messages: TicketMessage[];
    status: 'Open' | 'Pending' | 'Resolved';
    lastUpdate: Date;
}

export interface AdminAlert {
    id: number | string;
    userId: number | 'all'; // Target a specific user or all users
    message: string;
}