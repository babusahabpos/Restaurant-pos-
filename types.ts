
export type Page = 
    'dashboard' | 
    'billing' | 
    'online' | 
    'menu' | 
    'inventory' | 
    'reports' | 
    'subscription' | 
    'help' | 
    'qrMenu' | 
    'settings' | 
    'social' | 
    'refer' |
    'staff' | 
    'staffRequirements' |
    'market'; 

export interface MenuItem {
    id: number;
    name: string;
    category: string;
    offlinePrice: number;
    onlinePrice: number;
    inStock: boolean;
    image?: string; 
}

export interface OrderItem extends MenuItem {
    quantity: number;
}

export interface OrderStatusItem {
    id: number;
    restaurantId: number;
    type: 'Online' | 'Offline';
    status: 'Placed' | 'Preparation' | 'Completed';
    items: OrderItem[];
    total: number;
    discount?: number;
    sourceInfo: string;
    timestamp: Date;
    deliveryDetails?: {
        type: 'Pickup' | 'Delivery';
        customerName: string;
        phone: string;
        address?: string;
        paymentMethod: string;
        deliveryCharge: number;
    };
}

export interface DashboardData {
    onlineSales: number;
    offlineSales: number;
    onlineOrders: number;
    offlineOrders: number;
}

export enum AdminPage {
    Dashboard = 'Admin Dashboard',
    UserManagement = 'User Management',
    SupportTickets = 'Support Tickets',
    SubscriptionRenewal = 'Subscription Renewal',
    UserOrders = 'User Orders',
    StaffHub = 'Staff Hub'
}

export enum UserStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Blocked = 'Blocked',
    Deleted = 'Deleted',
}

export interface RegisteredUser {
    id: number;
    name: string;
    phone: string;
    email: string;
    password: string;
    restaurantName: string;
    address: string;
    taxRate: number;
    deliveryCharge: number;
    isDeliveryEnabled: boolean;
    isPrinterEnabled?: boolean;
    fssai?: string;
    menu: MenuItem[];
    status: UserStatus;
    lastLogin: string;
    subscriptionEndDate: string; 
    referralCode?: string;
    referredBy?: string; 
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        autoPostEnabled?: boolean;
    };
}

export interface TicketMessage {
    sender: 'user' | 'admin';
    text: string;
    timestamp: Date;
    attachment?: string; 
    attachmentType?: 'image' | 'pdf';
}

export interface SupportTicket {
    id: number;
    userId: number;
    userName: string;
    restaurantName: string;
    subject: string;
    messages: TicketMessage[];
    status: 'Open' | 'Pending' | 'Resolved';
    lastUpdate: Date;
}

export interface AdminAlert {
    id: number | string;
    userId: number | 'all';
    message: string;
}

// Marketplace Types
export interface MarketplaceProduct {
    id: number;
    name: string;
    price: number;
    description: string;
    image?: string;
}

export interface MarketplaceOrder {
    id: number;
    userId: number;
    userName: string;
    restaurantName: string;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    status: 'Pending' | 'Accepted' | 'Cancelled' | 'Out of Stock' | 'Delivered';
    deliveryDate?: string;
    timestamp: Date;
}

// Inventory Types
export interface InventoryItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
}

// Staff Types
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

export interface StaffRequirementRequest {
    id: number;
    userId: number;
    restaurantName: string;
    requirement: string;
    salary: string;
    timestamp: Date;
    isRead: boolean;
}

export interface StaffJobPost {
    id: number;
    staffName: string;
    category: string;
    phone: string;
    location: string;
    cvDetails: string;
    timestamp: Date;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface StaffApplication {
    id: number;
    staffName: string;
    phone: string;
    category: string;
    location: string;
    cvDetails: string;
    timestamp: Date;
    isRead: boolean;
}

export interface RestaurantJobPost {
    id: number;
    restaurantName: string;
    address: string;
    category: string;
    salary: string;
    phone: string;
    timestamp: Date;
}

export interface StaffUser {
    id: number;
    name: string;
    phone: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    isBlocked: boolean;
    registeredAt: Date;
}

export interface StaffMessage {
    id: number;
    senderName: string;
    recipientPhone: string;
    text: string;
    timestamp: Date;
    isRead: boolean;
}