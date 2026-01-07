
import React from 'react';
import { RegisteredUser, UserStatus, SupportTicket, MarketplaceOrder } from '../../types';

interface AdminDashboardProps {
    users: RegisteredUser[];
    tickets: SupportTicket[];
    marketOrders: MarketplaceOrder[];
    onApproveReject: (userId: number, decision: 'approve' | 'reject') => void;
    onApproveMarketOrder: (order: MarketplaceOrder) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, tickets, marketOrders = [], onApproveReject, onApproveMarketOrder }) => {

    const pendingUsers = users.filter(u => u.status === UserStatus.Pending);
    const pendingMarketOrders = marketOrders.filter(o => o.status === 'Pending');

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Clients</p>
                    <p className="text-3xl font-black text-white mt-1">{users.filter(u => u.status === UserStatus.Approved).length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Market Orders</p>
                    <p className="text-3xl font-black text-lemon mt-1">{pendingMarketOrders.length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Open Tickets</p>
                    <p className="text-3xl font-black text-blue-500 mt-1">{tickets.filter(t => t.status === 'Open').length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Global Users</p>
                    <p className="text-3xl font-black text-white mt-1">{users.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                <div className="p-6 bg-gray-900 rounded-[2.5rem] border border-gray-800 flex flex-col min-h-[400px]">
                    <h3 className="mb-6 text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">Registration Queue</h3>
                    <div className="space-y-4">
                        {pendingUsers.length > 0 ? pendingUsers.map(user => (
                            <div key={user.id} className="p-5 bg-black border border-gray-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-lemon shadow-lg">
                                <div className="text-center sm:text-left flex-1">
                                    <p className="font-black text-white uppercase text-sm leading-tight">{user.restaurantName}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{user.name} • {user.phone}</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => onApproveReject(user.id, 'approve')} className="flex-1 sm:flex-none bg-lemon text-black font-black py-2.5 px-6 rounded-2xl text-[10px] uppercase">Approve</button>
                                    <button onClick={() => onApproveReject(user.id, 'reject')} className="flex-1 sm:flex-none bg-gray-800 text-white font-black py-2.5 px-6 rounded-2xl text-[10px] uppercase">Reject</button>
                                </div>
                            </div>
                        )) : <p className="text-center py-20 text-gray-600 font-black uppercase text-xs tracking-widest">Queue is clear</p>}
                    </div>
                </div>

                <div className="p-6 bg-gray-900 rounded-[2.5rem] border border-gray-800 flex flex-col min-h-[400px]">
                    <h3 className="mb-6 text-xl font-black text-lemon uppercase tracking-tight flex items-center gap-2">New Market Orders</h3>
                    <div className="space-y-4">
                        {pendingMarketOrders.length > 0 ? pendingMarketOrders.map(order => (
                            <div key={order.id} className="p-5 bg-black border border-gray-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-lemon shadow-lg">
                                <div className="text-center sm:text-left flex-1">
                                    <p className="font-black text-lemon uppercase text-sm leading-tight">{order.productName}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{order.restaurantName} • {order.userName}</p>
                                    <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">QTY: {order.quantity} • Total: ₹{order.price * order.quantity}</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => onApproveMarketOrder(order)} className="flex-1 sm:flex-none bg-lemon text-black font-black py-2.5 px-6 rounded-2xl text-[10px] uppercase">Accept & Delivery Date</button>
                                </div>
                            </div>
                        )) : <p className="text-center py-20 text-gray-600 font-black uppercase text-xs tracking-widest">No new orders</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
