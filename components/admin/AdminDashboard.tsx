
import React from 'react';
import { RegisteredUser, UserStatus, SupportTicket, MarketplaceOrder } from '../../types';

interface AdminDashboardProps {
    users: RegisteredUser[];
    tickets: SupportTicket[];
    marketOrders: MarketplaceOrder[];
    onApproveReject: (userId: number, decision: 'approve' | 'reject') => void;
    onApproveMarketOrder: (order: MarketplaceOrder) => void;
    syncStatus?: { time: string; error: boolean };
    onDeepRecovery?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users = [], tickets = [], marketOrders = [], onApproveReject, onApproveMarketOrder, syncStatus, onDeepRecovery }) => {

    const pendingUsers = users.filter(u => u.status === UserStatus.Pending);
    const pendingMarketOrders = marketOrders.filter(o => o.status === 'Pending');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Sync Header */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className={`w-4 h-4 rounded-full ${syncStatus?.error ? 'bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-lemon shadow-[0_0_15px_rgba(255,255,0,0.5)]'}`}></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Live Database Relay</p>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">
                            {syncStatus?.error ? 'Network Interrupted' : `Connected & Synced • ${syncStatus?.time}`}
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                     <button 
                        onClick={() => window.location.reload()}
                        className="flex-1 md:flex-none bg-gray-800 text-white text-[9px] font-black uppercase px-6 py-3 rounded-xl hover:bg-gray-700 transition-all border border-gray-700"
                    >
                        Force Refresh
                    </button>
                    <button 
                        onClick={onDeepRecovery}
                        className="flex-1 md:flex-none bg-lemon text-black text-[9px] font-black uppercase px-6 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(255,255,0,0.2)] transition-all animate-pulse"
                    >
                        Recover 50+ Missing Users
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-[2.5rem] shadow-xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Clients</p>
                    <p className="text-4xl font-black text-white mt-2 tracking-tighter">{users.filter(u => u.status === UserStatus.Approved).length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-[2.5rem] shadow-xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Market Orders</p>
                    <p className="text-4xl font-black text-lemon mt-2 tracking-tighter">{pendingMarketOrders.length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-[2.5rem] shadow-xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Support Inbox</p>
                    <p className="text-4xl font-black text-blue-500 mt-2 tracking-tighter">{tickets.filter(t => t.status === 'Open').length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-[2.5rem] shadow-xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Global Records</p>
                    <p className="text-4xl font-black text-white mt-2 tracking-tighter">{users.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                <div className="p-6 bg-gray-900 rounded-[2.5rem] border border-gray-800 flex flex-col min-h-[400px] shadow-2xl">
                    <h3 className="mb-6 text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <div className="w-2 h-2 bg-lemon rounded-full"></div>
                        Approval Queue
                    </h3>
                    <div className="space-y-4">
                        {pendingUsers.length > 0 ? pendingUsers.map(user => (
                            <div key={user.id} className="p-5 bg-black border border-gray-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-lemon shadow-lg group">
                                <div className="text-center sm:text-left flex-1">
                                    <p className="font-black text-white uppercase text-sm leading-tight group-hover:text-lemon transition-colors">{user.restaurantName}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{user.name} • <span className="text-gray-400">{user.phone}</span></p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => onApproveReject(user.id, 'approve')} className="flex-1 sm:flex-none bg-lemon text-black font-black py-2.5 px-6 rounded-2xl text-[10px] uppercase shadow-lg active:scale-95 transition-all">Approve</button>
                                    <button onClick={() => onApproveReject(user.id, 'reject')} className="flex-1 sm:flex-none bg-gray-800 text-white font-black py-2.5 px-6 rounded-2xl text-[10px] uppercase active:scale-95 transition-all">Reject</button>
                                </div>
                            </div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-20 grayscale">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                <p className="text-center font-black uppercase text-xs tracking-widest italic">All terminals active</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-gray-900 rounded-[2.5rem] border border-gray-800 flex flex-col min-h-[400px] shadow-2xl">
                    <h3 className="mb-6 text-xl font-black text-lemon uppercase tracking-tight flex items-center gap-3 italic">
                        Market Orders
                    </h3>
                    <div className="space-y-4">
                        {pendingMarketOrders.length > 0 ? pendingMarketOrders.map(order => (
                            <div key={order.id} className="p-5 bg-black border border-gray-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-lemon shadow-lg">
                                <div className="text-center sm:text-left flex-1">
                                    <p className="font-black text-lemon uppercase text-sm leading-tight">{order.productName}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{order.restaurantName} • {order.userName}</p>
                                    <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Qty: {order.quantity} • Value: ₹{order.price * order.quantity}</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => onApproveMarketOrder(order)} className="flex-1 sm:flex-none bg-lemon text-black font-black py-2.5 px-6 rounded-2xl text-[10px] uppercase shadow-lg active:scale-95 transition-all">Accept Order</button>
                                </div>
                            </div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-20 grayscale">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                                 <p className="text-center font-black uppercase text-xs tracking-widest italic">No orders pending</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
