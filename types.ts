
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
    Marketplace = 'Marketplace'
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
    status: 'Pending' | 'Accepted' | 'Cancelled';
    deliveryDate?: string;
    timestamp: Date;
}
