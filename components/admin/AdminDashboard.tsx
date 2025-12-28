
import React from 'react';
import { RegisteredUser, UserStatus, StaffUser, SupportTicket, StaffRequirementRequest, StaffApplication } from '../../types';

interface AdminDashboardProps {
    users: RegisteredUser[];
    staffUsers: StaffUser[];
    tickets: SupportTicket[];
    staffRequests: StaffRequirementRequest[];
    staffApplications: StaffApplication[];
    onApproveReject: (userId: number, decision: 'approve' | 'reject') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, staffUsers, tickets, staffRequests, staffApplications, onApproveReject }) => {

    const pendingUsers = users.filter(u => u.status === UserStatus.Pending);
    const pendingStaffSubs = staffUsers.filter(u => u.subscriptionStatus === 'pending');

    // Aggregate activity feed from all channels
    const activityItems = [
        ...pendingUsers.map(u => ({ type: 'Restaurant Reg', title: u.restaurantName, subtitle: `Owner: ${u.name}`, time: 'Pending' })),
        ...pendingStaffSubs.map(u => ({ type: 'Staff Sub', title: u.name, subtitle: `Worker: ${u.phone}`, time: 'Pending' })),
        ...tickets.filter(t => t.status === 'Open').map(t => ({ type: 'Support Ticket', title: t.subject, subtitle: `From: ${t.userName}`, time: 'Open' })),
        ...staffRequests.filter(r => !r.isRead).map(r => ({ type: 'Staff Req', title: r.requirement, subtitle: r.restaurantName, time: 'New' })),
        ...staffApplications.filter(a => !a.isRead).map(a => ({ type: 'Staff Profile', title: a.staffName, subtitle: a.category, time: 'New' })),
    ].sort((a, b) => b.type.localeCompare(a.type));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* System Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Restaurants</p>
                    <p className="text-3xl font-black text-white mt-1">{users.filter(u => u.status === UserStatus.Approved).length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Workers Online</p>
                    <p className="text-3xl font-black text-lemon mt-1">{staffUsers.length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Open Tickets</p>
                    <p className="text-3xl font-black text-blue-500 mt-1">{tickets.filter(t => t.status === 'Open').length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Pending Req/Subs</p>
                    <p className="text-3xl font-black text-green-500 mt-1">{pendingStaffSubs.length + staffRequests.filter(r => !r.isRead).length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Restaurant Approval Quick List */}
                <div className="p-6 bg-gray-900 rounded-3xl border border-gray-800 flex flex-col h-[500px]">
                    <h3 className="mb-6 text-xl font-black text-white uppercase tracking-tight">Restaurant Approvals</h3>
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                        {pendingUsers.length > 0 ? (
                            pendingUsers.map(user => (
                                <div key={user.id} className="p-4 bg-black border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-center sm:text-left">
                                        <p className="font-black text-white uppercase text-sm leading-tight">{user.restaurantName}</p>
                                        <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">{user.name} • {user.phone}</p>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button onClick={() => onApproveReject(user.id, 'approve')} className="flex-1 bg-lemon text-black font-black py-2 px-4 rounded-xl text-[10px] uppercase">Approve</button>
                                        <button onClick={() => onApproveReject(user.id, 'reject')} className="flex-1 bg-gray-800 text-white font-black py-2 px-4 rounded-xl text-[10px] uppercase">Reject</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center opacity-30 grayscale">
                                <p className="text-gray-500 font-black uppercase text-xs">No pending restaurant approvals</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Centralized Notification Feed */}
                <div className="p-6 bg-gray-900 rounded-3xl border border-gray-800 flex flex-col h-[500px]">
                    <h3 className="mb-6 text-xl font-black text-white uppercase tracking-tight">Live Activity Log</h3>
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                        {activityItems.length > 0 ? activityItems.map((item, idx) => (
                            <div key={idx} className="bg-black/50 p-4 rounded-2xl border border-gray-800 flex justify-between items-center group hover:border-lemon/30 transition-all cursor-default">
                                <div className="flex-1 min-w-0 pr-4">
                                    <span className="text-[8px] font-black text-lemon uppercase tracking-widest bg-lemon/10 px-2 py-0.5 rounded-full">{item.type}</span>
                                    <p className="text-white font-bold uppercase text-xs mt-1 truncate">{item.title}</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5 truncate">{item.subtitle}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-[9px] font-black uppercase tracking-tighter ${item.time === 'New' || item.time === 'Open' ? 'text-red-500 animate-pulse' : 'text-lemon'}`}>{item.time}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex items-center justify-center opacity-30 grayscale">
                                <p className="text-gray-500 font-black uppercase text-xs">All quiet. No activity detected.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
